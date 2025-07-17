import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, Category } from '../../services/api';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await categoryApi.delete(id);
      setCategories(categories => categories.filter(c => c._id !== id));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Link to="/categories/add" className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Add Category</Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        Array.isArray(categories) && categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Parent</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="px-4 py-2 border">
                      {c.image && <img src={`${c.image.replace('uploads', 'uploads')}`} alt={c.name} className="w-16 h-16 object-cover rounded" />}
                    </td>
                    <td className="px-4 py-2 border font-medium">{c.name}</td>
                    <td className="px-4 py-2 border">{c.description}</td>
                    <td className="px-4 py-2 border">{typeof c.parent === 'object' && c.parent ? (c.parent as Category).name : ''}</td>
                    <td className="px-4 py-2 border">
                      <Link to={`/categories/${c._id}/edit`} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition mr-2">Edit</Link>
                      <button onClick={() => handleDelete(c._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">No categories found.</div>
        )
      )}
    </div>
  );
};

export default CategoryList; 