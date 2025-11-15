import { Routes, Route, Link } from 'react-router-dom';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';

function App() {
  return (
    <div className="min-h-screen bg-[#EEEEEE]">
      <header className="bg-[#EEEEEE] text-[#333333] px-6 py-4 flex items-center justify-between border-b-4 border-[#CF4240] shadow">
        <h1 className="font-semibold text-xl tracking-tight">LeaseLink CRM</h1>
        <nav className="space-x-4 text-sm">
          <Link
            to="/"
            className="px-3 py-1 rounded-full bg-[#038391] hover:bg-[#068460] transition text-white"
          >
            Properties
          </Link>
          {/* later: add Tenants / Leases / Tickets links here */}
        </nav>
      </header>

      <main className="px-4 py-6 sm:px-6 max-w-5xl mx-auto space-y-6">
        <Routes>
          <Route path="/" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
