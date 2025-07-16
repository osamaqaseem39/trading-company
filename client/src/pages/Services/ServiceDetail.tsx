import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { serviceApi, Service } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const ServiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      serviceApi.getById(id)
        .then(res => setService(res.data))
        .catch(() => setError('Service not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const openModal = (img: string) => {
    setModalImg(img.replace('server/', ''));
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this service?')) {
      await serviceApi.delete(id);
      navigate('/services');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error || !service) return <div className="flex justify-center items-center h-64">{error || 'Service not found'}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{service.title}</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300 text-lg">{service.description}</p>
        {service.featuredImage && (
          <img
            src={service.featuredImage.replace('server/', '')}
            alt={service.title}
            className="w-full h-72 object-cover rounded-lg mb-4 cursor-pointer transition-transform hover:scale-105"
            onClick={() => openModal(service.featuredImage!)}
          />
        )}
        <div className="flex gap-2 mt-4">
          <Link
            to="/services"
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
          >
            ← Back to Services
          </Link>
          <Link
            to={`/services/${service._id}/edit`}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Delete
          </button>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isFullscreen={false}>
        {modalImg && (
          <img src={modalImg} alt="Preview" className="max-h-[80vh] max-w-full rounded-lg mx-auto" />
        )}
      </Modal>
    </div>
  );
};

export default ServiceDetail; 