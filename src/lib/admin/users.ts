import { execute, nowIso, queryOne, uuid, type Row } from "@/lib/db";
import { hashPassword, secretsMatch, verifyPassword } from "@/lib/admin/password";

export interface AdminUser {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export const DEFAULT_ADMIN_USERNAME = "admin";

function rowToUser(row: Row): AdminUser {
  return {
    id: String(row.id),
    username: String(row.username),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
  };
}

export async function getAdminUserByUsername(
  username: string,
): Promise<(AdminUser & { passwordHash: string }) | null> {
  const row = await queryOne(
    "SELECT * FROM admin_users WHERE username = ?",
    username.trim().toLowerCase(),
  );
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: String(row.password_hash) };
}

export async function countAdminUsers(): Promise<number> {
  const row = await queryOne<{ c: number }>("SELECT COUNT(*) AS c FROM admin_users");
  return Number(row?.c ?? 0);
}

export async function createAdminUser(
  username: string,
  password: string,
): Promise<AdminUser> {
  const id = uuid();
  const now = nowIso();
  await execute(
    `INSERT INTO admin_users (id, username, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    id,
    username.trim().toLowerCase(),
    await hashPassword(password),
    now,
    now,
  );
  return { id, username, createdAt: now, updatedAt: now, lastLoginAt: null };
}

export async function setAdminPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  await execute(
    "UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?",
    await hashPassword(newPassword),
    nowIso(),
    userId,
  );
}

export async function touchLastLogin(userId: string): Promise<void> {
  await execute("UPDATE admin_users SET last_login_at = ? WHERE id = ?", nowIso(), userId);
}

/**
 * Verifies a login. If no admin user exists yet, the `ADMIN_PASSWORD` secret
 * bootstraps the first account (`admin`) so a fresh deployment can be entered
 * without touching the database by hand. Once a row exists the secret is ignored.
 */
export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  const user = await getAdminUserByUsername(username);
  if (user) {
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return null;
    await touchLastLogin(user.id);
    return user;
  }

  if ((await countAdminUsers()) > 0) return null;

  const bootstrap = process.env.ADMIN_PASSWORD?.trim();
  if (
    !bootstrap ||
    username.trim().toLowerCase() !== DEFAULT_ADMIN_USERNAME ||
    !secretsMatch(password, bootstrap)
  ) {
    return null;
  }

  const created = await createAdminUser(DEFAULT_ADMIN_USERNAME, password);
  await touchLastLogin(created.id);
  return created;
}

export async function changeAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await queryOne("SELECT * FROM admin_users WHERE id = ?", userId);
  if (!row) return { ok: false, error: "Account not found." };

  const valid = await verifyPassword(currentPassword, String(row.password_hash));
  if (!valid) return { ok: false, error: "Current password is incorrect." };

  await setAdminPassword(userId, newPassword);
  return { ok: true };
}
