import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { serviceApi, Service, CreateServiceInput, UpdateServiceInput } from '../../services/api';


// Upload a file to cPanel server and return the public URL
async function uploadToCpanel(file: File): Promise<string> {
  const formData = new FormData();
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  formData.append('file', file, uniqueName);
  const response = await fetch('https://osamaqaseem.online/upload.php', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (data.url) {
    return data.url;
  } else {
    throw new Error(data.error || 'Upload failed');
  }
}

// Service-specific image upload
async function uploadServiceImage(file: File): Promise<string> {
  const formData = new FormData();
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-service-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  formData.append('file', file, uniqueName);
  const response = await fetch('https://osamaqaseem.online/upload.php', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (data.url) {
    return data.url;
  } else {
    throw new Error(data.error || 'Upload failed');
  }
}

const ServiceForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CreateServiceInput>({
    title: '',
    description: '',
    featuredImage: ''
  });
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [previewFeatured, setPreviewFeatured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      serviceApi.getById(id)
        .then(res => {
          setForm({
            title: res.data.title,
            description: res.data.description,
            featuredImage: res.data.featuredImage || ''
          });
          setPreviewFeatured(res.data.featuredImage ? res.data.featuredImage : null);
        })
        .catch(() => setError('Failed to load service'))
        .finally(() => setLoading(false));
    } else {
      setForm({ title: '', description: '', featuredImage: '' });
      setFeaturedImageFile(null);
      setPreviewFeatured(null);
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImageFile(e.target.files[0]);
      setPreviewFeatured(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let featuredImageUrl = form.featuredImage;
      if (featuredImageFile instanceof File) {
        featuredImageUrl = await uploadToCpanel(featuredImageFile);
      }
      // Always set featuredImage, even if empty
      const payload = {
        ...form,
        featuredImage: featuredImageUrl || '',
      };
      // Debug log
      console.log('Submitting service:', payload);
      if (isEdit && id) {
        await serviceApi.update(id, payload as UpdateServiceInput);
      } else {
        await serviceApi.create(payload);
        setForm({ title: '', description: '', featuredImage: '' });
        setFeaturedImageFile(null);
        setPreviewFeatured(null);
      }
      navigate('/services');
    } catch (err) {
      setError('Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link to="/services" className="inline-block mb-2 px-4 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">← Back</Link>
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Service' : 'Add Service'}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const url = await uploadServiceImage(e.target.files[0]);
                setFeaturedImageFile(null);
                setPreviewFeatured(url);
                setForm(prev => ({ ...prev, featuredImage: url }));
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
          />
          {previewFeatured && (
            <div className="relative inline-block mt-2">
              <img src={previewFeatured} alt="Preview" className="h-32 w-32 object-cover rounded border" />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                onClick={() => {
                  setPreviewFeatured('');
                  setForm(prev => ({ ...prev, featuredImage: '' }));
                }}
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Add Service'}
        </button>
      </form>
    </div>
  );
};

export default ServiceForm; 