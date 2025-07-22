import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, Product, brandApi, Brand } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'brand' | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandMap, setBrandMap] = useState<Record<string, string>>({});

  useEffect(() => {
    productApi.getAll()
      .then(res => {
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
    // Fetch brands
    brandApi.getAll()
      .then(res => {
        setBrands(Array.isArray(res.data) ? res.data : []);
        setBrandMap(
          (Array.isArray(res.data) ? res.data : []).reduce((acc, b) => {
            acc[b._id] = b.name;
            return acc;
          }, {} as Record<string, string>)
        );
      })
      .catch(() => setBrands([]));
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
    <div className="w-full p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold" style={{ color: '#062373' }}>Products</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64 text-[#062373]"
              style={{ color: '#062373' }}
            />
            <Link to="/products/add" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold text-lg shadow">Add Product</Link>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64" style={{ color: '#062373' }}>Loading...</div>
        ) : (
          sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full w-full border border-gray-200 rounded-lg text-[#062373]">
                <thead className="text-[#062373]">
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
                <tbody className="text-[#062373]">
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
                      <td className="px-4 py-2 border">{brandMap[product.brand as string] || '-'}</td>
                      <td className="px-4 py-2 border max-w-xs truncate">{product.description}</td>
                      <td className="px-4 py-2 border">
                        <Link to={`/products/${product._id}`} className="px-3 py-1 rounded font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition mr-2">View</Link>
                        <Link to={`/products/${product._id}/edit`} className="px-3 py-1 rounded font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition mr-2">Edit</Link>
                        <button onClick={() => handleDelete(product._id)} className="px-3 py-1 rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64" style={{ color: '#062373' }}>No products found.</div>
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