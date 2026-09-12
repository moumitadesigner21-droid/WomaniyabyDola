const { randomUUID } = require("crypto");
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "orders.db");
const db = new Database(dbPath);

const products = [
  {
    id: "saree-35",
    slug: "black-gamcha-border-cotton-saree",
    name: "Black Gamcha Border Cotton Saree",
    description:
      "Solid black cotton saree with vibrant red, white and blue gamcha check borders and matching red blouse — a bold festive drape.",
    price: 2100,
    image: "/products/black-gamcha-border-cotton-saree/01.jpg",
  },
  {
    id: "saree-36",
    slug: "red-checkered-circle-gamcha-saree",
    name: "Red Checkered Circle Gamcha Saree",
    description:
      "Off-white cotton gamcha saree with bold red checkered circles, wide red border and matching checkered pallu — perfect for Durga Puja.",
    price: 2100,
    image: "/products/red-checkered-circle-gamcha-saree/01.jpg",
  },
  {
    id: "saree-37",
    slug: "multicolour-fusion-gamcha-saree-lace",
    name: "Multicolour Fusion Gamcha Saree with Lace",
    description:
      "Contemporary fusion gamcha saree in red, mint green and black panels with delicate lace trim and classic checkered hem.",
    price: 2300,
    image: "/products/multicolour-fusion-gamcha-saree-lace/01.jpg",
  },
  {
    id: "saree-38",
    slug: "red-white-checkered-gamcha-saree",
    name: "Red & White Checkered Gamcha Saree",
    description:
      "Classic handloom gamcha saree in vibrant red and white checks with a plain white body and saw-tooth pallu finish.",
    price: 2100,
    image: "/products/red-white-checkered-gamcha-saree/01.jpg",
  },
  {
    id: "saree-39",
    slug: "red-white-gamcha-saree-tassel-detail",
    name: "Red & White Gamcha Saree with Tassel Detail",
    description:
      "Traditional lal-par gamcha saree with red block-print motifs, broad red border and decorative red pom-pom tassels on the pallu.",
    price: 2100,
    image: "/products/red-white-gamcha-saree-tassel-detail/01.jpg",
  },
];

const insertProduct = db.prepare(`
  INSERT INTO products (
    id, slug, name, description, category_slug, subcategory_slug,
    price, sale_price, sku, stock_quantity, in_stock, enabled, featured,
    is_new, is_bestseller, on_sale, badge_text, fabric, color, care_instructions,
    dimensions, custom_size_note, image, hover_image, image_position, portrait,
    card_background, highlights, tags, sizes, colors, seo_title, seo_description,
    video_url, pallu_image, sort_order, created_at, updated_at
  ) VALUES (
    @id, @slug, @name, @description, 'sarees', 'gamcha-sarees',
    @price, NULL, @sku, 10, 1, 1, 0,
    1, 0, 0, 'NEW', NULL, NULL, NULL,
    NULL, NULL, @image, NULL, NULL, 1,
    NULL, '[]', '[]', '[]', '[]', @name, @description,
    NULL, NULL, 0, @now, @now
  )
`);

const insertImage = db.prepare(`
  INSERT INTO product_images (product_id, url, alt_text, sort_order, image_type)
  VALUES (@productId, @url, @altText, 1, 'gallery')
`);

const exists = db.prepare("SELECT id FROM products WHERE slug = ?");

const now = new Date().toISOString();
let added = 0;

for (const product of products) {
  if (exists.get(product.slug)) {
    console.log(`Skip (exists): ${product.slug}`);
    continue;
  }

  const id = randomUUID();
  insertProduct.run({
    id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    sku: product.id,
    image: product.image,
    now,
  });
  insertImage.run({
    productId: id,
    url: product.image,
    altText: product.name,
  });
  added += 1;
  console.log(`Added: ${product.slug}`);
}

console.log(`Done. ${added} product(s) added.`);
