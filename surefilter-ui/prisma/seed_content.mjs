import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function ensureHomePage() {
  const slug = 'home';
  let page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    page = await prisma.page.create({
      data: {
        slug,
        title: 'Sure Filter — Home',
        description: 'Home page',
      },
    });
  }

  // Upsert hero_full section for home
  const existing = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: { position: 'asc' }, include: { section: true } } },
  });

  const heroPayload = {
    badge: 'Wholesale Heavy-Duty Solutions',
    titlePrefix: 'Filters for',
    titleHighlight: 'Extreme Machines',
    subtitle:
      "Sure Filter® — your guarantee of reliability for the world's toughest vehicles and equipment.",
    image: '/images/image-4.jpg',
  };

  const existingHero = existing?.sections.find((s) => s.section.type === 'hero_full');
  if (existingHero) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      await prisma.section.update({ where: { id: existingHero.section.id }, data: { data: heroPayload } });
      console.log('Updated existing home hero section');
    } else {
      console.log('Skip hero_full (exists)');
    }
  } else {
    const hero = await prisma.section.create({ data: { type: 'hero_full', data: heroPayload } });
    const last = await prisma.pageSection.findFirst({
      where: { pageId: page.id },
      orderBy: { position: 'desc' },
    });
    const position = (last?.position ?? 0) + 1;
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: hero.id, position } });
    console.log('Created new home hero section');
  }

  // Upsert featured_products for home using current static data
  const featuredPayload = {
    title: 'Featured Products',
    description: 'Discover our most popular filtration solutions for heavy-duty applications',
    fallbackHref: '/catalog',
    items: [
      { name: 'Heavy Duty Air Filter', description: 'Premium air filtration for extreme conditions', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80', category: 'Air Filters', href: '/filters/SFO241' },
      { name: 'Oil Filter Pro Series', description: 'Advanced oil filtration technology', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80', category: 'Oil Filters', href: '/filters/SFO241' },
      { name: 'Fuel Filter Elite', description: 'Ultra-clean fuel delivery system', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&q=80', category: 'Fuel Filters', href: '/filters/SFO241' },
      { name: 'Hydraulic Filter Max', description: 'Heavy-duty hydraulic protection', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop&q=80', category: 'Hydraulic Filters', href: '/filters/SFO241' },
      { name: 'Cabin Air Filter Plus', description: 'Clean air for operator comfort', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&q=80', category: 'Cabin Filters', href: '/filters/SFO241' },
      { name: 'Transmission Filter Pro', description: 'Reliable transmission protection', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop&q=80', category: 'Transmission Filters', href: '/filters/SFO241' },
      { name: 'Coolant Filter Supreme', description: 'Optimal engine cooling protection', image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&q=80', category: 'Coolant Filters', href: '/filters/SFO241' },
      { name: 'Water Filter Advanced', description: 'Pure water filtration technology', image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=400&h=300&fit=crop&q=80', category: 'Water Filters', href: '/filters/SFO241' },
    ],
  };

  const existingFeatured = existing?.sections.find((s) => s.section.type === 'featured_products');
  if (existingFeatured) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      await prisma.section.update({ where: { id: existingFeatured.section.id }, data: { data: featuredPayload } });
      console.log('Updated existing featured_products');
    } else {
      console.log('Skip featured_products (exists)');
    }
  } else {
    const feat = await prisma.section.create({ data: { type: 'featured_products', data: featuredPayload } });
    const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
    const position = (last?.position ?? 0) + 1;
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: feat.id, position } });
    console.log('Created featured_products');
  }

  // Upsert why_choose section
  const whyPayload = {
    title: 'Why Choose Sure Filter®?',
    description: 'Experience the difference with our premium filtration solutions designed for extreme performance.',
    items: [
      { title: 'Premium Quality', text: 'Manufactured with the highest quality materials and precision engineering.', icon: 'CheckCircleIcon' },
      { title: 'Global Coverage', text: 'Comprehensive range covering 8,000+ SKUs for worldwide applications.', icon: 'GlobeAltIcon' },
      { title: 'Expert Support', text: 'Technical expertise and customer service backed by 20+ years of experience.', icon: 'UserGroupIcon' },
    ],
  };
  const existingWhy = existing?.sections.find((s) => s.section.type === 'why_choose');
  if (existingWhy) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      await prisma.section.update({ where: { id: existingWhy.section.id }, data: { data: whyPayload } });
      console.log('Updated existing why_choose');
    } else {
      console.log('Skip why_choose (exists)');
    }
  } else {
    const why = await prisma.section.create({ data: { type: 'why_choose', data: whyPayload } });
    const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
    const position = (last?.position ?? 0) + 1;
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: why.id, position } });
    console.log('Created why_choose');
  }

  // Upsert quick_search section
  const quickPayload = {
    title: 'Find Your Filter Fast',
    description: 'Enter OEM number or competitor reference to find the right filter',
    placeholder: 'Enter OEM number or competitor reference...',
    ctaLabel: 'Ask our team',
    ctaHref: '#',
  };
  const existingQuick = existing?.sections.find((s) => s.section.type === 'quick_search');
  if (existingQuick) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      await prisma.section.update({ where: { id: existingQuick.section.id }, data: { data: quickPayload } });
      console.log('Updated existing quick_search');
    } else {
      console.log('Skip quick_search (exists)');
    }
  } else {
    const quick = await prisma.section.create({ data: { type: 'quick_search', data: quickPayload } });
    const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
    const position = (last?.position ?? 0) + 1;
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: quick.id, position } });
    console.log('Created quick_search');
  }

  // Upsert industries section
  const industriesPayload = {
    title: 'Industries We Serve',
    description: 'Comprehensive filtration solutions for every heavy-duty application',
    items: [
      { name: 'On-Highway', description: 'Trucks, buses, and commercial vehicles', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=300&fit=crop&q=80', href: '/industries/on-highway' },
      { name: 'Agriculture', description: 'Tractors, harvesters, and farm equipment', image: 'https://images.unsplash.com/photo-1500937386664-40aa08e78837?w=400&h=300&fit=crop&q=80', href: '/industries/agriculture' },
      { name: 'Rental Equipment', description: 'Construction and industrial rental fleets', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&q=80', href: '/industries/rental-equipment' },
      { name: 'Construction', description: 'Excavators, bulldozers, and heavy machinery', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&q=80', href: '/industries/construction' },
      { name: 'Mining', description: 'Open-pit and underground equipment', image: '/images/image-2.jpg', href: '/industries/mining' },
      { name: 'Marine', description: 'Commercial vessels and port equipment', image: 'https://images.unsplash.com/photo-1500462918059-b1c0cb512f1d?w=400&h=300&fit=crop&q=80', href: '/industries/marine' },
    ],
  };
  const existingIndustries = existing?.sections.find((s) => s.section.type === 'industries');
  if (existingIndustries) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      await prisma.section.update({ where: { id: existingIndustries.section.id }, data: { data: industriesPayload } });
      console.log('Updated existing industries');
    } else {
      console.log('Skip industries (exists)');
    }
  } else {
    const inds = await prisma.section.create({ data: { type: 'industries', data: industriesPayload } });
    const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
    const position = (last?.position ?? 0) + 1;
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: inds.id, position } });
    console.log('Created industries');
  }

  // Upsert about_news section
  const aboutNewsPayload = {
    aboutTitle: 'Who We Are',
    aboutParagraphs: [
      'Sure Filter® is a trusted global manufacturer of premium filtration products for heavy-duty and automotive applications. With over 40 years of experience and 8,000+ SKUs, we deliver quality, performance, and reliability that keeps your equipment running at peak efficiency.',
      "From construction sites to mining operations, from agricultural fields to marine environments, our filters protect the world's most demanding equipment. We understand that every particle matters, every minute of uptime counts, and every customer deserves the best protection for their investment. Our commitment to innovation and customer satisfaction drives us to continuously improve our products and services.",
    ],
    stats: [
      { number: '40+', label: 'Years Experience' },
      { number: '8,000+', label: 'Filter Types' },
      { number: '50+', label: 'Countries Served' },
      { number: 'ISO', label: '9001:2015 Certified' },
    ],
    aboutCtaLabel: 'Learn More About Us',
    aboutCtaHref: '#',
    newsTitle: 'News & Updates',
    newsItems: [
      { title: 'New Heavy Duty Series Launched', date: 'July 2025', category: 'Product Launch' },
      { title: 'Meet us at AAPEX 2025 – Booth #XYZ', date: 'October 2025', category: 'Events' },
      { title: 'Expanded coverage for CAT and Ford trucks', date: 'June 2025', category: 'Product Update' },
      { title: 'ISO 9001:2015 Certification Renewed', date: 'May 2025', category: 'Quality' },
    ],
    newsCtaLabel: 'See All News',
    newsCtaHref: '#',
  };
  const existingAboutNews = existing?.sections.find((s) => s.section.type === 'about_news');
  if (existingAboutNews) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      await prisma.section.update({ where: { id: existingAboutNews.section.id }, data: { data: aboutNewsPayload } });
      console.log('Updated existing about_news');
    } else {
      console.log('Skip about_news (exists)');
    }
  } else {
    const ab = await prisma.section.create({ data: { type: 'about_news', data: aboutNewsPayload } });
    const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
    const position = (last?.position ?? 0) + 1;
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: ab.id, position } });
    console.log('Created about_news');
  }
}

async function ensureAboutPage() {
  const slug = 'about-us';
  let page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    page = await prisma.page.create({
      data: {
        slug,
        title: 'About Sure Filter®',
        description:
          'Leading manufacturer of premium filtration solutions for automotive, heavy duty, and industrial applications. Committed to innovation, quality, and customer satisfaction since our founding.',
      },
    });
  }

  const existing = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: { position: 'asc' }, include: { section: true } } },
  });

  const hasType = (t) => existing?.sections.some((s) => s.section.type === t);
  const nextPos = async () => {
    const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
    return (last?.position ?? 0) + 1;
  };

  // Page hero
  const pageHeroData = {
    title: 'About Sure Filter®',
    description:
      'Leading manufacturer of premium filtration solutions for automotive, heavy duty, and industrial applications. Committed to innovation, quality, and customer satisfaction since our founding.',
  };
  if (hasType('page_hero')) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      const it = existing.sections.find((s) => s.section.type === 'page_hero');
      await prisma.section.update({ where: { id: it.section.id }, data: { data: pageHeroData } });
      console.log('Updated page_hero for about-us');
    } else {
      console.log('Skip page_hero (exists)');
    }
  } else {
    const sec = await prisma.section.create({ data: { type: 'page_hero', data: pageHeroData } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created page_hero for about-us');
  }

  // Manufacturing/Stats
  const aboutWithStatsPayload = {
    title: 'Manufacturing Facilities',
    description: 'World-class manufacturing capabilities with global reach and uncompromising quality standards',
    features: [
      {
        icon: 'BuildingOffice2Icon',
        text:
          'State-of-the-art production facilities equipped with advanced machinery and automated systems for consistent quality and efficiency. Our facilities span over 150,000 square feet with ISO 9001:2015 certified production lines.',
      },
      {
        icon: 'GlobeAltIcon',
        text:
          'Strategic global presence with manufacturing and distribution centers across multiple continents to serve customers worldwide. Production facilities in North America, Europe, and Asia with 24/7 customer support.',
      },
      {
        icon: 'CogIcon',
        text:
          'Comprehensive range of filtration solutions including air, fuel, oil, hydraulic, and specialized filters for various applications. Over 15,000 different filter types covering automotive, heavy duty, and industrial applications.',
      },
      {
        icon: 'ShieldCheckIcon',
        text:
          'Rigorous quality control processes and testing procedures ensure every product meets or exceeds industry standards. 100% quality testing with comprehensive warranty coverage and performance guarantee.',
      },
    ],
    stats: [
      { icon: 'CalendarIcon', title: '40+', subtitle: 'Years of Experience' },
      { icon: 'GlobeAltIcon', title: '50+', subtitle: 'Countries Served' },
      { icon: 'CogIcon', title: '15,000+', subtitle: 'Filter Types' },
      { icon: 'ShieldCheckIcon', title: 'ISO', subtitle: '9001:2015 Certified' },
    ],
  };
  if (hasType('about_with_stats')) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      const it = existing.sections.find((s) => s.section.type === 'about_with_stats');
      await prisma.section.update({ where: { id: it.section.id }, data: { data: aboutWithStatsPayload } });
      console.log('Updated about_with_stats for about-us');
    } else {
      console.log('Skip about_with_stats (exists)');
    }
  } else {
    const sec = await prisma.section.create({ data: { type: 'about_with_stats', data: aboutWithStatsPayload } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created about_with_stats for about-us');
  }

  // Our Company content merged into paragraphs with illustrative images
  const companyParagraphs = [
    'On the highway of life, there are many unwelcome passengers - dust and dirt, pollen and pollutants. These nasty little travelers latch themselves to every passing vehicle, hiding in the intake systems, burrowing deep within the mechanicals. They see the world from the inside of an engine and wreak havoc with every passing mile.',
    'Sure Filter® can provide the protection needed to keep your engines running clean and efficient.',
    "All machines - from cars to construction equipment - need protection. Every moment exposes them to countless pollutants, each attacking their efficiency and power. Combustion chambers infiltrated; piston seals wear thin; and hydraulic pressure weakens. It's a constant battle against the open road.",
    'Sure Filter® helps you win that battle. Our mission is to provide you with exceptional filtration products to ensure world-class performance. Sure Filter® brand delivers a complete range of automotive and heavy-duty filters, each engineered to withstand the rigors of environment every day.',
    'High performance results demand high performance products. Sure Filter® brand providing you with air filters, cabin filters, oil filters, fuel filters, hydraulic filters, coolant filters, water separators, and air/oil separators. We offer commercial, industrial, automotive and marine applications to give you a one-stop shop for all of your filtration needs.',
    "All Sure Filter® products tested in accordance with industry standards to meet and exceed engine manufacturer's requirements.",
    'Sure Filter® believes in more than an ever-expanding inventory. We also believe in quality - which is why our products are shaped by the best materials and design standards. We blend steel tension designs with double spiral tubing, in-bond seaming with long-lasting filtration media. These elements promote superior strength and structural integrity.',
    'Engines - despite their imposing collections of wires and gears - are fragile, and a single speck of dust can undo the delicate balance. Sure Filter® protect that balance and deliver you a new level of confidence.',
    'To be sure - use SURE®',
    // Awards section texts
    'Primaniyarta Award — Outstanding Global Brand Development (2009, 2011, 2012, 2013). Multiple awards recognizing outstanding global brand development and international market expansion achievements.',
    'Business Week Magazine — Most Admired Company in Indonesia (2011-2012). Recognized as one of the most admired companies in Indonesia for outstanding business practices and innovation.',
  ];
  const contentWithImagesPayload = {
    title: 'Our Company',
    subtitle: 'Discover our story, mission, and commitment to excellence in filtration solutions',
    content: companyParagraphs,
    images: [
      { src: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop&q=80', alt: 'About Us', position: 2 },
      { src: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop&q=80', alt: 'Our Mission', position: 4 },
      { src: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=400&fit=crop&q=80', alt: 'Our Products', position: 6 },
      { src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop&q=80', alt: 'Our Quality', position: 7 },
      { src: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=400&fit=crop&q=80', alt: 'Our Promise', position: 9 },
    ],
  };
  if (hasType('content_with_images')) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      const it = existing.sections.find((s) => s.section.type === 'content_with_images');
      await prisma.section.update({ where: { id: it.section.id }, data: { data: contentWithImagesPayload } });
      console.log('Updated content_with_images for about-us');
    } else {
      console.log('Skip content_with_images (exists)');
    }
  } else {
    const sec = await prisma.section.create({ data: { type: 'content_with_images', data: contentWithImagesPayload } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created content_with_images for about-us');
  }

  // Quality assurance (static content component)
  if (hasType('quality_assurance')) {
    console.log('Skip quality_assurance (exists)');
  } else {
    const sec = await prisma.section.create({ data: { type: 'quality_assurance', data: {} } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created quality_assurance for about-us');
  }

  // Manufacturing Facilities grid (new)
  const facilitiesPayload = {
    title: 'Manufacturing Facilities',
    description: 'World-class manufacturing capabilities with global reach and uncompromising quality standards',
    items: [
      { title: 'Manufacturing Facilities', description: 'State-of-the-art production facilities equipped with advanced machinery and automated systems for consistent quality and efficiency. Our facilities span over 150,000 square feet with ISO 9001:2015 certified production lines.', icon: 'BuildingOffice2Icon', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80' },
      { title: 'Locations', description: 'Strategic global presence with manufacturing and distribution centers across multiple continents to serve customers worldwide. Production facilities in North America, Europe, and Asia with 24/7 customer support.', icon: 'GlobeAltIcon', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop&q=80' },
      { title: 'Product Types', description: 'Comprehensive range of filtration solutions including air, fuel, oil, hydraulic, and specialized filters for various applications. Over 15,000 different filter types covering automotive, heavy duty, and industrial applications.', icon: 'CogIcon', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80' },
      { title: 'Quality Guarantee', description: 'Rigorous quality control processes and testing procedures ensure every product meets or exceeds industry standards. 100% quality testing with comprehensive warranty coverage and performance guarantee.', icon: 'ShieldCheckIcon', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&q=80' },
    ],
  };
  if (hasType('manufacturing_facilities')) {
    console.log('Skip manufacturing_facilities (exists)');
  } else {
    const sec = await prisma.section.create({ data: { type: 'manufacturing_facilities', data: facilitiesPayload } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created manufacturing_facilities for about-us');
  }

  // Our Company tabs (new)
  const ourCompanyPayload = {
    title: 'Our Company',
    subtitle: 'Discover our story, mission, and commitment to excellence in filtration solutions',
    tabs: [
      { key: 'about-us', title: 'About Us', content: companyParagraphs[0] + '\n\n' + companyParagraphs[1], image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop&q=80' },
      { key: 'our-mission', title: 'Our Mission', content: companyParagraphs[2] + '\n\n' + companyParagraphs[3], image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop&q=80' },
      { key: 'our-products', title: 'Our Products', content: companyParagraphs[4] + '\n\n' + companyParagraphs[5], image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=400&fit=crop&q=80' },
      { key: 'our-quality', title: 'Our Quality', content: companyParagraphs[6], image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop&q=80' },
      { key: 'our-promise', title: 'Our Promise', content: companyParagraphs[7] + '\n\n' + companyParagraphs[8], image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=400&fit=crop&q=80' },
    ],
  };
  if (hasType('our_company')) {
    console.log('Skip our_company (exists)');
  } else {
    const sec = await prisma.section.create({ data: { type: 'our_company', data: ourCompanyPayload } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created our_company for about-us');
  }

  // Stats band (new)
  const statsBandPayload = {
    title: 'Our Numbers Tell the Story',
    subtitle: 'Decades of experience, global reach, and unwavering commitment to excellence',
    items: [
      { icon: 'CalendarIcon', value: '40+', label: 'Years of Experience' },
      { icon: 'GlobeAltIcon', value: '50+', label: 'Countries Served' },
      { icon: 'CogIcon', value: '15,000+', label: 'Filter Types' },
      { icon: 'ShieldCheckIcon', value: 'ISO', label: '9001:2015 Certified' },
    ],
  };
  if (hasType('stats_band')) {
    console.log('Skip stats_band (exists)');
  } else {
    const sec = await prisma.section.create({ data: { type: 'stats_band', data: statsBandPayload } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created stats_band for about-us');
  }

  // Awards carousel (new)
  const awardsPayload = {
    title: 'Awards',
    subtitle: 'Celebrating our achievements and commitment to excellence in the filtration industry',
    items: [
      { title: 'Primaniyarta Award', subtitle: 'Outstanding Global Brand Development', year: '2009, 2011, 2012, 2013', image: 'https://images.unsplash.com/photo-1606159068539-43f36b99d1b5?w=800&h=400&fit=crop&q=80', description: 'Multiple awards recognizing outstanding global brand development and international market expansion achievements.' },
      { title: 'Business Week Magazine', subtitle: 'Most Admired Company in Indonesia', year: '2011-2012', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&q=80', description: 'Recognized as one of the most admired companies in Indonesia for outstanding business practices and innovation.' },
    ],
  };
  if (hasType('awards_carousel')) {
    console.log('Skip awards_carousel (exists)');
  } else {
    const sec = await prisma.section.create({ data: { type: 'awards_carousel', data: awardsPayload } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created awards_carousel for about-us');
  }
}

async function ensureContactPage() {
  const slug = 'contact-us';
  let page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    page = await prisma.page.create({ data: { slug, title: 'Contact Us', description: 'Get in touch with our team' } });
  }
  const existing = await prisma.page.findUnique({ where: { slug }, include: { sections: { orderBy: { position: 'asc' }, include: { section: true } } } });
  const hasType = (t) => existing?.sections.some((s) => s.section.type === t);
  const nextPos = async () => { const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } }); return (last?.position ?? 0) + 1; };

  const hero = { title: 'Contact Us', description: "Get in touch with our team for technical support, product inquiries, or partnership opportunities. We're here to help you find the right filtration solution.", image: 'https://images.unsplash.com/photo-1446776653964-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80' };
  if (!hasType('contact_hero')) {
    const sec = await prisma.section.create({ data: { type: 'contact_hero', data: hero } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created contact_hero for contact-us');
  }

  // contact_options (3 cards)
  const options = {
    items: [
      { icon: 'PhoneIcon', title: 'Call Us', description: '+1 (555) 123-4567', href: 'tel:+15551234567', cta: 'Call Now' },
      { icon: 'ChatBubbleLeftRightIcon', title: 'Chat Live', description: "We're available Sun 7:00pm EST – Friday 7:00pm EST", href: '#', cta: 'Chat Now' },
      { icon: 'EnvelopeIcon', title: 'Ask a Question', description: "Fill out our form and we'll get back to you in 24 hours.", href: '#contact-form', cta: 'Get Started' },
    ],
  };
  if (hasType('contact_options')) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      const it = existing.sections.find((s) => s.section.type === 'contact_options');
      await prisma.section.update({ where: { id: it.section.id }, data: { data: options } });
      console.log('Updated contact_options for contact-us');
    } else {
      console.log('Skip contact_options (exists)');
    }
  } else {
    const sec = await prisma.section.create({ data: { type: 'contact_options', data: options } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created contact_options for contact-us');
  }

  const form = { title: 'Send Us a Message', description: 'This form is intended for distributors and partners only. Customers, please contact your local distributor directly.', subjects: [
    { value: 'product-inquiry', label: 'Product Inquiry' },
    { value: 'technical-support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'general', label: 'General Question' },
  ] };

  const info = { title: 'Get in Touch', general: { email: 'info@surefilter.com', phone: '+1 (555) 123-4567', fax: '+1 (555) 123-4568' }, support: { email: 'support@surefilter.com', phone: '+1 (555) 123-4569', hours: 'Mon-Fri 8AM-6PM EST' }, address: { name: 'Sure Filter® Headquarters', line1: '123 Industrial Drive', line2: 'Manufacturing District', city: 'City', region: 'State', postal: '12345', country: 'United States' } };
  // Do not create standalone contact_info by default anymore; use contact_form_info

  // Prefer combined form+info instead of contact_details
  const combined = { form, info };
  if (hasType('contact_form_info')) {
    if (process.env.SEED_FORCE_UPDATE === '1') {
      const it = existing.sections.find((s) => s.section.type === 'contact_form_info');
      await prisma.section.update({ where: { id: it.section.id }, data: { data: combined } });
      console.log('Updated contact_form_info for contact-us');
    } else {
      console.log('Skip contact_form_info (exists)');
    }
  } else {
    const sec = await prisma.section.create({ data: { type: 'contact_form_info', data: combined } });
    await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position: await nextPos() } });
    console.log('Created contact_form_info for contact-us');
  }

  // Cleanup legacy duplicates if combined exists
  const combinedExists = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { include: { section: true } } },
  });
  const hasCombined = combinedExists?.sections.some((s) => s.section.type === 'contact_form_info');
  if (hasCombined) {
    const legacyTypes = ['contact_form', 'contact_info', 'contact_details'];
    for (const t of legacyTypes) {
      const toDelete = combinedExists.sections.filter((s) => s.section.type === t);
      for (const ps of toDelete) {
        await prisma.pageSection.delete({ where: { id: ps.id } });
        await prisma.section.delete({ where: { id: ps.sectionId } });
        console.log(`Removed legacy ${t} section`);
      }
    }
  }
}

async function ensureProducts() {
  const samples = [
    {
      code: 'SFO241',
      name: 'Sure Filter SFO241 Oil Filter',
      description: 'Heavy-duty spin-on oil filter for extended service intervals.',
      category: 'HEAVY_DUTY',
      filterTypeFullSlug: 'heavy-duty/oil-filters',
      status: 'Release Product',
      images: [
        { src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80', alt: 'Oil filter' },
      ],
      specsLeft: [
        { label: 'Application', value: 'Heavy Duty' },
        { label: 'Media', value: 'Cellulose/Synthetic Blend' },
      ],
      specsRight: [
        { label: 'Efficiency', value: '99% @ 30µm' },
        { label: 'Bypass Valve', value: 'Yes' },
      ],
      oems: [
        { number: 'PH8A', manufacturer: 'FRAM' },
        { number: '51348', manufacturer: 'WIX' },
      ],
      tags: ['oil', 'heavy-duty'],
      manufacturer: 'Sure Filter',
      industries: ['Construction', 'Transportation'],
      heightMm: 120,
      odMm: 95,
      idMm: 62,
      thread: '3/4-16 UNF',
      model: 'Spin-On',
    },
    {
      code: 'SFG84801E',
      name: 'Sure Filter SFG84801E Fuel Filter',
      description: 'High-efficiency diesel fuel filter with water separation.',
      category: 'HEAVY_DUTY',
      filterTypeFullSlug: 'heavy-duty/fuel-filters',
      status: 'Release Product',
      images: [
        { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', alt: 'Fuel filter' },
      ],
      specsLeft: [
        { label: 'Application', value: 'Diesel' },
        { label: 'Media', value: 'Multi-stage' },
      ],
      specsRight: [
        { label: 'Water Separation', value: '98%' },
        { label: 'Micron Rating', value: '10µm' },
      ],
      oems: [
        { number: 'FF5488', manufacturer: 'Fleetguard' },
        { number: '33960', manufacturer: 'WIX' },
      ],
      tags: ['fuel', 'diesel'],
      manufacturer: 'Sure Filter',
      industries: ['Mining', 'Transportation'],
      heightMm: 140,
      odMm: 90,
      idMm: 58,
      thread: 'M16x1.5',
      model: 'Cartridge',
    },
  ];

  for (const p of samples) {
    const ft = await prisma.filterType.findFirst({ where: { fullSlug: p.filterTypeFullSlug } });
    const existing = await prisma.product.findUnique({ where: { code: p.code } });
    const data = {
      code: p.code,
      name: p.name,
      description: p.description,
      category: p.category,
      filterTypeId: ft?.id ?? null,
      status: p.status,
      images: p.images,
      specsLeft: p.specsLeft,
      specsRight: p.specsRight,
      oems: p.oems,
      tags: p.tags,
      manufacturer: p.manufacturer,
      industries: p.industries,
      heightMm: p.heightMm,
      odMm: p.odMm,
      idMm: p.idMm,
      thread: p.thread,
      model: p.model,
    };

    if (existing) {
      if (process.env.SEED_FORCE_UPDATE === '1') {
        await prisma.product.update({ where: { code: p.code }, data });
        console.log(`Updated product ${p.code}`);
      } else {
        console.log(`Product ${p.code} already exists (skipped)`);
      }
    } else {
      await prisma.product.create({ data });
      console.log(`Created product ${p.code}`);
    }
  }
}

async function main() {
  // Safety: convert any leftover old enum values in DB
  try {
    await prisma.$executeRawUnsafe('UPDATE "Section" SET type = $1::"SectionType" WHERE type::text = $2', 'listing_card_meta', 'industry_meta');
  } catch {}
  await ensureHomePage();
  await ensureAboutPage();
  await ensureContactPage();
  // Ensure category landing pages exist for admin editing
  try {
    const hd = await prisma.page.findUnique({ where: { slug: 'heavy-duty' } });
    if (!hd) {
      await prisma.page.create({ data: { slug: 'heavy-duty', title: 'Heavy Duty Filters', description: 'Filters for heavy-duty applications', type: 'CORE' } });
      console.log('Created CMS page: heavy-duty');
    }
  } catch {}
  // Seed heavy-duty sections to mirror original page
  const hdPage = await prisma.page.findUnique({ where: { slug: 'heavy-duty' }, include: { sections: { include: { section: true }, orderBy: { position: 'asc' } } } });
  const hasHd = (t) => hdPage?.sections.some((s) => s.section.type === t);
  const nextHdPos = async () => { const last = await prisma.pageSection.findFirst({ where: { pageId: hdPage.id }, orderBy: { position: 'desc' } }); return (last?.position ?? 0) + 1; };
  if (hdPage) {
    if (!hasHd('search_hero')) {
      const sec = await prisma.section.create({ data: { type: 'search_hero', data: { title: 'Heavy Duty Filters', description: 'Engineered for extreme conditions and heavy machinery. Superior filtration solutions for construction, mining, agriculture, and industrial equipment.', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' } } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
    if (!hasHd('about_with_stats')) {
      const features = [
        { icon: 'CheckIcon', text: 'High-capacity filtration systems' },
        { icon: 'CheckIcon', text: 'Extended service intervals' },
        { icon: 'CheckIcon', text: 'Corrosion-resistant materials' },
        { icon: 'CheckIcon', text: 'Temperature and pressure rated' },
      ];
      const stats = [
        { icon: 'StarIcon', title: 'ISO 9001:2015', subtitle: 'Certified Quality' },
        { icon: 'StarIcon', title: '99.9% Efficiency', subtitle: 'Filtration Rate' },
        { icon: 'ClockIcon', title: '2X Longer Life', subtitle: 'Service Intervals' },
        { icon: 'GlobeAltIcon', title: '50+ Countries', subtitle: 'Global Presence' },
      ];
      const sec = await prisma.section.create({ data: { type: 'about_with_stats', data: { title: 'Professional Grade Filtration', description: 'Our heavy duty filters are designed to withstand extreme conditions while providing superior filtration performance. From construction sites to mining operations, our filters deliver reliable protection for your valuable equipment.', features, stats } } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
    if (!hasHd('filter_types_grid')) {
      const items = [
        { name: 'Oil Filters', icon: 'CogIcon', href: '/heavy-duty/oil' },
        { name: 'Air Filters', icon: 'CloudArrowUpIcon', href: '/heavy-duty/air' },
        { name: 'Fuel Filters', icon: 'BeakerIcon', href: '/heavy-duty/fuel' },
        { name: 'Cabin Filters', icon: 'ShieldCheckIcon', href: '/heavy-duty/cabin' },
        { name: 'Cartridge Filters', icon: 'CircleStackIcon', href: '/heavy-duty/cartridge' },
        { name: 'Hydraulic Filters', icon: 'WrenchScrewdriverIcon', href: '/heavy-duty/hydraulic' },
      ];
      const sec = await prisma.section.create({ data: { type: 'filter_types_grid', data: { title: 'Heavy Duty Filter Types', description: 'Choose the right filter type for your heavy duty equipment', items } } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
    if (!hasHd('popular_filters')) {
      const items = [
        { name: 'LF3325', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', href: '/filters/LF3325' },
        { name: 'AF25550', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', href: '/filters/AF25550' },
        { name: 'FF5320', image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=200&h=200&fit=crop', href: '/filters/FF5320' },
        { name: 'CF1000', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop', href: '/filters/CF1000' },
        { name: 'HF6177', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=200&fit=crop', href: '/filters/HF6177' },
      ];
      const sec = await prisma.section.create({ data: { type: 'popular_filters', data: { title: 'Popular Heavy Duty Filters', description: 'Top-selling filters for heavy duty applications', catalogHref: '/heavy-duty/catalog', catalogText: 'Browse Heavy Duty Catalog', columnsPerRow: 5, items } } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
    if (!hasHd('simple_search')) {
      const sec = await prisma.section.create({ data: { type: 'simple_search', data: { title: 'Find Your Heavy Duty Filter', description: 'Search by part number or equipment model', placeholder: 'Enter part number or equipment model...', buttonText: 'Search' } } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
    if (!hasHd('industries')) {
      const d = { title: 'Industries We Serve', description: '', items: [] };
      const sec = await prisma.section.create({ data: { type: 'industries', data: d } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
    if (!hasHd('why_choose')) {
      const items = [
        { icon: 'ShieldCheckIcon', title: 'Proven Reliability', description: 'Tested in the harshest conditions to ensure consistent performance and protection.' },
        { icon: 'CogIcon', title: 'Advanced Technology', description: 'State-of-the-art filtration media and construction for maximum efficiency.' },
        { icon: 'UserGroupIcon', title: 'Expert Support', description: 'Dedicated technical support team to help you choose the right filter solution.' },
      ];
      const sec = await prisma.section.create({ data: { type: 'why_choose', data: { title: 'Why Choose Sure Filter® Heavy Duty', description: 'Superior filtration performance you can trust for your most demanding applications', items } } });
      await prisma.pageSection.create({ data: { pageId: hdPage.id, sectionId: sec.id, position: await nextHdPos() } });
    }
  }
  try {
    const auto = await prisma.page.findUnique({ where: { slug: 'automotive' } });
    if (!auto) {
      await prisma.page.create({ data: { slug: 'automotive', title: 'Automotive Filters', description: 'Filters for automotive applications', type: 'CORE' } });
      console.log('Created CMS page: automotive');
    }
  } catch {}
  // Ensure industries landing page exists
  const industriesSlug = 'industries';
  let industriesPage = await prisma.page.findUnique({ where: { slug: industriesSlug } });
  if (!industriesPage) {
    industriesPage = await prisma.page.create({ data: { slug: industriesSlug, title: 'Industries', description: 'Industries we serve', type: 'CORE' } });
  }
  const industriesExisting = await prisma.page.findUnique({ where: { slug: industriesSlug }, include: { sections: { include: { section: true } } } });
  const has = (t) => industriesExisting?.sections.some((s) => s.section.type === t);
  const nextPos = async () => { const last = await prisma.pageSection.findFirst({ where: { pageId: industriesPage.id }, orderBy: { position: 'desc' } }); return (last?.position ?? 0) + 1; };
  if (!has('single_image_hero')) {
    const sec = await prisma.section.create({ data: { type: 'single_image_hero', data: { title: 'Industries We Serve', description: 'Comprehensive filtration solutions for agriculture, construction, mining, marine, oil & gas, power generation, transportation, waste management, and rail industries.', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' } } });
    await prisma.pageSection.create({ data: { pageId: industriesPage.id, sectionId: sec.id, position: await nextPos() } });
  }
  if (!has('industries_list')) {
    const sec = await prisma.section.create({ data: { type: 'industries_list', data: { title: 'Our Industries', description: 'Explore our coverage' } } });
    await prisma.pageSection.create({ data: { pageId: industriesPage.id, sectionId: sec.id, position: await nextPos() } });
  }

  // Seed example industry page heavy-duty-truck by copying from agriculture content
  const industrySlug = 'industries/heavy-duty-truck';
  let industryPage = await prisma.page.findUnique({ where: { slug: industrySlug } });
  if (industryPage) {
    // Add sections if empty
    let existing;
    try {
      existing = await prisma.page.findUnique({ where: { slug: industrySlug }, include: { sections: { include: { section: true } } } });
    } catch (e) {
      try {
        await prisma.$executeRawUnsafe('UPDATE "Section" SET type = $1::"SectionType" WHERE type::text = $2', 'listing_card_meta', 'industry_meta');
        existing = await prisma.page.findUnique({ where: { slug: industrySlug }, include: { sections: { include: { section: true } } } });
      } catch {}
    }
    const hasType = (t) => existing?.sections.some((s) => s.section.type === t);
    const nextPos2 = async () => { const last = await prisma.pageSection.findFirst({ where: { pageId: industryPage.id }, orderBy: { position: 'desc' } }); return (last?.position ?? 0) + 1; };
    if (!hasType('compact_search_hero')) {
      const sec = await prisma.section.create({ data: { type: 'compact_search_hero', data: { title: 'Sure Filter® Filters for the Heavy-Duty Truck Industry', description: 'Reliable filtration solutions engineered for heavy-duty trucking applications', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' } } });
      await prisma.pageSection.create({ data: { pageId: industryPage.id, sectionId: sec.id, position: await nextPos2() } });
    }
    if (!hasType('about_with_stats')) {
      const features = [
        { icon: 'CheckIcon', text: 'Engineered for long-haul and severe service conditions' },
        { icon: 'ShieldCheckIcon', text: 'Tested to SAE, JIS, and DIN standards' },
        { icon: 'ClockIcon', text: 'Extended service intervals and reduced downtime' },
        { icon: 'WrenchScrewdriverIcon', text: 'Reinforced construction for heavy-duty use' },
      ];
      const stats = [
        { icon: 'StarIcon', title: 'ISO 9001:2015', subtitle: 'Certified Quality' },
        { icon: 'GlobeAltIcon', title: 'Global Coverage', subtitle: '50+ Countries' },
        { icon: 'Squares2X2Icon', title: '8,000+ SKUs', subtitle: 'Comprehensive Range' },
        { icon: 'BoltIcon', title: 'High Efficiency', subtitle: 'Optimized Protection' },
      ];
      const sec = await prisma.section.create({ data: { type: 'about_with_stats', data: { title: 'Heavy-Duty Truck Industry Filters', description: 'Our filters are engineered to withstand harsh conditions while delivering superior protection for engines and hydraulic systems.', features, stats } } });
      await prisma.pageSection.create({ data: { pageId: industryPage.id, sectionId: sec.id, position: await nextPos2() } });
    }
    if (!hasType('content_with_images')) {
      const content = [
        'Heavy-duty trucks operate under demanding conditions including long-haul routes, extreme temperatures, and varying fuel quality. Sure Filter® products are engineered to protect critical systems and maximize uptime.',
        'Our filters feature reinforced construction, extended service intervals, and superior filtration media to ensure peak performance and reduced maintenance costs.',
        'All products are designed and manufactured in accordance with industry standards for reliability and performance.',
      ];
      const images = [
        { src: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Air filter application', position: 1 },
        { src: 'https://images.unsplash.com/photo-1566151098783-dac1b565bb35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Dusty conditions', position: 3 },
        { src: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Engine components', position: 5 },
      ];
      const sec = await prisma.section.create({ data: { type: 'content_with_images', data: { title: 'Sure Filter® for Heavy-Duty Trucks', subtitle: 'Reliable filtration solutions for trucking', content, images } } });
      await prisma.pageSection.create({ data: { pageId: industryPage.id, sectionId: sec.id, position: await nextPos2() } });
    }
    if (!hasType('popular_filters')) {
      const items = [
        { name: 'Air Filter A4567', category: 'Air Filters', applications: 'Long-haul trucks', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/heavy-duty/air' },
        { name: 'Fuel Filter F8901', category: 'Fuel Filters', applications: 'Diesel engines', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/heavy-duty/fuel' },
        { name: 'Hydraulic Filter H2345', category: 'Hydraulic Filters', applications: 'Suspension systems', image: 'https://images.unsplash.com/photo-1559123041-64f56cdc2c3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/heavy-duty' },
        { name: 'Oil Filter O6789', category: 'Oil Filters', applications: 'HD engines', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/heavy-duty/oil' },
        { name: 'Cabin Air Filter C3456', category: 'Cabin Filters', applications: 'Operator comfort', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/heavy-duty/cabin' },
      ];
      const sec = await prisma.section.create({ data: { type: 'popular_filters', data: { title: 'Popular Heavy-Duty Truck Filters', description: 'Top-performing filters for trucking applications', catalogHref: '/heavy-duty', catalogText: 'Browse All Filters', columnsPerRow: 5, items } } });
      await prisma.pageSection.create({ data: { pageId: industryPage.id, sectionId: sec.id, position: await nextPos2() } });
    }
    if (!hasType('simple_search')) {
      const sec = await prisma.section.create({ data: { type: 'simple_search', data: { title: 'Find Your Heavy-Duty Filter', description: 'Search by part number or equipment model', placeholder: 'Enter part number or equipment model...', buttonText: 'Search Heavy-Duty Filters' } } });
      await prisma.pageSection.create({ data: { pageId: industryPage.id, sectionId: sec.id, position: await nextPos2() } });
    }
    if (!hasType('related_filters')) {
      const filters = [
        { name: 'Air Filters', description: 'Engine air filtration solutions', href: '/heavy-duty/air', icon: 'CloudIcon' },
        { name: 'Fuel Filters', description: 'Clean fuel delivery systems', href: '/heavy-duty/fuel', icon: 'FireIcon' },
        { name: 'Oil Filters', description: 'Engine oil purification', href: '/heavy-duty/oil', icon: 'BeakerIcon' },
      ];
      const sec = await prisma.section.create({ data: { type: 'related_filters', data: { title: 'Related Filter Types', description: 'Explore filtration solutions for trucking', filters } } });
      await prisma.pageSection.create({ data: { pageId: industryPage.id, sectionId: sec.id, position: await nextPos2() } });
    }
  }
  // Mark core pages types where applicable
  const coreSlugs = ['home', 'about-us', 'contact-us', 'catalog', 'filters', 'industries', 'resources', 'warranty', 'newsroom', 'heavy-duty', 'automotive', 'test-colors'];
  for (const slug of coreSlugs) {
    try { await prisma.page.updateMany({ where: { slug }, data: { type: 'CORE' } }); } catch {}
  }

  // Ensure filter types (top-level) for categories
  const toSlug = (name) => name.toLowerCase().replace(/\//g, ' ').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  const iconFor = (name) => {
    const n = name.toLowerCase();
    if (n.includes('oil')) return 'CogIcon';
    if (n.includes('air')) return 'CloudIcon';
    if (n.includes('fuel')) return 'BeakerIcon';
    if (n.includes('cabin')) return 'ShieldCheckIcon';
    if (n.includes('cartridge')) return 'CircleStackIcon';
    if (n.includes('hydraulic')) return 'WrenchScrewdriverIcon';
    if (n.includes('transmission')) return 'BoltIcon';
    return 'Squares2X2Icon';
  };
  const defs = [
    { category: 'AUTOMOTIVE', names: ['Oil Filters', 'Air Filters', 'Fuel Filters', 'Cabin Air Filters', 'Cartridge Filters', 'Fuel/Oil Separator', 'Transmission'] },
    { category: 'HEAVY_DUTY', names: ['Oil Filters', 'Air Filters', 'Fuel Filters', 'Cabin Filters', 'Cartridge Filters', 'Hydraulic Filters', 'Fuel/Oil Separator', 'Transmission'] },
  ];
  for (const def of defs) {
    const root = def.category === 'HEAVY_DUTY' ? 'heavy-duty' : 'automotive';
    for (let i = 0; i < def.names.length; i++) {
      const name = def.names[i];
      const slug = toSlug(name);
      const fullSlug = `${root}/${slug}`;
      const exists = await prisma.filterType.findFirst({ where: { fullSlug } });
      if (exists) {
        await prisma.filterType.update({ where: { id: exists.id }, data: { category: def.category, position: i, name, icon: exists.icon || iconFor(name) } }).catch(() => {});
        // Ensure CMS Page exists and link
        let page = await prisma.page.findUnique({ where: { slug: fullSlug } });
        if (!page) {
          page = await prisma.page.create({ data: { slug: fullSlug, title: name, description: null, type: 'CUSTOM' } });
          // Add basic hero section for visibility
          const hero = await prisma.section.create({ data: { type: 'page_hero', data: { title: name, description: '' } } });
          await prisma.pageSection.create({ data: { pageId: page.id, sectionId: hero.id, position: 1 } });
        }
        await prisma.filterType.update({ where: { id: exists.id }, data: { pageSlug: fullSlug } }).catch(() => {});
        // Ensure meta section exists
        const pageWithSections = await prisma.page.findUnique({ where: { slug: fullSlug }, include: { sections: { include: { section: true } } } });
        const hasMeta = pageWithSections?.sections.some((s) => s.section.type === 'listing_card_meta');
        if (!hasMeta) {
          const meta = await prisma.section.create({ data: { type: 'listing_card_meta', data: { listTitle: name, listDescription: `${name} for demanding applications`, listImage: '', popularFilters: [] } } });
          await prisma.pageSection.create({ data: { pageId: page.id, sectionId: meta.id, position: 2 } });
        } else if (process.env.SEED_FORCE_UPDATE === '1') {
          const metaSec = pageWithSections.sections.find((s) => s.section.type === 'listing_card_meta');
          await prisma.section.update({ where: { id: metaSec.sectionId }, data: { data: { listTitle: name, listDescription: `${name} for demanding applications`, listImage: '', popularFilters: [] } } });
        }
        continue;
      }
      // Create FilterType
      const ft = await prisma.filterType.create({ data: { category: def.category, slug, name, position: i, fullSlug, isActive: true, icon: iconFor(name) } });
      // Ensure CMS Page and basic section
      let page = await prisma.page.findUnique({ where: { slug: fullSlug } });
      if (!page) {
        page = await prisma.page.create({ data: { slug: fullSlug, title: name, description: null, type: 'CUSTOM' } });
        const hero = await prisma.section.create({ data: { type: 'page_hero', data: { title: name, description: '' } } });
        await prisma.pageSection.create({ data: { pageId: page.id, sectionId: hero.id, position: 1 } });
      }
      await prisma.filterType.update({ where: { id: ft.id }, data: { pageSlug: fullSlug } });
      // Add meta section for listing card data
      const meta = await prisma.section.create({ data: { type: 'listing_card_meta', data: { listTitle: name, listDescription: `${name} for demanding applications`, listImage: '', popularFilters: [] } } });
      await prisma.pageSection.create({ data: { pageId: page.id, sectionId: meta.id, position: 2 } });
      console.log(`Created filter type: ${fullSlug}`);
    }
  }

  // Ensure heavy-duty/air page exists and has sections; bind FilterType(Air) to this slug
  const airSlug = 'heavy-duty/air';
  let airPage = await prisma.page.findUnique({ where: { slug: airSlug } });
  if (!airPage) {
    airPage = await prisma.page.create({ data: { slug: airSlug, title: 'Heavy Duty Air Filters', description: 'Premium heavy duty air filters', type: 'CUSTOM' } });
  }
  const airExisting = await prisma.page.findUnique({ where: { slug: airSlug }, include: { sections: { include: { section: true } } } });
  const airHas = (t) => airExisting?.sections.some((s) => s.section.type === t);
  const nextAirPos = async () => { const last = await prisma.pageSection.findFirst({ where: { pageId: airPage.id }, orderBy: { position: 'desc' } }); return (last?.position ?? 0) + 1; };

  if (!airHas('compact_search_hero')) {
    const sec = await prisma.section.create({ data: { type: 'compact_search_hero', data: { title: 'Heavy Duty Air Filters', description: 'Advanced filtration technology for extreme operating conditions. Our heavy duty air filters provide superior engine protection and extended service life in the harshest environments.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' } } });
    await prisma.pageSection.create({ data: { pageId: airPage.id, sectionId: sec.id, position: await nextAirPos() } });
  }

  if (!airHas('content_with_images')) {
    const content = [
      'Heavy duty air filters are essential for protecting engines from dust, dirt, and debris in demanding environments. Our advanced filtration media captures even the smallest particles while maintaining optimal airflow for peak engine performance.',
      'Multi-layer filtration, nano-fiber media, and moisture resistance ensure maximum efficiency and reliability in dusty, high-vibration operating conditions.',
      'High-capacity dust holding extends service intervals and reduces maintenance costs for heavy-duty equipment.',
    ];
    const images = [
      { src: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Air filter application', position: 1 },
      { src: 'https://images.unsplash.com/photo-1566151098783-dac1b565bb35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Dusty conditions', position: 3 },
      { src: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Engine components', position: 5 },
    ];
    const sec = await prisma.section.create({ data: { type: 'content_with_images', data: { title: 'Heavy Duty Air Filters', subtitle: 'Maximum Engine Protection', content, images } } });
    await prisma.pageSection.create({ data: { pageId: airPage.id, sectionId: sec.id, position: await nextAirPos() } });
  }

  if (!airHas('popular_filters')) {
    const items = [
      { name: 'HD-AIR-2001 — Heavy Duty Engine Air Filter', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-AIR-2002 — Secondary Air Filter', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-AIR-2003 — Radial Seal Air Filter', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-AIR-2004 — Panel Air Filter', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-AIR-2005 — Conical Air Filter', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-AIR-2006 — Pre-Cleaner Assembly', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
    ];
    const sec = await prisma.section.create({ data: { type: 'popular_filters', data: { title: 'Popular Heavy Duty Air Filters', description: 'Our most trusted air filters for heavy-duty applications', catalogHref: '/heavy-duty/air/catalog', catalogText: 'Browse Air Filter Catalog', columnsPerRow: 5, items } } });
    await prisma.pageSection.create({ data: { pageId: airPage.id, sectionId: sec.id, position: await nextAirPos() } });
  }

  if (!airHas('simple_search')) {
    const sec = await prisma.section.create({ data: { type: 'simple_search', data: { title: 'Find Your Air Filter', description: 'Search by part number or equipment model', placeholder: 'Enter part number or equipment model...', buttonText: 'Search Air Filters' } } });
    await prisma.pageSection.create({ data: { pageId: airPage.id, sectionId: sec.id, position: await nextAirPos() } });
  }

  if (!airHas('related_filters')) {
    const filters = [
      { name: 'Oil Filters', href: '/heavy-duty/oil', icon: 'CogIcon', description: 'Superior engine protection with premium oil filtration for heavy duty applications.' },
      { name: 'Fuel Filters', href: '/heavy-duty/fuel', icon: 'BeakerIcon', description: 'Clean fuel delivery systems for optimal engine performance and longevity.' },
      { name: 'Hydraulic Filters', href: '/heavy-duty/hydraulic', icon: 'WrenchScrewdriverIcon', description: 'Maintain hydraulic system efficiency with advanced filtration solutions.' },
    ];
    const sec = await prisma.section.create({ data: { type: 'related_filters', data: { title: 'Related Filter Types', description: 'Explore filtration solutions for other applications', filters } } });
    await prisma.pageSection.create({ data: { pageId: airPage.id, sectionId: sec.id, position: await nextAirPos() } });
  }

  if (!airHas('industries')) {
    const d = { title: 'Industries We Serve', description: '', items: [] };
    const sec = await prisma.section.create({ data: { type: 'industries', data: d } });
    await prisma.pageSection.create({ data: { pageId: airPage.id, sectionId: sec.id, position: await nextAirPos() } });
  }

  // Link FilterType (Air) to this page slug if exists
  const ftAir = await prisma.filterType.findFirst({ where: { fullSlug: 'heavy-duty/air-filters' } });
  if (ftAir) {
    await prisma.filterType.update({ where: { id: ftAir.id }, data: { pageSlug: airSlug } });
  }

  // Ensure heavy-duty/oil page exists and has sections
  const oilSlug = 'heavy-duty/oil';
  let oilPage = await prisma.page.findUnique({ where: { slug: oilSlug } });
  if (!oilPage) {
    oilPage = await prisma.page.create({ data: { slug: oilSlug, title: 'Heavy Duty Oil Filters', description: 'Premium heavy duty oil filters', type: 'CUSTOM' } });
  }
  const oilExisting = await prisma.page.findUnique({ where: { slug: oilSlug }, include: { sections: { include: { section: true } } } });
  const oilHas = (t) => oilExisting?.sections.some((s) => s.section.type === t);
  const nextOilPos = async () => { const last = await prisma.pageSection.findFirst({ where: { pageId: oilPage.id }, orderBy: { position: 'desc' } }); return (last?.position ?? 0) + 1; };

  if (!oilHas('compact_search_hero')) {
    const sec = await prisma.section.create({ data: { type: 'compact_search_hero', data: { title: 'Heavy Duty Oil Filters', description: 'Engine oil filtration engineered for extreme duty cycles. Protect engines with superior contaminant control and extended service intervals.', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' } } });
    await prisma.pageSection.create({ data: { pageId: oilPage.id, sectionId: sec.id, position: await nextOilPos() } });
  }

  if (!oilHas('content_with_images')) {
    const content = [
      'Heavy duty oil filters safeguard engines from wear by trapping microscopic contaminants in harsh environments and high-load operations.',
      'Our premium media, robust construction, and anti-drainback valve designs ensure reliable lubrication and protection across extended drain intervals.',
      'Validated to industry standards to maintain oil cleanliness and engine performance.',
    ];
    const images = [
      { src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Oil filtration components', position: 1 },
      { src: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', alt: 'Engine close-up', position: 3 },
    ];
    const sec = await prisma.section.create({ data: { type: 'content_with_images', data: { title: 'Heavy Duty Oil Filters', subtitle: 'Engine Protection You Can Trust', content, images } } });
    await prisma.pageSection.create({ data: { pageId: oilPage.id, sectionId: sec.id, position: await nextOilPos() } });
  }

  if (!oilHas('popular_filters')) {
    const items = [
      { name: 'HD-OIL-3001 — Heavy Duty Spin-On Oil Filter', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-OIL-3002 — Cartridge Oil Filter', image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-OIL-3003 — High Efficiency Oil Filter', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-OIL-3004 — Extended Life Oil Filter', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
      { name: 'HD-OIL-3005 — Bypass Oil Filter', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', href: '/filters/SFO241' },
    ];
    const sec = await prisma.section.create({ data: { type: 'popular_filters', data: { title: 'Popular Heavy Duty Oil Filters', description: 'Top-performing oil filters for heavy duty engines', catalogHref: '/heavy-duty/oil/catalog', catalogText: 'Browse Oil Filter Catalog', columnsPerRow: 5, items } } });
    await prisma.pageSection.create({ data: { pageId: oilPage.id, sectionId: sec.id, position: await nextOilPos() } });
  }

  if (!oilHas('simple_search')) {
    const sec = await prisma.section.create({ data: { type: 'simple_search', data: { title: 'Find Your Oil Filter', description: 'Search by part number or equipment model', placeholder: 'Enter part number or equipment model...', buttonText: 'Search Oil Filters' } } });
    await prisma.pageSection.create({ data: { pageId: oilPage.id, sectionId: sec.id, position: await nextOilPos() } });
  }

  if (!oilHas('related_filters')) {
    const sec = await prisma.section.create({ data: { type: 'related_filters', data: { title: 'Related Filter Types', description: 'Explore filtration solutions for other systems', category: 'HEAVY_DUTY' } } });
    await prisma.pageSection.create({ data: { pageId: oilPage.id, sectionId: sec.id, position: await nextOilPos() } });
  }

  if (!oilHas('industries')) {
    const d = { title: 'Industries We Serve', description: '', items: [] };
    const sec = await prisma.section.create({ data: { type: 'industries', data: d } });
    await prisma.pageSection.create({ data: { pageId: oilPage.id, sectionId: sec.id, position: await nextOilPos() } });
  }

  // Link FilterType (Oil) to this page slug if exists
  const ftOil = await prisma.filterType.findFirst({ where: { fullSlug: 'heavy-duty/oil-filters' } });
  if (ftOil) {
    await prisma.filterType.update({ where: { id: ftOil.id }, data: { pageSlug: oilSlug } });
  }
}

main()
  .then(ensureProducts)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
