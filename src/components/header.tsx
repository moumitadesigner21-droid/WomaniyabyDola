import { HeaderClient } from "@/components/header-client";
import { getAppearance, getHeaderNav } from "@/lib/site-chrome";

/** Server shell: loads CMS navigation + logo, renders the interactive header. */
export async function Header() {
  const [links, appearance] = await Promise.all([getHeaderNav(), getAppearance()]);

  return <HeaderClient links={links} logoUrl={appearance.logoUrl} />;
}
