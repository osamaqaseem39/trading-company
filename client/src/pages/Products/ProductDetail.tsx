import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi, Product } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      productApi.getById(id)
        .then(res => setProduct(res.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const openModal = (img: string) => {
    setModalImg(img.replace('server/', ''));
    setModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!product) return <div className="flex justify-center items-center h-64">Product not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{product.title}</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300 text-lg">{product.description}</p>
        {product.featuredImage && (
          <img
            src={product.featuredImage.replace('server/', '')}
            alt={product.title}
            className="w-full h-72 object-cover rounded-lg mb-4 cursor-pointer transition-transform hover:scale-105"
            onClick={() => openModal(product.featuredImage!)}
          />
        )}
        {product.gallery && product.gallery.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Gallery</h2>
            <div className="grid grid-cols-3 gap-2">
              {product.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img.replace('server/', '')}
                  alt={`Gallery ${idx + 1}`}
                  className="h-24 w-full object-cover rounded cursor-pointer transition-transform hover:scale-105"
                  onClick={() => openModal(img)}
                />
              ))}
            </div>
          </div>
        )}
        <Link
          to="/products"
          className="inline-block mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          ← Back to Products
        </Link>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isFullscreen={false}>
        {modalImg && (
          <img src={modalImg} alt="Preview" className="max-h-[80vh] max-w-full rounded-lg mx-auto" />
        )}
      </Modal>
    </div>
  );
};

export default ProductDetail; 