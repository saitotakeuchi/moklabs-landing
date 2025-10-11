# Deployment Guide

## Complete Guide to Deploying Mok Labs Next.js Website

**Last Updated:** October 9, 2025

---

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Variables](#environment-variables)
- [Deploy to Vercel](#deploy-to-vercel-recommended)
- [Deploy to Netlify](#deploy-to-netlify)
- [Deploy to AWS Amplify](#deploy-to-aws-amplify)
- [Deploy to DigitalOcean App Platform](#deploy-to-digitalocean-app-platform)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Docker Deployment](#docker-deployment)
- [Custom Domain Setup](#custom-domain-setup)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive instructions for deploying the Mok Labs Next.js website to various platforms. The recommended platform is **Vercel**, as it's optimized for Next.js applications and provides the best developer experience.

### Deployment Requirements

- Node.js 18.x or higher
- npm 9.x or higher
- Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables configured
- Production build tested locally

---

## Pre-Deployment Checklist

Before deploying, ensure you've completed the following:

### ✅ Code Preparation

- [ ] All code changes committed to Git
- [ ] Production build successful (`npm run build`)
- [ ] All tests passing (if applicable)
- [ ] No console errors or warnings
- [ ] Environment variables documented
- [ ] `.env.local` not committed (git-ignored)

### ✅ Configuration

- [ ] `package.json` has correct scripts
- [ ] `next.config.mjs` configured
- [ ] `vercel.json` (if using Vercel)
- [ ] `.gitignore` excludes sensitive files
- [ ] `.vercelignore` excludes unnecessary files

### ✅ Content

- [ ] All pages rendering correctly
- [ ] Blog posts statically generated
- [ ] Images optimized
- [ ] SEO metadata configured
- [ ] Sitemap and robots.txt working

### ✅ Testing

- [ ] Lighthouse audit completed
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Contact form tested
- [ ] Analytics verified

---

## Environment Variables

### Required Environment Variables

These variables **must** be set in your deployment platform:

```env
# Email Configuration (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=contato@moklabs.com.br
TO_EMAIL=contato@moklabs.com.br
FROM_NAME=Mok Labs
```

### Optional Environment Variables

These variables are optional but recommended for full functionality:

```env
# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://moklabs.com.br
NEXT_PUBLIC_SITE_NAME=Mok Labs

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true

# API Configuration
API_RATE_LIMIT=60
CORS_ALLOWED_ORIGINS=*
```

### Getting API Keys

#### Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to "API Keys" in the dashboard
4. Click "Create API Key"
5. Copy the key (starts with `re_`)
6. Add to environment variables as `RESEND_API_KEY`

**Note:** Resend requires domain verification for production. Follow their setup guide to verify your domain.

#### Google Analytics Tracking ID

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new property (or use existing)
3. Set up a data stream for your website
4. Copy the "Measurement ID" (format: `G-XXXXXXXXXX`)
5. Add to environment variables as `NEXT_PUBLIC_GA_TRACKING_ID`

### Environment Variable Security

⚠️ **Important Security Notes:**

- **Never** commit `.env.local` to Git
- **Never** expose API keys in client-side code
- Use `NEXT_PUBLIC_` prefix only for client-side variables
- Server-only variables (like `RESEND_API_KEY`) should NOT have the `NEXT_PUBLIC_` prefix
- Rotate API keys regularly
- Use different keys for development and production

---

## Deploy to Vercel (Recommended)

Vercel is the recommended deployment platform, created by the makers of Next.js.

### Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier available)

### Step-by-Step Deployment

#### 1. Push Code to Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - ready for deployment"

# Add remote repository
git remote add origin https://github.com/yourusername/moklabs-landing.git

# Push to main branch
git push -u origin main
```

#### 2. Import Project to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js configuration
5. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project directory)
cd moklabs-landing/nextjs-migration
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? moklabs-landing
# - In which directory? ./ (current)
# - Override settings? No
```

#### 3. Configure Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add each variable:

| Key                          | Value                    | Environment                      |
| ---------------------------- | ------------------------ | -------------------------------- |
| `RESEND_API_KEY`             | `re_xxx...`              | Production, Preview, Development |
| `FROM_EMAIL`                 | `contato@moklabs.com.br` | Production, Preview, Development |
| `TO_EMAIL`                   | `contato@moklabs.com.br` | Production, Preview, Development |
| `FROM_NAME`                  | `Mok Labs`               | Production, Preview, Development |
| `NEXT_PUBLIC_GA_TRACKING_ID` | `G-XXXXXXXXXX`           | Production                       |
| `NEXT_PUBLIC_SITE_URL`       | `https://moklabs.com.br` | Production                       |
| `NEXT_PUBLIC_SITE_NAME`      | `Mok Labs`               | Production                       |

**Using Vercel CLI:**

```bash
# Add environment variable
vercel env add RESEND_API_KEY production
# Enter value when prompted

# Or import from .env.local
vercel env pull
```

#### 4. Deploy

Click "Deploy" in the Vercel dashboard, or run:

```bash
vercel --prod
```

#### 5. Verify Deployment

1. Visit the deployment URL (e.g., `https://moklabs-landing.vercel.app`)
2. Test all pages and functionality
3. Verify contact form works
4. Check analytics tracking
5. Test on mobile devices

### Vercel Configuration

The `vercel.json` file in the project root configures:

- Build command: `npm run build`
- Output directory: `.next`
- Security headers
- Cache headers
- Regions (set to `gru1` for Brazil)

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `moklabs.com.br`
4. Follow DNS configuration instructions:

**For domain purchased through registrar:**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Wait for DNS propagation (up to 48 hours)
6. Vercel will automatically provision SSL certificate

### Automatic Deployments

Vercel automatically deploys:

- **Production:** Every push to `main` branch → `moklabs.com.br`
- **Preview:** Every push to other branches → unique preview URL
- **Pull Requests:** Each PR gets a preview deployment

### Deployment Settings

Configure in Vercel Dashboard → Settings → Git:

- **Production Branch:** `main`
- **Auto-deploy:** Enabled
- **Preview Deployments:** Enabled
- **Comments on Pull Requests:** Enabled

---

## Deploy to Netlify

Netlify is another popular platform for hosting Next.js applications.

### Step-by-Step Deployment

#### 1. Push to Git Repository

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

#### 2. Import to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider
4. Select your repository
5. Configure build settings:

```
Build command: npm run build
Publish directory: .next
```

#### 3. Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables:

Add all required environment variables (same as Vercel section above)

#### 4. Deploy

Click "Deploy site"

#### 5. Custom Domain (Netlify)

1. Go to Domain Settings
2. Add custom domain: `moklabs.com.br`
3. Configure DNS:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### Netlify Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Deploy to AWS Amplify

AWS Amplify provides hosting for Next.js applications with AWS integration.

### Prerequisites

- AWS Account
- Git repository

### Step-by-Step Deployment

#### 1. Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 2. Initialize Amplify

```bash
amplify init

# Answer prompts:
# - Enter a name: moklabs-landing
# - Environment: production
# - Editor: (your choice)
# - App type: javascript
# - Framework: react
# - Source directory: ./
# - Build directory: .next
# - Build command: npm run build
# - Start command: npm start
```

#### 3. Add Hosting

```bash
amplify add hosting

# Choose:
# - Hosting with Amplify Console
# - Manual deployment
```

#### 4. Configure Environment Variables

In AWS Amplify Console:

1. Go to your app
2. App settings → Environment variables
3. Add all required variables

#### 5. Deploy

```bash
amplify publish
```

Or use Amplify Console:

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect to Git repository
4. Configure build settings
5. Deploy

### AWS Amplify Build Settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

---

## Deploy to DigitalOcean App Platform

DigitalOcean App Platform provides simple deployment for Next.js apps.

### Step-by-Step Deployment

#### 1. Create App

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Navigate to "Apps"
3. Click "Create App"
4. Connect to your Git repository

#### 2. Configure Build

- **Build Command:** `npm run build`
- **Run Command:** `npm start`
- **HTTP Port:** 3000

#### 3. Environment Variables

Add in App Platform → Settings → App-Level Environment Variables

#### 4. Deploy

Click "Create Resources" to deploy

### DigitalOcean App Spec

Create `.do/app.yaml`:

```yaml
name: moklabs-landing
services:
  - name: web
    github:
      repo: yourusername/moklabs-landing
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3000
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: production
      - key: RESEND_API_KEY
        value: ${RESEND_API_KEY}
        type: SECRET
```

---

## Self-Hosted Deployment

Deploy to your own server (VPS, dedicated server, etc.)

### Prerequisites

- Linux server (Ubuntu 22.04 recommended)
- Node.js 18.x installed
- PM2 or systemd for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

### Step-by-Step Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/moklabs
sudo chown $USER:$USER /var/www/moklabs

# Clone repository
cd /var/www/moklabs
git clone https://github.com/yourusername/moklabs-landing.git .
cd nextjs-migration

# Install dependencies
npm ci --production

# Build application
npm run build
```

#### 3. Configure Environment

```bash
# Create .env.local
nano .env.local

# Add your environment variables
# (Copy from .env.example and fill in values)
```

#### 4. Setup PM2

```bash
# Start application with PM2
pm2 start npm --name "moklabs" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command PM2 outputs
```

#### 5. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/moklabs.com.br
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name moklabs.com.br www.moklabs.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/moklabs.com.br /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
# Get SSL certificate
sudo certbot --nginx -d moklabs.com.br -d www.moklabs.com.br

# Follow prompts and select redirect HTTP to HTTPS
```

#### 7. Verify Deployment

Visit `https://moklabs.com.br` and verify the site is working.

### Updates and Maintenance

```bash
# Pull latest changes
cd /var/www/moklabs/nextjs-migration
git pull origin main

# Install dependencies
npm ci --production

# Rebuild
npm run build

# Restart PM2
pm2 restart moklabs

# Check logs
pm2 logs moklabs
```

---

## Docker Deployment

Deploy using Docker containers for consistency across environments.

### Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Create .dockerignore

```
node_modules
.next
.git
.env.local
*.md
docs
.vscode
.idea
```

### Build and Run

```bash
# Build Docker image
docker build -t moklabs-landing .

# Run container
docker run -d \
  --name moklabs \
  -p 3000:3000 \
  -e RESEND_API_KEY=your_key \
  -e FROM_EMAIL=contato@moklabs.com.br \
  -e TO_EMAIL=contato@moklabs.com.br \
  moklabs-landing

# View logs
docker logs -f moklabs
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - RESEND_API_KEY=${RESEND_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - TO_EMAIL=${TO_EMAIL}
      - FROM_NAME=${FROM_NAME}
      - NEXT_PUBLIC_GA_TRACKING_ID=${NEXT_PUBLIC_GA_TRACKING_ID}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
    restart: unless-stopped
```

Run with Docker Compose:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Custom Domain Setup

### DNS Configuration

Configure your DNS records with your domain registrar:

#### A Record (Root Domain)

```
Type: A
Name: @
Value: [Your server IP or platform IP]
TTL: 3600
```

#### CNAME Record (WWW)

```
Type: CNAME
Name: www
Value: [Your primary domain or platform domain]
TTL: 3600
```

### Platform-Specific DNS

**Vercel:**

```
A Record: @ → 76.76.21.21
CNAME: www → cname.vercel-dns.com
```

**Netlify:**

```
A Record: @ → 75.2.60.5
CNAME: www → [your-site].netlify.app
```

**Cloudflare (recommended for DNS):**

1. Add your domain to Cloudflare
2. Update nameservers at registrar
3. Set A and CNAME records
4. Enable proxy (orange cloud) for DDoS protection
5. Enable SSL/TLS (Full or Full Strict mode)

### SSL Certificate

- **Vercel/Netlify:** Automatic SSL provisioning
- **Let's Encrypt (self-hosted):** Use Certbot
- **Cloudflare:** Automatic with Universal SSL

---

## Post-Deployment Checklist

After deployment, verify the following:

### ✅ Functionality

- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Blog posts display
- [ ] Contact form sends emails
- [ ] 404 pages display
- [ ] Error boundaries work

### ✅ Performance

- [ ] Lighthouse audit (90+ performance)
- [ ] Core Web Vitals in "Good" range
- [ ] Images optimized and loading
- [ ] No console errors

### ✅ SEO

- [ ] Meta tags present
- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Robots.txt accessible (`/robots.txt`)
- [ ] Canonical URLs set
- [ ] Open Graph tags present

### ✅ Analytics

- [ ] Google Analytics tracking
- [ ] Vercel Analytics enabled (if using Vercel)
- [ ] Cookie consent working

### ✅ Security

- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No exposed secrets
- [ ] CORS configured

### ✅ Monitoring

- [ ] Error tracking setup (optional)
- [ ] Uptime monitoring (optional)
- [ ] Performance monitoring (optional)

---

## Troubleshooting

### Build Failures

**Error: Module not found**

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Error: Out of memory**

```bash
# Increase Node memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Environment Variable Issues

**Variables not accessible**

- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Verify variables set in deployment platform
- Restart deployment after adding variables
- Check for typos in variable names

### Contact Form Not Working

**Emails not sending**

1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for errors
3. Verify domain is verified in Resend
4. Check email addresses are correct
5. Look at server logs for errors

### Performance Issues

**Slow page loads**

1. Run Lighthouse audit
2. Check image optimization
3. Verify CDN is working
4. Check server response times
5. Review bundle sizes

### Domain Issues

**Domain not resolving**

1. Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
2. Verify DNS records are correct
3. Wait up to 48 hours for propagation
4. Check nameservers are correct

**SSL Certificate Errors**

1. Verify domain ownership
2. Check DNS records
3. Wait for certificate provisioning (can take up to 24 hours)
4. Contact platform support if persists

### Deployment Platform Issues

**Vercel:**

- Check [status.vercel.com](https://status.vercel.com)
- Review deployment logs
- Contact support via dashboard

**Netlify:**

- Check [status.netlify.com](https://status.netlify.com)
- Review build logs
- Contact support

---

## Support and Resources

### Platform Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [AWS Amplify Docs](https://docs.amplify.aws)
- [DigitalOcean Docs](https://docs.digitalocean.com)

### Next.js Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

### Community

- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Document Version:** 1.0
**Last Updated:** October 9, 2025
**Maintainer:** Mok Labs
