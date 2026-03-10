import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORY_NAMES = [
  "Nails & Fasteners",
  "Cement",
  "Paint & Finishes",
  "Tools",
  "Plumbing",
  "Electrical",
  "Safety Gear",
  "Timber & Boards",
];

const UNITS: { name: string; note?: string }[] = [
  { name: "piece", note: "Single item (e.g. hammer, bulb)" },
  { name: "box", note: "Box with fixed quantity (e.g. nails)" },
  { name: "bag", note: "Bag (e.g. cement, gypsum)" },
  { name: "kg", note: "Kilogram (e.g. loose nails)" },
  { name: "length", note: "Per length (e.g. pipe, timber)" },
  { name: "tin", note: "Tin of paint" },
  { name: "bucket", note: "Bucket (large paint, compound)" },
  { name: "meter", note: "Per meter" },
  { name: "litre", note: "Per litre" },
  { name: "roll", note: "Roll" },
];

type ProductSeed = {
  code: string;
  name: string;
  category: string;
  unit: string;
  packInfo?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel?: number;
};

const PRODUCTS: ProductSeed[] = [
  { code: "NL-3IN-100", name: "3-inch Nails (Box of 100)", category: "Nails & Fasteners", unit: "box", packInfo: "1 box = 100 pieces", costPrice: 4200, sellingPrice: 6500, stock: 24 },
  { code: "NL-4IN-100", name: "4-inch Nails (Box of 100)", category: "Nails & Fasteners", unit: "box", packInfo: "1 box = 100 pieces", costPrice: 4600, sellingPrice: 7000, stock: 18 },
  { code: "NL-RF-1KG", name: "Roofing Nails (1kg)", category: "Nails & Fasteners", unit: "kg", costPrice: 5500, sellingPrice: 8500, stock: 35 },
  { code: "CM-50KG", name: "Cement 50kg", category: "Cement", unit: "bag", costPrice: 12000, sellingPrice: 17000, stock: 42 },
  { code: "CM-25KG", name: "Cement 25kg", category: "Cement", unit: "bag", costPrice: 6500, sellingPrice: 9500, stock: 27 },
  { code: "PT-WH-20L", name: "White Emulsion Paint 20L", category: "Paint & Finishes", unit: "bucket", costPrice: 31000, sellingPrice: 42000, stock: 12 },
  { code: "PT-GL-BLK-4L", name: "Gloss Paint Black 4L", category: "Paint & Finishes", unit: "tin", costPrice: 15500, sellingPrice: 21000, stock: 9 },
  { code: "HM-STL", name: "Hammer – Steel Handle", category: "Tools", unit: "piece", costPrice: 8000, sellingPrice: 12000, stock: 8 },
  { code: "TP-5M", name: "Measuring Tape 5m", category: "Tools", unit: "piece", costPrice: 6000, sellingPrice: 9000, stock: 15 },
  { code: "SP-ADJ-12", name: "Adjustable Spanner 12\"", category: "Tools", unit: "piece", costPrice: 12000, sellingPrice: 18000, stock: 6 },
  { code: "PV-1IN-3M", name: "PVC Pipe 1\" (3m)", category: "Plumbing", unit: "length", costPrice: 3500, sellingPrice: 5000, stock: 60 },
  { code: "PV-EL-1IN", name: "PVC Elbow 1\"", category: "Plumbing", unit: "piece", costPrice: 900, sellingPrice: 1500, stock: 90 },
  { code: "GI-3Q-6M", name: "GI Pipe 3/4\" (6m)", category: "Plumbing", unit: "length", costPrice: 16500, sellingPrice: 23000, stock: 22 },
  { code: "EL-SW-1G", name: "Single Switch – White", category: "Electrical", unit: "piece", costPrice: 1600, sellingPrice: 2500, stock: 55 },
  { code: "EL-SK-2G", name: "Double Socket – White", category: "Electrical", unit: "piece", costPrice: 4200, sellingPrice: 6500, stock: 40 },
  { code: "EL-BLB-9W", name: "Bulb LED 9W", category: "Electrical", unit: "piece", costPrice: 2000, sellingPrice: 3000, stock: 120 },
];

async function main() {
  const password = "pos1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username: "tarimo" },
    update: { passwordHash, name: "Tarimo", role: "ADMIN" },
    create: {
      name: "Tarimo",
      username: "tarimo",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin user 'tarimo' created/updated.");

  for (const name of CATEGORY_NAMES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Categories seeded.");

  for (const u of UNITS) {
    await prisma.unit.upsert({
      where: { name: u.name },
      update: { note: u.note ?? null },
      create: { name: u.name, note: u.note ?? null },
    });
  }
  console.log("Units seeded.");

  const categoryIds = await prisma.category.findMany({ select: { id: true, name: true } });
  const categoryByName = Object.fromEntries(categoryIds.map((c) => [c.name, c.id]));

  for (const p of PRODUCTS) {
    const categoryId = categoryByName[p.category];
    if (categoryId == null) throw new Error(`Category not found: ${p.category}`);

    await prisma.product.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        categoryId,
        unit: p.unit,
        packInfo: p.packInfo ?? null,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        reorderLevel: p.reorderLevel ?? 20,
      },
      create: {
        code: p.code,
        name: p.name,
        categoryId,
        unit: p.unit,
        packInfo: p.packInfo ?? null,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        reorderLevel: p.reorderLevel ?? 20,
      },
    });
  }
  console.log("Products seeded.");
  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
