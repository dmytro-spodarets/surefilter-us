// Проверка изображений industries в БД
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkIndustriesImages() {
  console.log('🔍 Проверяем изображения industries...\n');

  // Получаем страницу industries
  const industriesPage = await prisma.page.findFirst({
    where: { slug: 'industries' },
    include: { sections: { include: { section: true } } },
  });

  if (!industriesPage) {
    console.log('❌ Страница /industries не найдена');
    return;
  }

  console.log(`✅ Страница найдена: ${industriesPage.title}`);
  console.log(`📄 Секций: ${industriesPage.sections.length}\n`);

  // Проверяем single_image_hero
  const heroSection = industriesPage.sections.find(
    (ps) => ps.section.type === 'single_image_hero'
  );

  if (heroSection) {
    console.log('🖼️  single_image_hero:');
    console.log(`   image: ${heroSection.section.data.image || 'НЕТ'}`);
  } else {
    console.log('❌ single_image_hero не найдена');
  }

  // Проверяем industries_list
  const listSection = industriesPage.sections.find(
    (ps) => ps.section.type === 'industries_list'
  );

  if (listSection) {
    console.log('\n📋 industries_list найдена');
  } else {
    console.log('\n❌ industries_list не найдена');
  }

  // Получаем все страницы индустрий
  console.log('\n🏭 Страницы индустрий:');
  const industryPages = await prisma.page.findMany({
    where: { type: 'INDUSTRY' },
    include: { sections: { include: { section: true } } },
    orderBy: { slug: 'asc' },
  });

  industryPages.forEach((page) => {
    const meta = page.sections.find(
      (ps) => ps.section.type === 'listing_card_meta'
    )?.section.data;

    console.log(`\n  📄 ${page.slug}`);
    console.log(`     title: ${page.title}`);
    console.log(`     listImage: ${meta?.listImage || 'НЕТ'}`);
  });

  await prisma.$disconnect();
}

checkIndustriesImages().catch(console.error);
