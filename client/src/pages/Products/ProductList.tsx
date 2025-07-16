import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, Product } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    productApi.getAll()
      .then(res => {
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await productApi.delete(id);
      setProducts(products => products.filter(p => p._id !== id));
    }
  };

  const openModal = (img: string) => {
    setModalImg(img.replace('server/', ''));
    setModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">Products</h1>
      <div className="flex justify-end mb-6">
        <Link to="/products/add" className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Add Product</Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        Array.isArray(products) && products.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
            {products.map(product => (
              <div key={product._id} className="flex items-center px-8 py-6 group hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex-shrink-0">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.replace('server/', '')}
                      alt={product.title}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100"
                      onClick={() => openModal(product.featuredImage!)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl text-gray-400">
                      <span>📦</span>
                    </div>
                  )}
                </div>
                <div className="ml-6 flex-1">
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-600 transition">{product.title}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-base mt-1 line-clamp-1">{product.description}</div>
                </div>
                <Link to={`/products/${product._id}`} className="ml-auto flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-brand-100 hover:text-brand-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">No products found.</div>
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

export default ProductList; 