import { Outlet } from 'react-router-dom';
import SEOHead from './SEOHead';
import CookieConsent from './CookieConsent';
import GoogleAnalytics from './GoogleAnalytics';
import VercelAnalytics from './VercelAnalytics';

const Layout = ({ title, description, keywords }) => {
  return (
    <>
      <SEOHead title={title} description={description} keywords={keywords} />
      <GoogleAnalytics />
      <VercelAnalytics />
      <div className="min-h-screen bg-white">
        <Outlet />
        <CookieConsent />
      </div>
    </>
  );
};

export default Layout;