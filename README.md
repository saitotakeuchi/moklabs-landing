# Mok Labs - Next.js Website

Modern, high-performance website for Mok Labs built with Next.js 14, React 18, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

- ⚡ **Next.js 14** - App Router, Server Components, and React Server Actions
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📝 **MDX Blog** - Blog with MDX support and syntax highlighting
- 🔍 **SEO Optimized** - Meta tags, sitemap, robots.txt
- 📊 **Analytics** - Google Analytics, Vercel Analytics, and Speed Insights
- 📧 **Contact Form** - Email integration via Resend
- 🎯 **TypeScript** - Type-safe development
- 🌐 **i18n Ready** - Portuguese (pt-BR) language support
- ♿ **Accessible** - WCAG compliant components
- 🔒 **Security Headers** - XSS, clickjacking, and MIME-type protection
- 📱 **Responsive** - Mobile-first design
- 🎭 **Loading States** - Skeleton screens for better UX
- 🚨 **Error Handling** - Error boundaries and 404 pages

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

## 🏁 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/moklabs-landing.git
cd moklabs-landing
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys and configuration. See [Environment Variables](#environment-variables) for details.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 💻 Development

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`. The page auto-updates as you edit files.

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

### Code Formatting

This project uses **Prettier** for code formatting with **automatic pre-commit hooks** via Husky and lint-staged.

**✨ Automatic Formatting (Recommended)**

Code is automatically formatted when you commit:

```bash
git add .
git commit -m "Your commit message"
# Prettier will auto-format staged files before committing
```

**Manual Formatting**

You can also format code manually:

```bash
# Check formatting
npm run format:check

# Auto-fix formatting
npm run format
```

**How It Works**

- **Husky** manages Git hooks
- **lint-staged** runs Prettier only on staged files
- Pre-commit hook automatically formats code before each commit
- This prevents formatting issues in CI/CD pipeline

### Adding Blog Posts

1. Create a new `.mdx` file in `content/blog/`:

```bash
content/blog/my-new-post.mdx
```

2. Add frontmatter and content:

```mdx
---
title: "My New Blog Post"
date: "2025-10-10"
excerpt: "A brief description of the post"
author: "Your Name"
tags: ["nextjs", "react"]
---

# Your content here

This is the body of your blog post...
```

3. The post will automatically appear on the blog page and be statically generated.

## 🏗️ Building for Production

### Create a production build

```bash
npm run build
```

This will:

- Build the application for production
- Generate static pages
- Optimize assets (JS, CSS, images)
- Create a `.next` directory with the production build

### Test the production build locally

```bash
npm start
```

The production build will be available at `http://localhost:3000`.

### Build Output

After building, you'll see output similar to:

```
Route (app)                               Size     First Load JS
┌ ○ /                                     149 B           389 kB
├ ○ /blog                                 184 B          96.4 kB
├ ● /blog/[slug]                          184 B          96.4 kB
└ ○ /pnld                                 148 B           389 kB

○  (Static)   - prerendered as static content
●  (SSG)      - prerendered as static HTML
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. **Push to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import on Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**

Add the following environment variables in Vercel dashboard:

```
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_tracking_id
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

4. **Deploy**

Click "Deploy" and Vercel will build and deploy your application.

### Deploy to Other Platforms

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for instructions on deploying to:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Docker

### Custom Domain

After deployment, you can add a custom domain in your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## 🔐 Environment Variables

### Required Variables

| Variable         | Description                           | Example                  |
| ---------------- | ------------------------------------- | ------------------------ |
| `RESEND_API_KEY` | Resend API key for email sending      | `re_xxx...`              |
| `FROM_EMAIL`     | Email address for sending emails      | `contato@moklabs.com.br` |
| `TO_EMAIL`       | Email address to receive contact form | `contato@moklabs.com.br` |

### Optional Variables

| Variable                            | Description                  | Default                  |
| ----------------------------------- | ---------------------------- | ------------------------ |
| `NEXT_PUBLIC_GA_TRACKING_ID`        | Google Analytics tracking ID | -                        |
| `NEXT_PUBLIC_SITE_URL`              | Base URL of the site         | `https://moklabs.com.br` |
| `NEXT_PUBLIC_SITE_NAME`             | Name of the site             | `Mok Labs`               |
| `NEXT_PUBLIC_ENABLE_ANALYTICS`      | Enable analytics             | `true`                   |
| `NEXT_PUBLIC_ENABLE_COOKIE_CONSENT` | Enable cookie consent        | `true`                   |
| `FROM_NAME`                         | Name for email sender        | `Mok Labs`               |

### Environment Files

- `.env.local` - Local development (git-ignored)
- `.env.example` - Template with all variables documented
- `.env.production` - Production environment (git-ignored, use platform dashboard)

**⚠️ Never commit `.env.local` or any file containing secrets to Git!**

## 📁 Project Structure

```
nextjs-migration/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── contact/        # Contact form endpoint
│   │   └── health/         # Health check endpoint
│   ├── blog/               # Blog pages
│   │   ├── [slug]/        # Dynamic blog post pages
│   │   └── page.tsx       # Blog listing page
│   ├── pnld/              # PNLD page
│   ├── politica-de-privacidade/  # Privacy policy
│   ├── error.tsx          # Global error boundary
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Global loading state
│   ├── not-found.tsx      # Global 404 page
│   ├── page.tsx           # Home page
│   ├── robots.ts          # Robots.txt generator
│   └── sitemap.ts         # Sitemap generator
├── components/             # React components
│   ├── common/            # Shared components
│   │   ├── CookieConsent.tsx
│   │   ├── GoogleAnalytics.tsx
│   │   └── VercelAnalytics.tsx
│   └── sections/          # Page sections
│       ├── Footer.tsx
│       ├── Header.tsx
│       └── shared/        # Shared sections
├── config/                # Configuration files
│   ├── index.ts          # Config exports
│   ├── seoConfig.ts      # SEO configuration
│   └── site.ts           # Site configuration
├── content/              # Content files
│   ├── blog/            # Blog posts (MDX)
│   ├── index.ts         # Content exports
│   ├── mainContent.ts   # Home page content
│   └── pnldContent.ts   # PNLD page content
├── docs/                # Documentation
│   ├── COMPREHENSIVE_TEST_RESULTS.md
│   ├── DEPLOYMENT.md
│   ├── LIGHTHOUSE_AUDIT_GUIDE.md
│   └── OPTIMIZATION_SUMMARY.md
├── lib/                 # Utility libraries
│   └── utils/          # Utility functions
├── public/             # Static assets
│   ├── favicon.ico
│   ├── images/
│   └── og-image.svg
├── .env.example        # Environment variables template
├── .env.local          # Local environment (git-ignored)
├── .gitignore          # Git ignore rules
├── .vercelignore       # Vercel ignore rules
├── next.config.mjs     # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vercel.json         # Vercel deployment configuration
```

## 📜 Scripts

| Script                 | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start development server at localhost:3000 |
| `npm run build`        | Build for production                       |
| `npm start`            | Start production server                    |
| `npm run lint`         | Run ESLint                                 |
| `npm run type-check`   | Run TypeScript type checking               |
| `npm run format`       | Format code with Prettier                  |
| `npm run format:check` | Check code formatting                      |
| `npm run export`       | Build and export static site               |
| `npm run clean`        | Clean build artifacts and cache            |

## 🛠️ Tech Stack

### Core

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[PostCSS](https://postcss.org/)** - CSS transformations

### Content

- **[MDX](https://mdxjs.com/)** - Markdown with JSX support
- **[Gray Matter](https://github.com/jonschlinkert/gray-matter)** - Frontmatter parser
- **[Remark](https://github.com/remarkjs/remark)** - Markdown processor
- **[Rehype Pretty Code](https://rehype-pretty-code.netlify.app/)** - Syntax highlighting
- **[Shiki](https://shiki.matsu.io/)** - Code highlighter

### Integrations

- **[Resend](https://resend.com/)** - Email API
- **[Vercel Analytics](https://vercel.com/analytics)** - Web analytics
- **[Google Analytics](https://analytics.google.com/)** - Analytics platform

### Development

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks management
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files

## 📈 Performance

- **Lighthouse Score:** 90+ Performance, 95+ Accessibility, 95+ Best Practices, 100 SEO
- **Core Web Vitals:** All metrics in "Good" range
- **Bundle Size:** Optimized with code splitting and tree shaking
- **Static Generation:** Blog posts and static pages pre-rendered at build time

## 🔒 Security

- Security headers configured (CSP, X-Frame-Options, etc.)
- CORS protection on API routes
- Input validation on forms
- Environment variables properly scoped
- No secrets in client-side code

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- Color contrast WCAG AA compliant
- Focus indicators

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## 📚 Documentation

- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Detailed deployment guide
- [COMPREHENSIVE_TEST_RESULTS.md](./docs/COMPREHENSIVE_TEST_RESULTS.md) - Test results
- [LIGHTHOUSE_AUDIT_GUIDE.md](./docs/LIGHTHOUSE_AUDIT_GUIDE.md) - Performance testing
- [OPTIMIZATION_SUMMARY.md](./docs/OPTIMIZATION_SUMMARY.md) - Optimization overview

## 🐛 Troubleshooting

### Build Errors

**Error: Module not found**

```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

**Error: Type errors**

```bash
# Run type checking to see details
npm run type-check
```

### Runtime Errors

**Contact form not working**

- Check that `RESEND_API_KEY` is set
- Verify email addresses in environment variables
- Check console for error messages

**Analytics not tracking**

- Ensure `NEXT_PUBLIC_GA_TRACKING_ID` is set
- Check that analytics is enabled in production
- Verify in browser developer tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write TypeScript with proper types (avoid `any`)
- Code is automatically formatted with Prettier on commit (via Husky pre-commit hooks)
- Write meaningful commit messages
- Add tests for new features
- Ensure all linting and type-checking passes before pushing

## 📄 License

This project is proprietary and confidential.

Copyright © 2025 Mok Labs. All rights reserved.

## 👥 Contact

**Mok Labs**

- 🌐 Website: [moklabs.com.br](https://moklabs.com.br)
- 📧 Email: contato@moklabs.com.br
- 📱 WhatsApp: +55 (41) 99999-9999
- 📷 Instagram: [@moklabs](https://instagram.com/moklabs)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Deployed on [Vercel](https://vercel.com)
- Icons from [Heroicons](https://heroicons.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

**Made with ❤️ by Mok Labs**
