// Export page components with lazy loading
import { lazy } from 'react';

export const Home = lazy(() => import('./Home'));
export const MainLanding = lazy(() => import('./MainLanding'));
export const PnldLanding = lazy(() => import('./PnldLanding'));
export const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));