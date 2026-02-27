import type { ProductRecord } from "@/lib/products-db";
import { PRODUCTS_TABLE } from "@/lib/products-db";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category: ProductRecord["category"];
  subcategory?: string | null;
  shortDescription: string;
  description: string;
  scent?: string | null;
  priceEur: string | number;
  stock: number;
};

type ProductImageRow = {
  productId: number;
  imageUrl: string;
};

const FALLBACK_PRODUCT_IMAGE = "/img/products/placeholder-product.svg";

function withImages(product: ProductRecord, imagesByProduct: Map<number, string[]>) {
  const dbImages = imagesByProduct.get(product.id) ?? [];
  const normalizedImages = dbImages
    .map((imageUrl) => imageUrl.trim())
    .filter((imageUrl) => imageUrl.length > 0);

  return {
    ...product,
    images: normalizedImages.length > 0 ? normalizedImages : [FALLBACK_PRODUCT_IMAGE],
  };
}

function mapProductRow(row: ProductRow): ProductRecord {
  const normalizedSubcategory = row.subcategory?.trim() ?? "";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: normalizedSubcategory.length > 0 ? normalizedSubcategory : undefined,
    images: [],
    shortDescription: row.shortDescription,
    description: row.description,
    scent: row.scent?.trim() ?? "",
    material: "",
    duration: "",
    priceEur: Number(row.priceEur),
    stock: row.stock,
    featured: false,
  };
}

async function getSqlClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  const { sql } = await import("@/lib/db");
  return sql;
}

function isMissingColumnError(error: unknown, columnName: string) {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { code?: string; message?: string };
  if (maybe.code !== "42703") return false;
  if (typeof maybe.message !== "string") return false;
  return maybe.message.includes(`"${columnName}"`);
}

async function readProductRows(sql: Awaited<ReturnType<typeof getSqlClient>>) {
  if (!sql) return [];

  try {
    return await sql<ProductRow[]>`
      select
        id,
        slug,
        name,
        category,
        subcategory,
        short_description as "shortDescription",
        description,
        scent,
        price_eur as "priceEur",
        stock
      from products
      order by id asc
    `;
  } catch (error) {
    const isScentMissing = isMissingColumnError(error, "scent");
    const isSubcategoryMissing = isMissingColumnError(error, "subcategory");

    if (!isScentMissing && !isSubcategoryMissing) {
      throw error;
    }

    if (isScentMissing && isSubcategoryMissing) {
      return await sql<ProductRow[]>`
        select
          id,
          slug,
          name,
          category,
          short_description as "shortDescription",
          description,
          price_eur as "priceEur",
          stock
        from products
        order by id asc
      `;
    }

    if (isScentMissing) {
      try {
        return await sql<ProductRow[]>`
          select
            id,
            slug,
            name,
            category,
            subcategory,
            short_description as "shortDescription",
            description,
            price_eur as "priceEur",
            stock
          from products
          order by id asc
        `;
      } catch (fallbackError) {
        if (!isMissingColumnError(fallbackError, "subcategory")) {
          throw fallbackError;
        }

        return await sql<ProductRow[]>`
          select
            id,
            slug,
            name,
            category,
            short_description as "shortDescription",
            description,
            price_eur as "priceEur",
            stock
          from products
          order by id asc
        `;
      }
    }

    try {
      return await sql<ProductRow[]>`
        select
          id,
          slug,
          name,
          category,
          short_description as "shortDescription",
          description,
          scent,
          price_eur as "priceEur",
          stock
        from products
        order by id asc
      `;
    } catch (fallbackError) {
      if (!isMissingColumnError(fallbackError, "scent")) {
        throw fallbackError;
      }

      return await sql<ProductRow[]>`
        select
          id,
          slug,
          name,
          category,
          short_description as "shortDescription",
          description,
          price_eur as "priceEur",
          stock
        from products
        order by id asc
      `;
    }
  }
}

async function readProductsFromDb(): Promise<ProductRecord[] | null> {
  const sql = await getSqlClient();
  if (!sql) return null;

  const productRows = await readProductRows(sql);

  if (productRows.length === 0) return [];

  const ids = productRows.map((row) => row.id);
  const imageRows = await sql<ProductImageRow[]>`
    select
      product_id as "productId",
      image_url as "imageUrl"
    from product_images
    where product_id = any(${ids})
    order by product_id asc, sort_order asc
  `;

  const imagesByProduct = new Map<number, string[]>();
  for (const imageRow of imageRows) {
    const existing = imagesByProduct.get(imageRow.productId) ?? [];
    existing.push(imageRow.imageUrl);
    imagesByProduct.set(imageRow.productId, existing);
  }

  return productRows.map((row) => withImages(mapProductRow(row), imagesByProduct));
}

export async function getAllProductsFromStore(): Promise<ProductRecord[]> {
  try {
    const fromDb = await readProductsFromDb();
    if (fromDb) return fromDb;
  } catch (error) {
    console.error("Failed to load products from database, falling back to local table.", error);
    // Keep storefront available with local fallback if DB is temporarily unavailable.
  }

  return PRODUCTS_TABLE;
}

export async function getProductBySlugFromStore(slug: string): Promise<ProductRecord | undefined> {
  const products = await getAllProductsFromStore();
  return products.find((product) => product.slug === slug);
}
