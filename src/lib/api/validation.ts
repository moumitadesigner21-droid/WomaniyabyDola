import { NextResponse } from "next/server";
import type { z } from "zod";

export type ParsedBody<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/** Parses and validates a JSON body; on failure returns a ready 400 response. */
export async function parseJsonBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<ParsedBody<z.output<S>>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return {
      ok: false,
      response: NextResponse.json(
        { error: issues[0]?.message ?? "Invalid request.", issues },
        { status: 400 },
      ),
    };
  }

  return { ok: true, data: result.data };
}

type RouteContext = { params: Promise<Record<string, string>> };
type Handler<C> = (request: Request, context: C) => Promise<Response>;

/**
 * Wraps a route handler so thrown errors (SQLite constraint failures,
 * bad input, etc.) become a JSON 500 instead of an unhandled crash.
 */
export function withErrorHandling<C = RouteContext>(
  handler: Handler<C>,
): Handler<C> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected server error.";
      console.error(`[${request.method} ${new URL(request.url).pathname}]`, error);

      const isConstraint = /UNIQUE constraint|NOT NULL constraint/.test(message);
      return NextResponse.json(
        { error: isConstraint ? humanizeSqliteError(message) : message },
        { status: isConstraint ? 409 : 500 },
      );
    }
  };
}

function humanizeSqliteError(message: string): string {
  const unique = message.match(/UNIQUE constraint failed: \w+\.(\w+)/);
  if (unique) return `A record with that ${unique[1]} already exists.`;
  const notNull = message.match(/NOT NULL constraint failed: \w+\.(\w+)/);
  if (notNull) return `${notNull[1]} is required.`;
  return message;
}
