import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import OS from './os/OS';

// The phone preview is served from a host without SPA fallbacks, so it routes with the hash.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '').replace(/^\.$/, '');
  return (
    <Router basename={import.meta.env.VITE_HASH_ROUTER ? undefined : basePath}>
      <Routes>
        <Route path="*" element={<OS />} />
      </Routes>
    </Router>
  );
}
