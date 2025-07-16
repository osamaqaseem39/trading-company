import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandApi, Brand } from '../../services/api';

const BrandList: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brands</h1>
        <Link to="/brands/add" className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Add Brand</Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        Array.isArray(brands) && brands.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="px-4 py-2 border">
                      {b.image && <img src={`${b.image.replace('uploads', 'uploads')}`} alt={b.name} className="w-16 h-16 object-cover rounded" />}
                    </td>
                    <td className="px-4 py-2 border font-medium">{b.name}</td>
                    <td className="px-4 py-2 border">{b.description}</td>
                    <td className="px-4 py-2 border">
                      <Link to={`/brands/${b._id}/edit`} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition mr-2">Edit</Link>
                      <button onClick={() => handleDelete(b._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">No brands found.</div>
        )
      )}
    </div>
  );
};

export default BrandList; 