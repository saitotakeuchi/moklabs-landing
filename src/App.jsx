import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common';
import { Home } from './pages';

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
