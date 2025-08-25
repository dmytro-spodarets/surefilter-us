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
      { name: 'Agriculture', description: 'Tractors, harvesters, and farm equipment', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop&q=80', href: '/industries/agriculture' },
      { name: 'Rental Equipment', description: 'Construction and industrial rental fleets', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&q=80', href: '/industries/rental-equipment' },
      { name: 'Construction', description: 'Excavators, bulldozers, and heavy machinery', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&q=80', href: '/industries/construction' },
      { name: 'Mining', description: 'Open-pit and underground equipment', image: '/images/image-2.jpg', href: '/industries/mining' },
      { name: 'Marine', description: 'Commercial vessels and port equipment', image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=300&fit=crop&q=80', href: '/industries/marine' },
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

  const hero = { title: 'Contact Us', description: "Get in touch with our team for technical support, product inquiries, or partnership opportunities. We're here to help you find the right filtration solution.", image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=1000&q=80' };
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
async function main() {
  await ensureHomePage();
  await ensureAboutPage();
  await ensureContactPage();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


