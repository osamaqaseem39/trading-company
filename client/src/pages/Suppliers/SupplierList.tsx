import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supplierApi, SupplierRequest } from '../../services/api';

const SupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierApi.getAll()
      .then(res => setSuppliers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Supplier Requests</h1>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        Array.isArray(suppliers) && suppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Company</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="px-4 py-2 border font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-2 border">{s.companyName}</td>
                    <td className="px-4 py-2 border">{s.email}</td>
                    <td className="px-4 py-2 border">{s.phone}</td>
                    <td className="px-4 py-2 border text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 border">
                      <Link to={`/suppliers/${s._id}`} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">No supplier requests found.</div>
        )
      )}
    </div>
  );
};

export default SupplierList; 