import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, Category } from '../../services/api';

const initialState = {
  name: '',
  description: '',
  image: '', // store image as string path
  parent: '',
};

type CategoryFormMode = 'add' | 'edit';

async function uploadToCpanel(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    formData.append('file', file, uniqueName);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://server.wingzimpex.com/upload.php');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        // Use a callback to update progress from inside the component
        if (typeof window !== 'undefined' && window.setUploadProgress) {
          window.setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      }
    };
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

const CategoryForm: React.FC<{ mode?: CategoryFormMode }> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [preview, setPreview] = useState<string | undefined>(undefined);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      setUploadProgress(0);
      // Attach setUploadProgress to window for use in uploadToCpanel
      (window as any).setUploadProgress = setUploadProgress;
      try {
        const imageUrl = await uploadToCpanel(file);
        setForm(prev => ({ ...prev, image: imageUrl }));
      } catch (err) {
        setError('Image upload failed');
      } finally {
        setUploading(false);
        setUploadProgress(0);
        // Clean up
        delete (window as any).setUploadProgress;
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
      const payload: any = {
        name: form.name,
        description: form.description,
        image: form.image,
      };
      if (form.parent) {
        payload.parent = form.parent;
      } else {
        payload.parent = null;
      }
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
              {uploading && (
                <div className="flex flex-col items-center ml-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-brand-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">Uploading {uploadProgress}%</span>
                </div>
              )}
            </div>
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