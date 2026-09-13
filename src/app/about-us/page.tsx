import { AboutUs } from "@/components/about-us";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { aboutUsContent, voicesGalleryContent } from "@/lib/data";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import {
  getAboutUsContent,
  getAnnouncementBar,
  getVoicesGallery,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return buildPageMetadata("about", {
    title: "About Us",
    description:
      "Meet Dola Guha Neogi Roy and discover the story behind Womania — gamcha, khadi & tribal handlooms crafted for the modern woman.",
    path: "/about-us",
  });
}

export default async function AboutUsPage() {
  const [announcement, cmsAbout, cmsVoices] = await Promise.all([
    getAnnouncementBar(),
    getAboutUsContent(),
    getVoicesGallery(),
  ]);
  const aboutContent = cmsAbout ?? aboutUsContent;
  const voices = cmsVoices ?? voicesGalleryContent;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About Us", path: "/about-us" }])} />
      <AnnouncementBar enabled={announcement.enabled} text={announcement.text} />
      <Header />
      <main>
        <AboutUs content={aboutContent} voices={voices} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
