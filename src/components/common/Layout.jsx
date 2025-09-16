import { Outlet } from 'react-router-dom';
import SEOHead from './SEOHead';

const Layout = ({ title, description, keywords }) => {
  return (
    <>
      <SEOHead title={title} description={description} keywords={keywords} />
      <div className="min-h-screen bg-white">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;