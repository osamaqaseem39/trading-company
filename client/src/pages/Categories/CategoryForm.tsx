import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, Category } from '../../services/api';

const initialState = {
  name: '',
  description: '',
  image: undefined as File | undefined,
  parent: '',
};

type CategoryFormMode = 'add' | 'edit';

const CategoryForm: React.FC<{ mode?: CategoryFormMode }> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === 'edit' || !!id;

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setAllCategories(Array.isArray(res.data) ? res.data : []));
    if (isEdit && id) {
      setLoading(true);
      categoryApi.getById(id)
        .then(res => {
          setForm({
            name: res.data.name,
            description: res.data.description || '',
            image: undefined,
            parent: res.data.parent && typeof res.data.parent === 'object' ? (res.data.parent as Category)._id : (res.data.parent || ''),
          });
          setPreview(res.data.image ? `/${res.data.image.replace('uploads', 'uploads')}` : undefined);
        })
        .catch(() => setError('Failed to load category'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (form.image) formData.append('image', form.image);
      if (form.parent) formData.append('parent', form.parent);
      if (isEdit && id) {
        await categoryApi.update(id, formData);
      } else {
        await categoryApi.create(formData);
      }
      navigate('/categories');
    } catch (err) {
      setError('Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-brand-700 dark:text-brand-400">{isEdit ? 'Edit Category' : 'Add Category'}</h1>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Category Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition" placeholder="Enter category name" />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition" rows={3} placeholder="Enter category description" />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Parent Category (optional)</label>
            <select name="parent" value={form.parent} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition">
              <option value="">None</option>
              {allCategories.filter(c => !isEdit || c._id !== id).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Image</label>
            <div className="flex items-center gap-6">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition" />
              {preview && <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow" />}
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Category' : 'Add Category'}</button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 