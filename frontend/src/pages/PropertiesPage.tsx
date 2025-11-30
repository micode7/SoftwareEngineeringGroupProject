import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export type Unit = {
  id: number;
  unitNumber?: string;
  status?: string;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
};

export type Property = {
  id: number;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  beds?: number | null;
  baths?: number | null;
  createdAt?: string; // for "5 most recent"
  units: Unit[];
};

type FormState = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: string;
  baths: string;
};

function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    beds: '',
    baths: '',
  });

  // ---- Load properties on mount ----
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<Property[]>('/properties');
        setProperties(res.data);
      } catch (err) {
        console.error('Error loading properties', err);
        alert('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalUnits = (p: Property) => p.units?.length ?? 0;

  // ---- Form handlers ----
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      beds: '',
      baths: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.address.trim()) {
      alert('Name and address are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      zip: form.zip.trim() || undefined,
      beds: form.beds ? Number(form.beds) : undefined,
      baths: form.baths ? Number(form.baths) : undefined,
    };

    try {
      if (editingId === null) {
        // CREATE
        const res = await api.post<Property>('/properties', payload);
        setProperties((prev) => [...prev, res.data]);
      } else {
        // UPDATE
        const res = await api.put<Property>(`/properties/${editingId}`, payload);
        setProperties((prev) =>
          prev.map((p) => (p.id === editingId ? res.data : p)),
        );
      }

      resetForm();
    } catch (err) {
      console.error('Failed to save property', err);
      alert('Failed to save property');
    }
  };

  // start editing from list
  function startEditProperty(p: Property) {
    setEditingId(p.id);
    setForm({
      name: p.name ?? '',
      address: p.address ?? '',
      city: p.city ?? '',
      state: p.state ?? '',
      zip: p.zip ?? '',
      beds: p.beds != null ? String(p.beds) : '',
      baths: p.baths != null ? String(p.baths) : '',
    });
  }

  async function handleDeleteProperty(id: number) {
    const confirmed = window.confirm(
      'Delete this property? This cannot be undone.',
    );
    if (!confirmed) return;

    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete property', err);
      alert('Failed to delete property');
    }
  }

  // ---- Derive 5 most recent properties ----
  const recentProperties = [...properties]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="crm-page">
      {/* ⭐ Title card */}
      <div className="card crm-page-header-card">
        <h2 className="page-title text-xl font-semibold text-[#333333]">
          Manage Properties
        </h2>
        <p className="text-sm text-[#551900]/80 mb-1">
          Add new properties and review your current portfolio.
        </p>
        <p className="text-xs text-[#333333]/70">
          Total properties:&nbsp;
          <span className="font-semibold">
            {loading ? '—' : properties.length}
          </span>
        </p>
      </div>

      {/* ⭐ 2×2 grid */}
      <section className="crm-grid-2x2">
        {/* Current Properties (5 most recent) */}
        <div className="card">
          <div className="property-list-header-row">
            <div>
              <h3 className="text-sm font-semibold text-[#333333] mb-1">
                Current properties
              </h3>
              <p className="text-xs text-[#551900]/80 mb-3">
                Most recently added properties in your portfolio.
              </p>
            </div>

            <Link to="/properties/all" className="crm-ghost-pill">
              <span>📋</span>
              <span>View all properties</span>
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-[#333333]/70">Loading properties…</p>
          ) : recentProperties.length === 0 ? (
            <p className="text-xs text-[#333333]/70">
              No properties yet. Use the form on the right to add your first
              property.
            </p>
          ) : (
            <div className="property-list">
              {recentProperties.map((p) => {
                const unitCount = totalUnits(p);
                const bedsLabel = p.beds != null ? `${p.beds} bed` : undefined;
                const bathsLabel =
                  p.baths != null ? `${p.baths} bath` : undefined;
                const cityStateLine = [p.city, p.state]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <article key={p.id} className="property-entry-card">
                    {/* Header band */}
                    <div className="property-entry-header">
                      <div className="property-entry-header-left">
                        <div className="property-entry-name">{p.name}</div>
                        {cityStateLine && (
                          <div className="property-entry-subtitle">
                            {cityStateLine}
                          </div>
                        )}
                      </div>
                      <div className="property-entry-pill">
                        {unitCount || 0} unit{unitCount === 1 ? '' : 's'}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="property-entry-body">
                      <div className="property-entry-address">
                        {p.address}
                        {p.zip && ` • ${p.zip}`}
                      </div>
                      {(bedsLabel || bathsLabel) && (
                        <div className="property-entry-meta">
                          {bedsLabel}
                          {bedsLabel && bathsLabel ? ' / ' : ''}
                          {bathsLabel}
                        </div>
                      )}
                    </div>

                    {/* Footer: view / edit / delete */}
                    <div className="property-entry-footer">
                      <div className="property-entry-actions">
                        <Link
                          to={`/properties/${p.id}`}
                          className="property-entry-link"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="property-entry-chip-btn"
                          onClick={() => startEditProperty(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="property-entry-chip-btn property-entry-chip-btn--danger"
                          onClick={() => handleDeleteProperty(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Add / Edit Property */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            {editingId ? 'Edit property' : 'Add property'}
          </h3>
          <p className="text-xs text-[#551900]/80 mb-3">
            {editingId
              ? 'Update the selected property details.'
              : 'Capture basics for a new property in your portfolio.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-2 text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#333333]">
                  Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="crm-field"
                  placeholder="Sunset Villas"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#333333]">
                  Address *
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="crm-field"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    City
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="crm-field"
                    placeholder="San Antonio"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    State
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="crm-field"
                    placeholder="TX"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    ZIP
                  </label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    className="crm-field"
                    placeholder="78249"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    Beds
                  </label>
                  <input
                    name="beds"
                    type="number"
                    min={0}
                    value={form.beds}
                    onChange={handleChange}
                    className="crm-field"
                    placeholder="e.g., 2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    Baths
                  </label>
                  <input
                    name="baths"
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.baths}
                    onChange={handleChange}
                    className="crm-field"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
            </div>

            <div className="crm-form-actions-row">
              <button type="submit" className="crm-primary-btn">
                {editingId ? 'Save changes' : 'Create property'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="property-entry-chip-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Top-right placeholder */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            Coming soon
          </h3>
          <p className="text-xs text-[#551900]/80">
            Reserve this space for a portfolio KPI chart, a map, or filters.
          </p>
        </div>

        {/* Bottom-right placeholder */}
        <div className="card">
          <h3 className="text-sm font-semibold text-[#333333] mb-1">
            Property insights
          </h3>
          <p className="text-xs text-[#551900]/80">
            Placeholder for future trends like occupancy, rent roll, or days
            vacant.
          </p>
        </div>
      </section>
    </div>
  );
}

export default PropertiesPage;
