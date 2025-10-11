# Lighthouse Audit Guide

## How to Run and Interpret Lighthouse Audits

**Last Updated:** October 9, 2025

---

## Overview

Lighthouse is an open-source, automated tool for improving the quality of web pages. It audits performance, accessibility, best practices, SEO, and Progressive Web App (PWA) capabilities.

---

## Running Lighthouse Audits

### Method 1: Chrome DevTools (Recommended for Development)

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

   Or for production build:

   ```bash
   npm run build
   npm start
   ```

2. **Open Chrome Browser**
   - Navigate to your local server: `http://localhost:3000`

3. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

4. **Run Lighthouse**
   - Click the "Lighthouse" tab in DevTools
   - Select categories to audit:
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO
     - ⬜ Progressive Web App (optional)
   - Select device type: Mobile or Desktop
   - Click "Analyze page load"

5. **View Results**
   - Lighthouse will generate a comprehensive report
   - Scores range from 0-100 (higher is better)
   - Review opportunities and diagnostics

### Method 2: Lighthouse CI (Command Line)

```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run audit on localhost
lighthouse http://localhost:3000 --view

# Run audit on production URL
lighthouse https://moklabs.com.br --view

# Generate JSON report
lighthouse https://moklabs.com.br --output json --output-path ./lighthouse-report.json

# Run audit for specific device
lighthouse https://moklabs.com.br --preset=desktop --view
lighthouse https://moklabs.com.br --preset=mobile --view
```

### Method 3: PageSpeed Insights (Production Only)

1. Visit: https://pagespeed.web.dev/
2. Enter your URL: `https://moklabs.com.br`
3. Click "Analyze"
4. View results for both Mobile and Desktop

---

## Understanding Lighthouse Scores

### Score Ranges

| Score                | Range  | Description                   |
| -------------------- | ------ | ----------------------------- |
| 🟢 Good              | 90-100 | Excellent performance         |
| 🟡 Needs Improvement | 50-89  | Some optimization needed      |
| 🔴 Poor              | 0-49   | Significant issues to address |

### Performance Metrics

#### Core Web Vitals (Most Important)

1. **Largest Contentful Paint (LCP)** 🎯
   - **Good:** < 2.5s
   - **Needs Improvement:** 2.5s - 4.0s
   - **Poor:** > 4.0s
   - **Impact:** User experience, SEO ranking
   - **How to improve:**
     - Optimize images (use Next.js `<Image />`)
     - Reduce server response time
     - Eliminate render-blocking resources

2. **First Input Delay (FID)** / **Interaction to Next Paint (INP)** 🎯
   - **Good:** < 100ms (FID), < 200ms (INP)
   - **Needs Improvement:** 100-300ms (FID), 200-500ms (INP)
   - **Poor:** > 300ms (FID), > 500ms (INP)
   - **Impact:** Interactivity, user frustration
   - **How to improve:**
     - Reduce JavaScript execution time
     - Split large bundles
     - Use code splitting and lazy loading

3. **Cumulative Layout Shift (CLS)** 🎯
   - **Good:** < 0.1
   - **Needs Improvement:** 0.1 - 0.25
   - **Poor:** > 0.25
   - **Impact:** Visual stability, user experience
   - **How to improve:**
     - Add size attributes to images
     - Reserve space for ads and embeds
     - Avoid inserting content above existing content

#### Additional Performance Metrics

4. **First Contentful Paint (FCP)**
   - **Good:** < 1.8s
   - **Poor:** > 3.0s
   - **Description:** Time when first content is rendered

5. **Time to Interactive (TTI)**
   - **Good:** < 3.8s
   - **Poor:** > 7.3s
   - **Description:** Time until page is fully interactive

6. **Speed Index**
   - **Good:** < 3.4s
   - **Poor:** > 5.8s
   - **Description:** How quickly content is visually displayed

7. **Total Blocking Time (TBT)**
   - **Good:** < 200ms
   - **Poor:** > 600ms
   - **Description:** Time when main thread is blocked

---

## Current Project Expectations

### Expected Scores (Estimates)

Based on the current build configuration:

#### Performance

- **Expected:** 🟡 **70-85**
- **Issues:**
  - 18 instances of `<img>` instead of `<Image />`
  - Bundle size: 389 kB (acceptable but could be better)
  - No image optimization in place
- **Opportunities:**
  - Migrate to Next.js `<Image />`
  - Implement lazy loading for images
  - Optimize bundle size

#### Accessibility

- **Expected:** 🟢 **85-95**
- **Strengths:**
  - Semantic HTML
  - Portuguese language attributes
  - Proper heading hierarchy
- **Potential Issues:**
  - Image alt text (needs verification)
  - Color contrast (needs testing)
  - ARIA labels (needs review)

#### Best Practices

- **Expected:** 🟢 **90-100**
- **Strengths:**
  - Security headers configured
  - HTTPS enforced
  - No console errors
  - Modern JavaScript

#### SEO

- **Expected:** 🟢 **95-100**
- **Strengths:**
  - Meta tags configured
  - Sitemap and robots.txt
  - Semantic HTML
  - Mobile-friendly
  - Structured data potential

---

## Pages to Audit

Audit all major pages to get a comprehensive picture:

1. **Home Page** - `/`
   - Priority: 🔴 **HIGH**
   - Most visited page, first impression

2. **PNLD Page** - `/pnld`
   - Priority: 🔴 **HIGH**
   - Main product/service page

3. **Blog Listing** - `/blog`
   - Priority: 🟡 **MEDIUM**
   - Content discovery page

4. **Blog Post** - `/blog/[slug]`
   - Priority: 🟡 **MEDIUM**
   - Example: `/blog/acessibilidade-digital-pnld`

5. **Privacy Policy** - `/politica-de-privacidade`
   - Priority: 🟢 **LOW**
   - Legal page, low traffic

---

## Interpreting Results

### Performance Opportunities

Look for these common opportunities in the report:

1. **Properly size images**
   - Action: Use Next.js `<Image />` component
   - Expected impact: High

2. **Serve images in next-gen formats**
   - Action: Enable AVIF/WebP (already configured in next.config.mjs)
   - Expected impact: Medium

3. **Eliminate render-blocking resources**
   - Action: Inline critical CSS, defer non-critical resources
   - Expected impact: Medium

4. **Reduce unused JavaScript**
   - Action: Code splitting, tree shaking
   - Expected impact: Medium

5. **Minimize main thread work**
   - Action: Optimize JavaScript execution
   - Expected impact: High

### Accessibility Diagnostics

Common accessibility issues to check:

1. **Image elements have `[alt]` attributes**
   - Current status: ⚠️ Needs review
   - Action: Verify all images have descriptive alt text

2. **Background and foreground colors have sufficient contrast**
   - Current status: ⚠️ Needs testing
   - Action: Test with contrast checker

3. **Links have discernible names**
   - Current status: ✅ Likely passing
   - Action: Verify all links are labeled

4. **`[aria-*]` attributes are valid**
   - Current status: ⚠️ Needs review
   - Action: Check ARIA implementation

---

## Taking Action on Results

### High-Priority Fixes (Biggest Impact)

1. **Migrate `<img>` to Next.js `<Image />`**
   - Files affected: 18 instances in component files
   - Expected improvement: +15-20 Performance points
   - Time estimate: 2-3 hours

2. **Add explicit width/height to images**
   - Prevents CLS (layout shift)
   - Expected improvement: Better CLS score
   - Time estimate: 1 hour

3. **Optimize font loading**
   - Already using `next/font` with Fira Code
   - Verify font-display strategy
   - Expected improvement: +5 Performance points

### Medium-Priority Fixes

1. **Implement lazy loading**
   - For images below the fold
   - For heavy components
   - Expected improvement: +5-10 Performance points

2. **Fix TypeScript `any` types**
   - Improve code quality
   - No direct Lighthouse impact
   - Developer experience improvement

3. **Add missing alt text**
   - Improve accessibility score
   - Expected improvement: +5-10 Accessibility points

### Low-Priority Optimizations

1. **Reduce bundle size**
   - Current: 389 kB (acceptable)
   - Target: < 300 kB (good)
   - Expected improvement: +5 Performance points

2. **Implement service worker (PWA)**
   - Enable offline functionality
   - Add PWA score
   - Time estimate: 4-6 hours

---

## Tracking Improvements

### Create a Lighthouse Audit Log

Document each audit run to track improvements over time:

```markdown
## Audit Log

### Audit #1 - Baseline (October 9, 2025)

- **URL:** http://localhost:3000
- **Device:** Desktop
- **Performance:** 75
- **Accessibility:** 90
- **Best Practices:** 95
- **SEO:** 100

**Key Issues:**

- Images not optimized
- LCP: 3.2s (needs improvement)
- CLS: 0.15 (needs improvement)

**Action Items:**

1. Migrate to Next.js Image component
2. Add image dimensions
3. Optimize hero image

---

### Audit #2 - After Image Optimization (TBD)

- **URL:** http://localhost:3000
- **Device:** Desktop
- **Performance:** [TBD]
- **Accessibility:** [TBD]
- **Best Practices:** [TBD]
- **SEO:** [TBD]

**Changes Made:**

1. Migrated all `<img>` to `<Image />`
2. Added explicit dimensions
3. Enabled AVIF format

**Results:**

- [To be filled after audit]
```

---

## Automated Lighthouse Testing

### Using Lighthouse CI in GitHub Actions

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start server
        run: npm start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## Resources

### Official Documentation

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### Tools

- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Next.js Optimization Guides

- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)

---

## Next Steps

1. **Run initial Lighthouse audit** to establish baseline scores
2. **Document baseline scores** in LIGHTHOUSE_AUDIT_RESULTS.md
3. **Prioritize fixes** based on impact vs effort
4. **Implement high-priority optimizations** (migrate images)
5. **Re-run audit** to measure improvements
6. **Repeat** until target scores are achieved

**Target Scores:**

- Performance: 🟢 **90+**
- Accessibility: 🟢 **95+**
- Best Practices: 🟢 **95+**
- SEO: 🟢 **100**

---

**Document Version:** 1.0
**Last Updated:** October 9, 2025
