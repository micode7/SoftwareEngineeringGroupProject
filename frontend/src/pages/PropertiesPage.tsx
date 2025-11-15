import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import PropertyForm from '../components/PropertyForm';

export interface Unit {
  id: number;
  unitNumber: string;
  status: string;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
}

export interface Property {
  id: number;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  units?: Unit[];
}

function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get<Property[]>('/properties');
      setProperties(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
  <div className="space-y-6">
    <section className="bg-white rounded-3xl border-2 border-[#A1CBC9] shadow-lg p-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#333333] mb-1">
            Properties
          </h2>
          <p className="text-sm text-[#551900]/80">
            Basic CRUD for properties & units. Other modules (tenants, leases,
            tickets) can copy this pattern.
          </p>
        </div>
      </div>

      {/* Add Property card is already nicely styled */}
      <PropertyForm onCreated={loadProperties} />

      {loading ? (
        <p className="text-sm text-[#333333]">Loading...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border-2 border-[#A1CBC9] bg-white shadow-md p-5 space-y-3 flex flex-col justify-between hover:shadow-lg hover:border-[#038391] transition"
            >
              <div>
                <h3 className="font-semibold text-lg text-[#333333]">
                  {p.name}
                </h3>
                <p className="text-sm text-[#333333]/80">
                  {p.address}
                  {p.city && `, ${p.city}`}
                  {p.state && `, ${p.state}`}
                  {p.zip && ` ${p.zip}`}
                </p>
                <p className="text-xs text-[#551900]/70 mt-2">
                  Units:{' '}
                  <span className="font-semibold">{p.units?.length ?? 0}</span>
                </p>
              </div>
              <div className="mt-3 text-right">
                <Link
                  to={`/properties/${p.id}`}
                  className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-[#038391] text-white hover:bg-[#CF4240] transition"
                >
                  View units →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);
}

export default PropertiesPage;
