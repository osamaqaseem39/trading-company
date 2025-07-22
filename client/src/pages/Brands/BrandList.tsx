import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandApi, Brand } from '../../services/api';

const BrandList: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    brandApi.getAll()
      .then(res => setBrands(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      await brandApi.delete(id);
      setBrands(brands => brands.filter(b => b._id !== id));
    }
  };

  // Search and sort logic
  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] || '';
    const bVal = b[sortKey] || '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const handleSort = (key: 'name') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="w-full p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#062373' }}>Brands</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64 text-[#062373]"
              style={{ color: '#062373' }}
            />
            <Link to="/brands/add" className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Add Brand</Link>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64" style={{ color: '#062373' }}>Loading...</div>
        ) : (
          sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full w-full border border-gray-200 rounded-lg text-[#062373]">
                <thead className="text-[#062373]">
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Image</th>
                    <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('name')}>
                      Name {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#062373]">
                  {sorted.map((b) => (
                    <tr key={b._id} className="border-t">
                      <td className="px-4 py-2 border">
                        {b.image && <img src={`${b.image.replace('uploads', 'uploads')}`} alt={b.name} className="w-16 h-16 object-cover rounded" />}
                      </td>
                      <td className="px-4 py-2 border font-medium">{b.name}</td>
                      <td className="px-4 py-2 border">{b.description}</td>
                      <td className="px-4 py-2 border">
                        <Link to={`/brands/${b._id}/edit`} className="px-3 py-1 rounded font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition mr-2">Edit</Link>
                        <button onClick={() => handleDelete(b._id)} className="px-3 py-1 rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64" style={{ color: '#062373' }}>No brands found.</div>
          )
        )}
      </div>
    </div>
  );
};

export default BrandList; 