const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "..", "data", "orders.db");
const db = new Database(dbPath);

const voices = {
  eyebrow: "Voices of Womania",
  title: "Real women. Real stories.",
  intro:
    "Clients in their favourite drapes, pageant contestants in custom gowns, and interns learning the craft at our Jalpaiguri studio — this is the community behind every stitch.",
  items: [
    {
      id: "voice-01",
      image: "/testimonials/voices/01-client-studio-portrait.jpg",
      alt: "Womania client in a floral open jacket at a studio shoot",
      category: "client",
      caption: "Everyday elegance in Womania",
    },
    {
      id: "voice-02",
      image: "/testimonials/voices/02-clients-gamcha-pair.jpg",
      alt: "Two clients wearing gamcha sarees and matching accessories",
      category: "client",
      caption: "Gamcha sisters at an event",
    },
    {
      id: "voice-03",
      image: "/testimonials/voices/03-client-goddess-saree.jpg",
      alt: "Client in a hand-painted goddess motif saree",
      category: "client",
      caption: "Festive art saree",
    },
    {
      id: "voice-04",
      image: "/testimonials/voices/04-client-gamcha-event.jpg",
      alt: "Client in red and white gamcha saree at a cultural programme",
      category: "client",
      caption: "Gamcha on stage",
    },
    {
      id: "voice-05",
      image: "/testimonials/voices/05-client-gamcha-jewelry.jpg",
      alt: "Client in gamcha saree with shell jewellery",
      category: "client",
      caption: "Checks, shells & confidence",
    },
    {
      id: "voice-06",
      image: "/testimonials/voices/06-studio-diwali-team.jpg",
      alt: "Team celebrating Diwali at the Womania studio",
      category: "studio",
      caption: "Studio diya celebration",
    },
    {
      id: "voice-07",
      image: "/testimonials/voices/07-intern-heritage-experience.jpg",
      alt: "Intern experiencing traditional grain pounding at a heritage site",
      category: "intern",
      caption: "Learning beyond the studio",
    },
    {
      id: "voice-08",
      image: "/testimonials/voices/08-studio-interns-team.jpg",
      alt: "Interns and team at the design studio",
      category: "intern",
      caption: "Our intern family",
    },
    {
      id: "voice-09",
      image: "/testimonials/voices/09-intern-workshop.jpg",
      alt: "Intern at a rural workshop visit",
      category: "intern",
      caption: "Field visit with the team",
    },
    {
      id: "voice-10",
      image: "/testimonials/voices/10-pageant-blue-gown.jpg",
      alt: "Pageant contestant in a custom blue Womania gown",
      category: "pageant",
      caption: "Custom pageant gown",
    },
    {
      id: "voice-11",
      image: "/testimonials/voices/11-interns-studio-selfie.jpg",
      alt: "Interns smiling together inside the studio",
      category: "intern",
      caption: "Behind the sewing machine",
    },
    {
      id: "voice-12",
      image: "/testimonials/voices/12-pageant-red-gown.jpg",
      alt: "Pageant contestant in a red Womania gown with brand badge",
      category: "pageant",
      caption: "Womania on the runway",
    },
    {
      id: "voice-13",
      image: "/testimonials/voices/13-pageant-pink-yellow.jpg",
      alt: "Pageant contestant in pink and yellow custom outfit",
      category: "pageant",
      caption: "Bold colour on stage",
    },
    {
      id: "voice-14",
      image: "/testimonials/voices/14-pageant-orange-green.jpg",
      alt: "Pageant contestant in orange and green handloom gown",
      category: "pageant",
      caption: "Handloom pageant look",
    },
    {
      id: "voice-15",
      image: "/testimonials/voices/15-client-embroidered-jacket.jpg",
      alt: "Client in black gold-embroidered Womania jacket",
      category: "client",
      caption: "Embroidered statement piece",
    },
    {
      id: "voice-16",
      image: "/testimonials/voices/16-studio-team-selfie.jpg",
      alt: "Dola and team selfie at Womania design studio",
      category: "studio",
      caption: "The design studio",
    },
    {
      id: "voice-17",
      image: "/testimonials/voices/17-client-art-saree.jpg",
      alt: "Client in yellow art saree with fish motifs and matching jacket",
      category: "client",
      caption: "Hand-painted fish motifs",
    },
    {
      id: "voice-18",
      image: "/testimonials/voices/18-client-gamcha-shrug.jpg",
      alt: "Client giving a thumbs up in a gamcha-pattern shrug",
      category: "client",
      caption: "Gamcha shrug, real life",
    },
  ],
};

const updatedTestimonials = [
  {
    quote:
      "My gamcha saree from Womania turned every head at the pandal — the checks, the drape, everything felt so me.",
    name: "Womania Client",
    city: "West Bengal",
    rating: 5,
  },
  {
    quote:
      "Wearing a custom Womania gown on the pageant stage felt like carrying our handloom story with pride.",
    name: "Pageant Contestant",
    city: "Designed by Dola",
    rating: 5,
  },
  {
    quote:
      "Interning at the studio taught me how gamcha and khadi become real garments women love to wear.",
    name: "Design Intern",
    city: "Jalpaiguri Studio",
    rating: 5,
  },
  {
    quote:
      "Finally found a brand that reflects my roots and modern taste. Totally in love with Womania!",
    name: "Priya S.",
    city: "Guwahati",
    rating: 5,
  },
];

const now = new Date().toISOString();
const upsert = db.prepare(`
  INSERT INTO site_content (key, value, updated_at)
  VALUES (@key, @value, @now)
  ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @now
`);

upsert.run({
  key: "voices_gallery",
  value: JSON.stringify(voices),
  now,
});
upsert.run({
  key: "testimonials",
  value: JSON.stringify(updatedTestimonials),
  now,
});

console.log("Updated voices_gallery and testimonials in site_content.");
