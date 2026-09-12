interface AnnouncementBarProps {
  enabled?: boolean;
  text?: string;
}

export function AnnouncementBar({
  enabled = true,
  text = "",
}: AnnouncementBarProps) {
  if (!enabled || !text) return null;

  return (
    <div className="bg-maroon text-ivory text-center text-xs sm:text-sm tracking-wide py-2.5 px-4">
      <p>{text}</p>
    </div>
  );
}
