# Sure Filter US - Website & CMS

Modern Next.js website with integrated CMS for Sure Filter US.

## Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.1.11
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3
- **Deployment**: AWS App Runner

## Features

### Public Website
- 🏠 Dynamic pages with CMS-managed content
- 🔍 Advanced product search and filtering
- 🏭 Industry-specific pages
- 📰 News and resources
- 📝 Contact forms with webhook integration
- 🎨 Modern, Apple-inspired design

### Admin CMS
- 📄 **Page Management**: Create and edit pages with dynamic sections
- 🔗 **Shared Sections**: Reusable content blocks across multiple pages
- 🏭 **Industries**: Manage industry pages and filter types
- 📦 **Products**: Product catalog with specifications
- 📰 **News**: Blog posts with categories
- 📋 **Forms**: Custom form builder with submissions tracking
- 📚 **Resources**: Downloadable resources with categories
- 📁 **File Manager**: S3-integrated media library
- ⚙️ **Settings**: Site-wide configuration

## Key Features

### 🔗 Shared Sections (NEW!)
Reusable content sections that can be used across multiple pages. Edit once, update everywhere.

**Quick Start:**
```
Admin → Pages → Shared Sections → New Shared Section
```

**Documentation:**
- [Full Documentation](./docs/SHARED_SECTIONS.md)
- [Quick Start Guide](./docs/SHARED_SECTIONS_QUICKSTART.md)

**Benefits:**
- ✅ Content consistency across pages
- ✅ Single source of truth
- ✅ Automatic updates everywhere
- ✅ Visual indicators and safety checks

### 📄 Dynamic Page Builder
Build pages using modular sections:
- Hero sections (multiple variants)
- Content blocks
- Product showcases
- Industry overviews
- Contact forms
- And 40+ more section types

### 🎨 Design System
- Apple-inspired minimalist design
- Custom brand colors (Sure Blue, Sure Red)
- Responsive and mobile-first
- Consistent spacing and typography

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for file storage)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_ASSETS_URL="https://assets.surefilter.us"
```

## Project Structure

```
surefilter-ui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public pages
│   │   ├── admin/             # Admin CMS
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── sections/          # CMS section components
│   │   ├── layout/            # Header, Footer
│   │   └── admin/             # Admin UI components
│   ├── cms/                   # CMS utilities
│   │   ├── renderer.tsx       # Section renderer
│   │   ├── fetch.ts           # Data fetching
│   │   └── types.ts           # Type definitions
│   ├── lib/                   # Utilities
│   │   ├── prisma.ts          # Database client
│   │   ├── auth.ts            # Authentication
│   │   └── s3.ts              # File storage
│   └── styles/                # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```

## Admin Access

### Default Admin User
After running migrations, create an admin user:

```bash
npx prisma studio
# Navigate to User table
# Create user with role: ADMIN
```

### Admin Panel
Access the admin panel at: `http://localhost:3000/admin`

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate Prisma Client

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler
```

## Documentation

- [Shared Sections](./docs/SHARED_SECTIONS.md) - Full documentation
- [Shared Sections Quick Start](./docs/SHARED_SECTIONS_QUICKSTART.md) - Quick guide
- [API Documentation](./docs/API.md) - API endpoints (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) - AWS deployment (coming soon)

## CMS Section Types

The CMS supports 44+ section types:

**Home Sections:**
- Hero Full, Hero Carousel, Hero Compact
- Featured Products, Why Choose
- Quick Search, Industries, About & News

**Page Heroes:**
- Page Hero, Page Hero Reverse
- Single Image Hero, Compact Search Hero

**Content Sections:**
- Content with Images
- News Carousel
- Industry Showcase
- Popular Filters

**Contact Sections:**
- Contact Hero, Contact Form
- Contact Info, Contact Options

**And many more...**

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - Sure Filter US

## Support

For issues or questions, contact the development team.

---

Built with ❤️ for Sure Filter US
