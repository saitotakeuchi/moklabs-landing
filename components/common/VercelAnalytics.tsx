import { Analytics } from '@vercel/analytics/react';

const VercelAnalytics = () => {
  // Vercel Analytics automatically detects the environment
  // It only tracks in production when deployed on Vercel
  return <Analytics />;
};

export default VercelAnalytics;
