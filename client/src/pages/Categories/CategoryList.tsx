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

  useEffect(() => {
    setLoading(true);
    const fetch = isSubcategoryList ? subcategoryApi.getAll : categoryApi.getAll;
    fetch()
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, [isSubcategoryList]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{isSubcategoryList ? 'All Subcategories' : 'All Categories'}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {categories.map(cat => (
            <li key={cat._id} className="py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{cat.name}</div>
                {cat.description && <div className="text-gray-500 text-sm">{cat.description}</div>}
              </div>
              <div className="flex gap-2">
                <Link to={isSubcategoryList ? `/subcategories/${cat._id}/edit` : `/categories/${cat._id}/edit`} className="text-indigo-600 hover:underline">Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 text-center">
        <Link to={isSubcategoryList ? '/subcategories/add' : '/categories/add'} className="bg-indigo-600 text-white px-4 py-2 rounded">{isSubcategoryList ? 'Add Subcategory' : 'Add Category'}</Link>
      </div>
    </div>
  );
};

export default CategoryList; 