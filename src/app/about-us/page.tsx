import { AboutUs } from "@/components/about-us";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { aboutUsContent, voicesGalleryContent } from "@/lib/data";
import {
  getAboutUsContent,
  getAnnouncementBar,
  getVoicesGallery,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Womania by Dola",
  description:
    "Meet Dola Guha Neogi Roy and discover the story behind Womania — gamcha, khadi & tribal handlooms crafted for the modern woman.",
};

export default function AboutUsPage() {
  const announcement = getAnnouncementBar();
  const aboutContent = getAboutUsContent() ?? aboutUsContent;
  const voices = getVoicesGallery() ?? voicesGalleryContent;

  return (
    <>
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
