import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, Category } from '../../services/api';

const initialState = {
  name: '',
  description: '',
  image: null as string | File | null,
  parent: '',
};

type CategoryFormMode = 'add' | 'edit';

const CategoryForm: React.FC<{ mode?: CategoryFormMode }> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    name: string;
    description: string;
    image: string | File | null;
    parent: string;
  }>(initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
            image: res.data.image || '',
            parent: res.data.parent && typeof res.data.parent === 'object' ? (res.data.parent as Category)._id : (res.data.parent || ''),
          });
          setPreview(res.data.image ? `/${res.data.image.replace('uploads', 'uploads')}` : null);
        })
        .catch(() => setError('Failed to load category'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      setUploadProgress(0);
      try {
        const imageUrl = await uploadCategoryImage(file);
        setForm(prev => ({ ...prev, image: imageUrl }));
      } catch (err) {
        setError('Image upload failed');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.image) {
      setError('Please upload an image before submitting.');
      return;
    }
    setLoading(true);
    try {
      let imageUrl = form.image;
      if (form.image instanceof File) {
        imageUrl = await uploadCategoryImage(form.image);
      }
      const payload: any = {
        name: form.name,
        description: form.description,
        image: imageUrl,
      };
      if (isEdit && id) {
        await categoryApi.update(id, payload);
      } else {
        await categoryApi.create(payload);
      }
      navigate('/categories');
    } catch (err) {
      setError('Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  // Category-specific image upload
  const uploadCategoryImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}-category-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      formData.append('file', file, uniqueName);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://wingzimpex.osamaqaseem.online/upload.php');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.url) {
            setPreview(data.url);
            setForm(prev => ({ ...prev, image: data.url }));
            resolve(data.url);
          } else {
            setError(data.error || 'Upload failed');
            reject(new Error(data.error || 'Upload failed'));
          }
        } else {
          setError('Upload failed');
          reject(new Error('Upload failed'));
        }
        setUploading(false);
        setUploadProgress(0);
      };
      xhr.onerror = () => {
        setUploading(false);
        setUploadProgress(0);
        setError('Upload failed');
        reject(new Error('Upload failed'));
      };
      setUploading(true);
      setUploadProgress(0);
      xhr.send(formData);
    });
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
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  await uploadCategoryImage(e.target.files[0]);
                }
              }}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {uploadProgress < 100 ? 'Processing image...' : 'Upload complete!'}
                </p>
              </div>
            )}
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
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading || uploading}>
            {uploading ? 'Uploading Image...' : loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Category' : 'Add Category')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 