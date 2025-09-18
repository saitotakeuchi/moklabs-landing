# Vercel Deployment Guide

This project is configured for deployment on Vercel with serverless functions for the backend API.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Project must be pushed to GitHub
3. **Resend API Key**: Get your API key from [resend.com](https://resend.com)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select this project
4. Vercel will automatically detect the Vite framework

### 2. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
   - **Environment**: Production, Preview, Development

### 3. Deploy

1. Click **Deploy** in Vercel
2. Vercel will automatically:
   - Install dependencies
   - Build the React app
   - Deploy API functions
   - Assign a domain

## Project Structure

```
├── api/
│   ├── contact.js          # Contact form API endpoint
│   └── health.js           # Health check endpoint
├── src/                    # React frontend source
├── public/                 # Static assets
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

## API Endpoints

- **Frontend**: `https://your-domain.vercel.app`
- **Contact API**: `https://your-domain.vercel.app/api/contact`
- **Health Check**: `https://your-domain.vercel.app/api/health`

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables for Local Development

Create a `.env` file in the root directory:

```env
RESEND_API_KEY=your_resend_api_key_here
```

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

## Monitoring

- **Vercel Dashboard**: Monitor deployments, functions, and analytics
- **Speed Insights**: Real-time performance monitoring with Vercel Speed Insights
- **Health Check**: Visit `/api/health` to check API status
- **Logs**: View function logs in Vercel dashboard

## Troubleshooting

### Common Issues

1. **API Functions not working**:
   - Check environment variables are set
   - Verify RESEND_API_KEY is correct
   - Check function logs in Vercel dashboard

2. **Build failures**:
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors if applicable

3. **Contact form not working**:
   - Verify Resend domain is verified
   - Check API endpoint URL
   - Review CORS settings

### Support

- [Vercel Documentation](https://vercel.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)