import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { brandApi, Brand } from '../../services/api';

const initialState = {
  name: '',
  description: '',
  image: undefined as File | undefined,
};

type BrandFormMode = 'add' | 'edit';

const BrandForm: React.FC<{ mode?: BrandFormMode }> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [preview, setPreview] = useState<string | undefined>(undefined);
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
            image: undefined,
          });
          setPreview(res.data.image ? `/${res.data.image.replace('uploads', 'uploads')}` : undefined);
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
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (form.image) formData.append('image', form.image);
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
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Brand' : 'Add Brand'}</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block font-medium mb-1">Brand Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input" rows={3} />
        </div>
        <div>
          <label className="block font-medium mb-1">Image</label>
          <div className="flex items-center gap-4">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="input" />
            {preview && <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />}
          </div>
        </div>
        <button type="submit" className="bg-green-700 text-white px-6 py-2 rounded font-semibold hover:bg-green-800 transition" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Brand' : 'Add Brand'}</button>
      </form>
    </div>
  );
};

export default BrandForm; 