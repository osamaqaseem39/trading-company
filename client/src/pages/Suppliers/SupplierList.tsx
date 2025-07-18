import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supplierApi, SupplierRequest } from '../../services/api';

const SupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'companyName' | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    supplierApi.getAll()
      .then(res => setSuppliers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  }, []);

  // Search and sort logic
  const filtered = suppliers.filter(s =>
    (`${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.companyName.toLowerCase().includes(search.toLowerCase()))
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = '';
    let bVal = '';
    if (sortKey === 'name') {
      aVal = `${a.firstName} ${a.lastName}`;
      bVal = `${b.firstName} ${b.lastName}`;
    } else if (sortKey === 'companyName') {
      aVal = a.companyName;
      bVal = b.companyName;
    }
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const handleSort = (key: 'name' | 'companyName') => {
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
          <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>Supplier Requests</h1>
          <input
            type="text"
            placeholder="Search by name or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-64 text-[#2d2d2d]"
            style={{ color: '#2d2d2d' }}
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64" style={{ color: '#2d2d2d' }}>Loading...</div>
        ) : (
          sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full w-full border border-gray-200 rounded-lg text-[#2d2d2d]">
                <thead className="text-[#2d2d2d]">
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('name')}>
                      Name {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('companyName')}>
                      Company {sortKey === 'companyName' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Phone</th>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#2d2d2d]">
                  {sorted.map((s) => (
                    <tr key={s._id} className="border-t">
                      <td className="px-4 py-2 border font-medium">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-2 border">{s.companyName}</td>
                      <td className="px-4 py-2 border">{s.email}</td>
                      <td className="px-4 py-2 border">{s.phone}</td>
                      <td className="px-4 py-2 border text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 border">
                        <Link to={`/suppliers/${s._id}`} className="px-3 py-1 rounded font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64" style={{ color: '#2d2d2d' }}>No supplier requests found.</div>
          )
        )}
      </div>
    </div>
  );
};

export default SupplierList; 