import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Property, Unit } from './PropertiesPage';

function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [propRes, unitsRes] = await Promise.all([
          api.get<Property>(`/properties/${id}`),
          api.get<Unit[]>('/units', { params: { propertyId: id } }),
        ]);
        setProperty(propRes.data);
        setUnits(unitsRes.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading && !property) return <p>Loading...</p>;
  if (!property) return <p>Property not found.</p>;

  // simple unit summary for the header card
  const totalUnits = units.length;
  const vacantUnits = units.filter((u) => u.status === 'VACANT').length;
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;

  return (
    <div className="space-y-4">
      {/* Title / summary card */}
      <div className="card property-detail-header">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#333333] mb-1">
            {property.name}
          </h2>
          <p className="text-sm text-[#333333]/80">
            {property.address}
            {property.city && `, ${property.city}`}
            {property.state && `, ${property.state}`}
            {property.zip && ` ${property.zip}`}
          </p>

          {/* small unit summary under the address */}
          {totalUnits > 0 && (
            <div className="property-summary-chips">
              <span className="property-summary-chip property-summary-chip--total">
                Units: <span className="property-summary-chip-count">{totalUnits}</span>
              </span>
              <span className="property-summary-chip property-summary-chip--vacant">
                Vacant:{' '}
                <span className="property-summary-chip-count">{vacantUnits}</span>
              </span>
              <span className="property-summary-chip property-summary-chip--occupied">
                Occupied:{' '}
                <span className="property-summary-chip-count">{occupiedUnits}</span>
              </span>
            </div>
          )}
        </div>

        <div className="property-detail-header-actions">
          <Link
            to="/properties"
            className="property-entry-chip-btn"
          >
            ← Back to Manage Properties
          </Link>
          <Link
            to="/properties/all"
            className="property-entry-chip-btn"
          >
            View all properties
          </Link>
        </div>
      </div>

      {/* Units card */}
      <section className="card property-detail-section">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm mb-1 text-[#333333]">
              Units
            </h3>
            <p className="text-xs text-[#551900]/80">
              Individual units for this property with status and size.
            </p>
          </div>
        </div>

        {units.length === 0 ? (
          <p className="text-sm text-[#551900]/70">No units yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#EEEEEE]">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#A1CBC9]/30">
                <tr>
                  <th className="text-left py-2.5 px-4">Unit</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                  <th className="text-left py-2.5 px-4">Beds</th>
                  <th className="text-left py-2.5 px-4">Baths</th>
                  <th className="text-left py-2.5 px-4">SqFt</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[#EEEEEE] even:bg-[#A1CBC9]/10"
                  >
                    <td className="py-2.5 px-4">{u.unitNumber}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7D002]/20 text-[#551900]">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">{u.beds ?? '-'}</td>
                    <td className="py-2.5 px-4">{u.baths ?? '-'}</td>
                    <td className="py-2.5 px-4">{u.sqft ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PropertyDetailPage;
