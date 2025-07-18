import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, Product } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'brand' | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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

  // Search and sort logic
  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] || '';
    const bVal = b[sortKey] || '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const handleSort = (key: 'title' | 'brand') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-brand-700 dark:text-brand-400">Products</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
            <Link to="/products/add" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold text-lg shadow">Add Product</Link>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : (
          sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Image</th>
                    <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('title')}>
                      Name {sortKey === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('brand')}>
                      Brand {sortKey === 'brand' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(product => (
                    <tr key={product._id} className="border-t">
                      <td className="px-4 py-2 border">
                        {product.featuredImage && (
                          <img
                            src={product.featuredImage.replace('server/', '')}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded cursor-pointer"
                            onClick={() => openModal(product.featuredImage!)}
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 border font-medium">{product.title}</td>
                      <td className="px-4 py-2 border">{product.brand || '-'}</td>
                      <td className="px-4 py-2 border max-w-xs truncate">{product.description}</td>
                      <td className="px-4 py-2 border">
                        <Link to={`/products/${product._id}`} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition mr-2">View</Link>
                        <Link to={`/products/${product._id}/edit`} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition mr-2">Edit</Link>
                        <button onClick={() => handleDelete(product._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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