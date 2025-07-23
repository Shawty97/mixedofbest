import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Navbar from './components/layout/Navbar';
import Studio from './pages/Studio';
import Store from './pages/Store';
import Engine from './pages/Engine';
import Deploy from './pages/Deploy';
import Monitor from './pages/Monitor';
import Access from './pages/Access';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Studio />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/store" element={<Store />} />
              <Route path="/engine" element={<Engine />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/access" element={<Access />} />
            </Routes>
          </main>
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;