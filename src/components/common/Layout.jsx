import { Outlet, useLocation } from 'react-router-dom';
import SEOHead from './SEOHead';
import CookieConsent from './CookieConsent';
import GoogleAnalytics from './GoogleAnalytics';
import VercelAnalytics from './VercelAnalytics';
import { seoConfig } from '../../config/seoConfig';

const Layout = () => {
  const location = useLocation();

  // Determine which SEO config to use based on route
  const getSEOConfig = () => {
    const path = location.pathname;
    if (path === '/pnld') return seoConfig.pnld;
    if (path === '/politica-de-privacidade') return seoConfig.privacy;
    return seoConfig.home;
  };

  const seo = getSEOConfig();

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={seo.url}
        image={seo.image}
      />
      <GoogleAnalytics />
      <VercelAnalytics />
      <div className="min-h-screen bg-white">
        <div className="pt-[60px] sm:pt-[84px] md:pt-[98px]">
          <Outlet />
        </div>
        <CookieConsent />
      </div>
    </>
  );
};

export default Layout;