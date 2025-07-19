import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { brandApi, Brand } from '../../services/api';

const initialState = {
  name: '',
  description: '',
  image: null as string | File | null,
};

type BrandFormMode = 'add' | 'edit';
// Brand-specific image upload
function uploadBrandImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-brand-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    formData.append('file', file, uniqueName);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://osamaqaseem.online/upload.php');
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.url) {
          resolve(data.url);
        } else {
          reject(new Error(data.error || 'Upload failed'));
        }
      } else {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

const BrandForm: React.FC<{ mode?: BrandFormMode }> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    name: string;
    description: string;
    image: string | File | null;
  }>(initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === 'edit' || !!id;

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      brandApi.getById(id)
        .then(res => {
          setForm({
            name: res.data.name,
            description: res.data.description || '',
            image: null,
          });
          setPreview(res.data.image ? `/${res.data.image.replace('uploads', 'uploads')}` : null);
        })
        .catch(() => setError('Failed to load brand'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      let imageUrl = '';
      if (form.image instanceof File) {
        imageUrl = await uploadBrandImage(form.image);
      } else if (typeof form.image === 'string') {
        imageUrl = form.image;
      }
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (imageUrl) formData.append('image', imageUrl);
      if (isEdit && id) {
        await brandApi.update(id, formData);
      } else {
        await brandApi.create(formData);
      }
      navigate('/brands');
    } catch (err) {
      setError('Failed to save brand.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-brand-700 dark:text-brand-400">{isEdit ? 'Edit Brand' : 'Add Brand'}</h1>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Brand Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition" placeholder="Enter brand name" />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition" rows={3} placeholder="Enter brand description" />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const url = await uploadBrandImage(e.target.files[0]);
                  setForm(prev => ({ ...prev, image: url }));
                  setPreview(url);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
            />
            {form.image && (
              <div className="relative inline-block mt-2">
                <img
                  src={form.image as string}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded border"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                  onClick={() => setForm(prev => ({ ...prev, image: null }))}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Brand' : 'Add Brand'}</button>
        </form>
      </div>
    </div>
  );
};

export default BrandForm; 