import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { Property } from './PropertiesPage';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

type EditForm = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: string;
  baths: string;
};

function AllPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    beds: '',
    baths: '',
  });

  // 🔍 filter state
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'ALL' | string>('ALL');
  const [minBeds, setMinBeds] = useState('');

  // load all properties
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<Property[]>('/properties');
        setProperties(res.data);
      } catch (err) {
        console.error('Failed to load properties', err);
        alert('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalUnits = (p: Property) => p.units?.length ?? 0;

  // ----- modal helpers -----
  function openEditModal(p: Property) {
    setEditingProperty(p);
    setEditForm({
      name: p.name ?? '',
      address: p.address ?? '',
      city: p.city ?? '',
      state: p.state ?? '',
      zip: p.zip ?? '',
      beds: p.beds != null ? String(p.beds) : '',
      baths: p.baths != null ? String(p.baths) : '',
    });
  }

  function closeEditModal() {
    setEditingProperty(null);
  }

  function handleEditChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingProperty) return;

    if (!editForm.name.trim() || !editForm.address.trim()) {
      alert('Name and address are required.');
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      address: editForm.address.trim(),
      city: editForm.city.trim() || undefined,
      state: editForm.state.trim() || undefined,
      zip: editForm.zip.trim() || undefined,
      beds: editForm.beds ? Number(editForm.beds) : undefined,
      baths: editForm.baths ? Number(editForm.baths) : undefined,
    };

    try {
      const res = await api.put<Property>(
        `/properties/${editingProperty.id}`,
        payload,
      );

      setProperties((prev) =>
        prev.map((p) => (p.id === editingProperty.id ? res.data : p)),
      );
      closeEditModal();
    } catch (err) {
      console.error('Failed to update property', err);
      alert('Failed to update property');
    }
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

  // 🔍 derive unique state list for dropdown
  const stateOptions = Array.from(
    new Set(
      properties
        .map((p) => p.state)
        .filter((s): s is string => Boolean(s)),
    ),
  ).sort();

  // 🔍 filtered list
  const filtered = properties.filter((p) => {
    const haystack = (
      (p.name || '') +
      ' ' +
      (p.address || '') +
      ' ' +
      (p.city || '') +
      ' ' +
      (p.state || '') +
      ' ' +
      (p.zip || '')
    )
      .toLowerCase()
      .trim();

    if (search && !haystack.includes(search.toLowerCase().trim())) {
      return false;
    }

    if (stateFilter !== 'ALL' && (p.state || '') !== stateFilter) {
      return false;
    }

    if (minBeds) {
      const min = Number(minBeds);
      const beds = p.beds ?? 0;
      if (!Number.isNaN(min) && beds < min) {
        return false;
      }
    }

    return true;
  });

  return (
    <div>
      {/* Title card */}
      <div className="card crm-page-header-card">
        <h2 className="page-title text-xl font-semibold text-[#333333]">
          All properties
        </h2>
        <p className="text-sm text-[#551900]/80">
          Full portfolio view in the same card format used on the dashboard.
        </p>
      </div>

      {/* 🔍 Filters card (new) */}
      <div className="card crm-page-list crm-filter-card">
        <div className="crm-filter-header">
          <div>
            <h3 className="text-sm font-semibold text-[#333333]">
              Filter properties
            </h3>
            <p className="text-xs text-[#551900]/80">
              Narrow by name/address, state, or minimum number of beds.
            </p>
          </div>
        </div>

        <div className="crm-filter-row">
          {/* search text */}
          <div className="crm-filter-block">
            <label className="crm-filter-label">Search</label>
            <input
              className="crm-filter-input"
              placeholder="Search by name, address, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* state dropdown */}
          <div className="crm-filter-block crm-filter-block--sm">
            <label className="crm-filter-label">State</label>
            <select
              className="crm-filter-select"
              value={stateFilter}
              onChange={(e) =>
                setStateFilter(e.target.value as 'ALL' | string)
              }
            >
              <option value="ALL">All states</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* min beds */}
          <div className="crm-filter-block crm-filter-block--sm">
            <label className="crm-filter-label">Min beds</label>
            <input
              className="crm-filter-input"
              type="number"
              min={0}
              value={minBeds}
              onChange={(e) => setMinBeds(e.target.value)}
              placeholder="e.g., 2"
            />
          </div>
        </div>
      </div>

      {/* List all properties using the entry-card style */}
      <div className="crm-page-list property-list">
        {loading ? (
          <p className="text-xs text-[#333333]/70">Loading properties…</p>
        ) : properties.length === 0 ? (
          <p className="text-xs text-[#333333]/70">
            No properties yet. Use the Manage Properties page to add some.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-[#333333]/70">
            No properties match the current filters.
          </p>
        ) : (
          filtered.map((p) => {
            const unitCount = totalUnits(p);
            const cityStateLine = [p.city, p.state].filter(Boolean).join(', ');
            const bedsLabel = p.beds != null ? `${p.beds} bed` : undefined;
            const bathsLabel =
              p.baths != null ? `${p.baths} bath` : undefined;

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
                      onClick={() => openEditModal(p)}
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
          })
        )}
      </div>

      {/* Edit modal (unchanged) */}
      {editingProperty && (
        <div className="crm-modal-backdrop">
          <div className="crm-modal">
            <div className="crm-modal-header">
              <h3 className="crm-modal-title">Edit property</h3>
              <button
                type="button"
                className="property-entry-chip-btn"
                onClick={closeEditModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="crm-modal-body space-y-2 text-sm">
                {/* inputs kept the same */}
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    Name *
                  </label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="crm-field"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#333333]">
                    Address *
                  </label>
                  <input
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="crm-field"
                    required
                  />
                </div>

                {/* City / State / ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#333333]">
                      City
                    </label>
                    <input
                      name="city"
                      value={editForm.city}
                      onChange={handleEditChange}
                      className="crm-field"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#333333]">
                      State
                    </label>
                    <input
                      name="state"
                      value={editForm.state}
                      onChange={handleEditChange}
                      className="crm-field"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#333333]">
                      ZIP
                    </label>
                    <input
                      name="zip"
                      value={editForm.zip}
                      onChange={handleEditChange}
                      className="crm-field"
                    />
                  </div>
                </div>

                {/* Beds / Baths */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#333333]">
                      Beds
                    </label>
                    <input
                      name="beds"
                      type="number"
                      min={0}
                      value={editForm.beds}
                      onChange={handleEditChange}
                      className="crm-field"
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
                      value={editForm.baths}
                      onChange={handleEditChange}
                      className="crm-field"
                    />
                  </div>
                </div>
              </div>

              <div className="crm-modal-footer">
                <button
                  type="button"
                  className="property-entry-chip-btn"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button type="submit" className="crm-primary-btn">
                  <span>Save changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllPropertiesPage;
