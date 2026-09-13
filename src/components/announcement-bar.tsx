import { getAnnouncement } from "@/lib/site-chrome";

interface AnnouncementBarProps {
  enabled?: boolean;
  text?: string;
}

/** Reads the CMS `announcement_bar` blob unless explicit props are passed. */
export async function AnnouncementBar(props: AnnouncementBarProps) {
  const { enabled, text } =
    props.enabled === undefined && props.text === undefined
      ? await getAnnouncement()
      : { enabled: props.enabled ?? true, text: props.text ?? "" };

  if (!enabled || !text) return null;

  return (
    <div className="bg-maroon text-ivory text-center text-xs sm:text-sm tracking-wide py-2.5 px-4">
      <p>{text}</p>
    </div>
  );
}
