import type { FormEvent } from 'react';
import { useState } from 'react';
import { api } from '../api/client';

interface Props {
  onCreated?: () => void;
}

function PropertyForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !address) {
      alert('Name and address are required');
      return;
    }

    setSaving(true);
    try {
      await api.post('/properties', {
        name,
        address,
        city,
        state: stateVal,
        zip,
      });
      setName('');
      setAddress('');
      setCity('');
      setStateVal('');
      setZip('');
      onCreated?.();
    } catch (err) {
      console.error(err);
      alert('Failed to create property');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#A1CBC9] shadow-md p-5 md:p-6 space-y-4"
    >
      <h3 className="font-semibold text-sm text-[#333333]">Add Property</h3>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#333333]">
            Name *
          </label>
          <input
            className="border border-[#A1CBC9] focus:border-[#038391] focus:ring-2 focus:ring-[#038391]/30 rounded-lg px-3 py-2 text-sm w-full outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunset Villas"
          />
        </div>

        <div className="space-y-1 md:col-span-1">
          <label className="block text-xs font-medium text-[#333333]">
            Address *
          </label>
          <input
            className="border border-[#A1CBC9] focus:border-[#038391] focus:ring-2 focus:ring-[#038391]/30 rounded-lg px-3 py-2 text-sm w-full outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#333333]">
            City
          </label>
          <input
            className="border border-[#A1CBC9] focus:border-[#038391] focus:ring-2 focus:ring-[#038391]/30 rounded-lg px-3 py-2 text-sm w-full outline-none"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="space-y-1 flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#333333]">
              State
            </label>
            <input
              className="border border-[#A1CBC9] focus:border-[#038391] focus:ring-2 focus:ring-[#038391]/30 rounded-lg px-3 py-2 text-sm w-full outline-none"
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#333333]">
              ZIP
            </label>
            <input
              className="border border-[#A1CBC9] focus:border-[#038391] focus:ring-2 focus:ring-[#038391]/30 rounded-lg px-3 py-2 text-sm w-full outline-none"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center px-4 py-1.5 text-sm rounded-full bg-[#038391] text-white font-medium disabled:opacity-50 hover:bg-[#068460] transition"
      >
        {saving ? 'Saving...' : 'Create Property'}
      </button>
    </form>
  );
}

export default PropertyForm;
