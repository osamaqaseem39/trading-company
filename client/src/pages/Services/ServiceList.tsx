import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceApi, Service } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    serviceApi.getAll()
      .then(res => setServices(Array.isArray(res.data) ? res.data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await serviceApi.delete(id);
      setServices(services => services.filter(s => s._id !== id));
    }
  };

  const openModal = (img: string) => {
    setModalImg(img.replace('server/', ''));
    setModalOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
        <Link to="/services/add" className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Add Service</Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        Array.isArray(services) && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id} className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 flex flex-col hover:shadow-2xl transition-shadow">
                {service.featuredImage && (
                  <img
                    src={service.featuredImage.replace('server/', '')}
                    alt={service.title}
                    className="h-48 w-full object-cover mb-3 rounded-lg cursor-pointer transition-transform hover:scale-105"
                    onClick={() => openModal(service.featuredImage!)}
                  />
                )}
                <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200">{service.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{service.description}</p>
                <div className="mt-auto flex gap-2">
                  <Link to={`/services/${service._id}`} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">View</Link>
                  <Link to={`/services/${service._id}/edit`} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition">Edit</Link>
                  <button onClick={() => handleDelete(service._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">No services found.</div>
        )
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isFullscreen={false}>
        {modalImg && (
          <img src={modalImg} alt="Preview" className="max-h-[80vh] max-w-full rounded-lg mx-auto" />
        )}
      </Modal>
    </div>
  );
};

export default ServiceList; 