export type VoiceCategory = "client" | "pageant" | "intern" | "studio";

export interface VoiceGalleryItem {
  id: string;
  image: string;
  alt: string;
  category: VoiceCategory;
  caption?: string;
  name?: string;
}

export interface VoicesSectionContent {
  eyebrow: string;
  title: string;
  intro: string;
  items: VoiceGalleryItem[];
}

export const voiceCategoryLabels: Record<
  VoiceCategory | "all",
  string
> = {
  all: "All",
  client: "Clients",
  pageant: "Beauty Pageant",
  intern: "Interns",
  studio: "Studio & Team",
};
