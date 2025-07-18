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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-center flex-1 text-brand-700 dark:text-brand-400">Products</h1>
          <Link to="/products/add" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow ml-4">Add Product</Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : (
          Array.isArray(products) && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 flex flex-col hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-800">
                  {product.featuredImage && (
                    <img
                      src={product.featuredImage.replace('server/', '')}
                      alt={product.title}
                      className="h-48 w-full object-cover mb-3 rounded-lg cursor-pointer transition-transform hover:scale-105"
                      onClick={() => openModal(product.featuredImage!)}
                    />
                  )}
                  <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200">{product.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                  <div className="mt-auto flex gap-2">
                    <Link to={`/products/${product._id}`} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">View</Link>
                    <Link to={`/products/${product._id}/edit`} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition">Edit</Link>
                    <button onClick={() => handleDelete(product._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
                  </div>
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
    </div>
  );
};

export default ProductList; 