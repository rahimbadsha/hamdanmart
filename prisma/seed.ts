/**
 * Development seed data.
 *
 * Idempotent: every write is an upsert keyed on a unique column, so the seed
 * can be re-run safely at any time.
 *
 * Run with: pnpm prisma db seed
 */
import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import argon2 from "argon2";

import { PERMISSIONS } from "../src/lib/constants";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "" });
const db = new PrismaClient({ adapter });

// Dev-only credentials — real admin accounts are created from the dashboard.
const DEV_ADMIN_EMAIL = "admin@hamdanmart.test";
const DEV_ADMIN_PASSWORD = "Admin@12345";

async function seedRolesAndAdmin(): Promise<void> {
  for (const key of PERMISSIONS) {
    await db.permission.upsert({ where: { key }, create: { key }, update: {} });
  }
  const allPermissions = await db.permission.findMany();

  const superAdmin = await db.role.upsert({
    where: { name: "SUPER_ADMIN" },
    create: { name: "SUPER_ADMIN", description: "Full access", isSystem: true },
    update: {},
  });
  const manager = await db.role.upsert({
    where: { name: "MANAGER" },
    create: { name: "MANAGER", description: "Store management", isSystem: true },
    update: {},
  });
  const staff = await db.role.upsert({
    where: { name: "STAFF" },
    create: { name: "STAFF", description: "Read-only access", isSystem: true },
    update: {},
  });

  const managerKeys = allPermissions.filter(
    (p) => p.key !== "admins.manage" && p.key !== "settings.write",
  );
  const staffKeys = allPermissions.filter((p) => p.key.endsWith(".read"));

  const grants: Array<[string, typeof allPermissions]> = [
    [superAdmin.id, allPermissions],
    [manager.id, managerKeys],
    [staff.id, staffKeys],
  ];
  for (const [roleId, permissions] of grants) {
    for (const permission of permissions) {
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permission.id } },
        create: { roleId, permissionId: permission.id },
        update: {},
      });
    }
  }

  await db.adminUser.upsert({
    where: { email: DEV_ADMIN_EMAIL },
    create: {
      email: DEV_ADMIN_EMAIL,
      name: "Store Admin",
      passwordHash: await argon2.hash(DEV_ADMIN_PASSWORD),
      roleId: superAdmin.id,
    },
    update: {},
  });
}

async function seedShippingAndSettings(): Promise<void> {
  // hamdanmart.com charges a flat ৳100 nationwide, 2-4 working days.
  const methods = [
    {
      nameEn: "Nationwide Delivery",
      nameBn: "সারাদেশে ডেলিভারি",
      feePoisha: 10000,
      minDays: 2,
      maxDays: 4,
      sortOrder: 0,
    },
  ];
  for (const method of methods) {
    const existing = await db.shippingMethod.findFirst({
      where: { nameEn: method.nameEn },
    });
    if (existing) {
      await db.shippingMethod.update({ where: { id: existing.id }, data: method });
    } else {
      await db.shippingMethod.create({ data: method });
    }
  }

  const settings: Record<string, string> = {
    "store.nameEn": "HamdanMart",
    "store.nameBn": "হামদান মার্ট",
    "store.supportPhone": "+8801000000000",
    "store.currency": "BDT",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

/**
 * Real catalog imported from hamdanmart.com (data/live-site/catalog-seed.json).
 * The old WordPress site sold the same product in two sizes as separate
 * products; here each design is one product with size variants.
 */
interface CatalogVariant {
  sku: string;
  nameEn: string;
  nameBn: string;
  price: number; // taka
  regular: number | null; // taka, compare-at
  inStock: boolean;
}

interface CatalogProduct {
  slug: string;
  nameEn: string;
  nameBn: string;
  category: string;
  descEn: string;
  descBn: string;
  images: string[];
  variants: CatalogVariant[];
}

const DEFAULT_STOCK = 25;
const OUT_OF_STOCK = 0;

const CATEGORY_SEED = [
  {
    slug: "waterproof-bed-sheet",
    nameEn: "Waterproof Bed Sheet",
    nameBn: "ওয়াটারপ্রুফ বেড শিট",
    sortOrder: 0,
  },
  {
    slug: "cotton-bed-sheet",
    nameEn: "Cotton Bed Sheet",
    nameBn: "কটন বেড শিট",
    sortOrder: 1,
  },
  { slug: "girl-fashion", nameEn: "Girl Fashion", nameBn: "গার্ল ফ্যাশন", sortOrder: 2 },
  { slug: "burka", nameEn: "Burka", nameBn: "বোরকা", sortOrder: 3 },
  { slug: "hijab", nameEn: "Hijab", nameBn: "হিজাব", sortOrder: 4 },
  { slug: "khimar", nameEn: "Khimar", nameBn: "খিমার", sortOrder: 5 },
  { slug: "perfume", nameEn: "Perfume", nameBn: "পারফিউম", sortOrder: 6 },
  { slug: "panjabi", nameEn: "Panjabi", nameBn: "পাঞ্জাবি", sortOrder: 7 },
  { slug: "t-shirt", nameEn: "T-shirt", nameBn: "টি-শার্ট", sortOrder: 8 },
  { slug: "trouser", nameEn: "Trouser", nameBn: "ট্রাউজার", sortOrder: 9 },
];

function loadCatalog(): CatalogProduct[] {
  const path = join(process.cwd(), "data", "live-site", "catalog-seed.json");
  return JSON.parse(readFileSync(path, "utf-8")) as CatalogProduct[];
}

async function seedCatalog(): Promise<void> {
  const categoryIds = new Map<string, string>();
  for (const category of CATEGORY_SEED) {
    const row = await db.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
    categoryIds.set(category.slug, row.id);
  }

  const catalog = loadCatalog();
  // Feature the first product of each brand block for the homepage.
  const featuredSlugs = new Set(catalog.slice(0, 8).map((p) => p.slug));

  for (const product of catalog) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Unknown category: ${product.category}`);

    const defaultVariant = product.variants[0];
    const base = {
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      descriptionEn: product.descEn,
      descriptionBn: product.descBn,
      categoryId,
      basePricePoisha: Math.round(defaultVariant.price * 100),
      compareAtPricePoisha: defaultVariant.regular
        ? Math.round(defaultVariant.regular * 100)
        : null,
      isFeatured: featuredSlugs.has(product.slug),
    };
    const row = await db.product.upsert({
      where: { slug: product.slug },
      create: { slug: product.slug, ...base },
      update: base,
    });

    for (const [index, variant] of product.variants.entries()) {
      const variantData = {
        productId: row.id,
        nameEn: variant.nameEn,
        nameBn: variant.nameBn,
        pricePoisha: Math.round(variant.price * 100),
        compareAtPricePoisha: variant.regular ? Math.round(variant.regular * 100) : null,
        isDefault: index === 0,
        sortOrder: index,
      };
      const variantRow = await db.productVariant.upsert({
        where: { sku: variant.sku },
        create: { sku: variant.sku, ...variantData },
        update: variantData,
      });
      await db.inventory.upsert({
        where: { variantId: variantRow.id },
        create: {
          variantId: variantRow.id,
          quantity: variant.inStock ? DEFAULT_STOCK : OUT_OF_STOCK,
        },
        update: { quantity: variant.inStock ? DEFAULT_STOCK : OUT_OF_STOCK },
      });
    }

    // Product images — remote URLs on the old site until the media manager
    // (Phase 6) migrates them to local/object storage.
    for (const [index, url] of product.images.entries()) {
      const media = await db.media.upsert({
        where: { path: url },
        create: {
          path: url,
          filename: url.split("/").pop() ?? "image.webp",
          mimeType: "image/webp",
          sizeBytes: 0,
          altEn: product.nameEn,
          altBn: product.nameBn,
        },
        update: {},
      });
      await db.productImage.upsert({
        where: { productId_mediaId: { productId: row.id, mediaId: media.id } },
        create: { productId: row.id, mediaId: media.id, sortOrder: index },
        update: { sortOrder: index },
      });
    }
  }
}

async function seedCoupons(): Promise<void> {
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minOrderPoisha: 50000, // ৳500
      maxDiscountPoisha: 10000, // ৳100
      usageLimit: 100,
      perUserLimit: 1,
    },
    update: {},
  });
}

async function main(): Promise<void> {
  await seedRolesAndAdmin();
  await seedShippingAndSettings();
  await seedCatalog();
  await seedCoupons();

  const counts = {
    permissions: await db.permission.count(),
    roles: await db.role.count(),
    adminUsers: await db.adminUser.count(),
    categories: await db.category.count(),
    products: await db.product.count(),
    variants: await db.productVariant.count(),
    shippingMethods: await db.shippingMethod.count(),
    coupons: await db.coupon.count(),
    settings: await db.setting.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`Dev admin login: ${DEV_ADMIN_EMAIL} / ${DEV_ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
