import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Top-level category renames / additions
const TOP_LEVEL = {
  productCatalogs: {
    fromSlug: 'catalogs',
    name: 'Product Catalogs',
    slug: 'product-catalogs',
    description: 'OEM-style product catalogs by brand and equipment type.',
    icon: 'DocumentTextIcon',
    color: 'text-red-600',
    position: 1,
  },
  crossReferences: {
    name: 'Cross-References',
    slug: 'cross-references',
    description: 'Filter cross-reference guides mapping competitor part numbers to Sure Filter® equivalents.',
    icon: 'BookOpenIcon',
    color: 'text-sure-blue-600',
    position: 2,
  },
};

const SUBCATEGORIES = [
  {
    name: 'Forklifts',
    slug: 'forklifts',
    position: 1,
    description: 'Filtration catalogs for forklift OEMs.',
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    position: 2,
    description: 'Filtration catalogs for passenger and light-duty automotive applications.',
  },
  {
    name: 'Heavy Duty',
    slug: 'heavy-duty',
    position: 3,
    description: 'Filtration catalogs for construction and heavy machinery.',
  },
  {
    name: 'Trucks & Buses',
    slug: 'trucks-and-buses',
    position: 4,
    description: 'Filtration catalogs for truck and bus OEMs.',
  },
  {
    name: 'Marine & Moto',
    slug: 'marine-and-moto',
    position: 5,
    description: 'Filtration catalogs for marine engines and motorcycles.',
  },
];

// Resources to move into the Forklifts subcategory by current slug
const FORKLIFT_RESOURCE_SLUGS = [
  'sure-filter-bobcat',
  'sure-filter-caterpillar',
  'sure-filter-clark',
  'sure-filter-doosan',
  'sure-filter-hyster',
  'sure-filter-komatsu',
  'sure-filter-linde',
  'sure-filter-mitsubishi',
  'sure-filter-nissan',
  'sure-filter-toyota',
  'sure-filter-yale-towne',
];

const CROSS_REF_RESOURCE_SLUG = 'sure-filter-cross-references-v23';

async function upsertTopLevel(spec) {
  const { fromSlug, name, slug, description, icon, color, position } = spec;

  // If we're renaming (e.g., catalogs → product-catalogs), find by old slug first
  if (fromSlug) {
    const existing = await prisma.resourceCategory.findUnique({ where: { slug: fromSlug } });
    if (existing) {
      return prisma.resourceCategory.update({
        where: { id: existing.id },
        data: { name, slug, description, icon, color, position, parentId: null, isActive: true },
      });
    }
  }

  // Otherwise upsert by target slug
  return prisma.resourceCategory.upsert({
    where: { slug },
    update: { name, description, icon, color, position, parentId: null, isActive: true },
    create: { name, slug, description, icon, color, position, isActive: true },
  });
}

async function main() {
  console.log('1. Renaming "Catalogs" → "Product Catalogs"...');
  const productCatalogs = await upsertTopLevel(TOP_LEVEL.productCatalogs);
  console.log('   ✓', productCatalogs.name, '(slug:', productCatalogs.slug + ')');

  console.log('2. Creating "Cross-References" top-level category...');
  const crossRefs = await upsertTopLevel(TOP_LEVEL.crossReferences);
  console.log('   ✓', crossRefs.name, '(slug:', crossRefs.slug + ')');

  console.log('3. Creating 5 subcategories under Product Catalogs...');
  const subcategoryByslug = {};
  for (const sub of SUBCATEGORIES) {
    const created = await prisma.resourceCategory.upsert({
      where: { slug: sub.slug },
      update: {
        name: sub.name,
        description: sub.description,
        position: sub.position,
        parentId: productCatalogs.id,
        isActive: true,
      },
      create: {
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        position: sub.position,
        parentId: productCatalogs.id,
        isActive: true,
      },
    });
    subcategoryByslug[sub.slug] = created;
    console.log('   ✓', sub.name);
  }

  console.log('4. Moving 11 forklift resources → Forklifts subcategory...');
  const forklifts = subcategoryByslug['forklifts'];
  for (const slug of FORKLIFT_RESOURCE_SLUGS) {
    const res = await prisma.resource.findUnique({ where: { slug } });
    if (!res) {
      console.log(`   ⚠️  resource not found: ${slug}`);
      continue;
    }
    if (res.categoryId === forklifts.id) {
      console.log(`   = already in Forklifts: ${slug}`);
      continue;
    }
    await prisma.resource.update({
      where: { id: res.id },
      data: { categoryId: forklifts.id },
    });
    console.log(`   ✓ moved ${slug}`);
  }

  console.log('5. Moving Cross-References v23 resource → Cross-References category...');
  const crossRefRes = await prisma.resource.findUnique({ where: { slug: CROSS_REF_RESOURCE_SLUG } });
  if (!crossRefRes) {
    console.log(`   ⚠️  resource not found: ${CROSS_REF_RESOURCE_SLUG}`);
  } else if (crossRefRes.categoryId === crossRefs.id) {
    console.log('   = already in Cross-References');
  } else {
    await prisma.resource.update({
      where: { id: crossRefRes.id },
      data: { categoryId: crossRefs.id },
    });
    console.log('   ✓ moved', CROSS_REF_RESOURCE_SLUG);
  }

  console.log('\nFinal category tree:');
  const tree = await prisma.resourceCategory.findMany({
    where: { parentId: null, isActive: true },
    include: {
      _count: { select: { resources: true } },
      children: {
        include: { _count: { select: { resources: true } } },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { position: 'asc' },
  });
  for (const c of tree) {
    console.log(`  ${c.name} [/${c.slug}] — ${c._count.resources} resources`);
    for (const child of c.children) {
      console.log(`    └── ${child.name} [/${c.slug}/${child.slug}] — ${child._count.resources} resources`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
