import React, { useEffect, useState } from 'react';
import { categoryApi, Category } from '../../services/api';
import { subcategoryApi } from '../../services/api';
import { Link } from 'react-router-dom';

interface CategoryListProps {
  isSubcategoryList?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({ isSubcategoryList }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setLoading(true);
    const fetch = isSubcategoryList ? subcategoryApi.getAll : categoryApi.getAll;
    fetch()
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, [isSubcategoryList]);

  // Search and sort logic
  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
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

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${isSubcategoryList ? 'subcategory' : 'category'}?`)) {
      try {
        if (isSubcategoryList) {
          await subcategoryApi.delete(id);
        } else {
          await categoryApi.delete(id);
        }
        setCategories(categories => categories.filter(cat => cat._id !== id));
      } catch (err) {
        alert('Failed to delete.');
      }
    }
  };

  return (
    <div className="w-full p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-brand-700 dark:text-brand-400" style={{ color: '#062373' }}>{isSubcategoryList ? 'All Subcategories' : 'All Categories'}</h1>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-64 text-[#062373]"
            style={{ color: '#062373' }}
          />
        </div>
        {loading ? (
          <div style={{ color: '#062373' }}>Loading...</div>
        ) : (
          sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full w-full border border-gray-200 rounded-lg text-[#062373]">
                <thead className="text-[#062373]">
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('name')}>
                      Name {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#062373]">
                  {sorted.map(cat => (
                    <tr key={cat._id} className="border-t">
                      <td className="px-4 py-2 border font-semibold">{cat.name}</td>
                      <td className="px-4 py-2 border">{cat.description}</td>
                      <td className="px-4 py-2 border">
                        <Link to={isSubcategoryList ? `/subcategories/${cat._id}/edit` : `/categories/${cat._id}/edit`} className="px-3 py-1 rounded font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition mr-2">Edit</Link>
                        <button onClick={() => handleDelete(cat._id)} className="px-3 py-1 rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64" style={{ color: '#062373' }}>No {isSubcategoryList ? 'subcategories' : 'categories'} found.</div>
          )
        )}
        <div className="mt-6 text-center">
          <Link to={isSubcategoryList ? '/subcategories/add' : '/categories/add'} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow">{isSubcategoryList ? 'Add Subcategory' : 'Add Category'}</Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryList; 