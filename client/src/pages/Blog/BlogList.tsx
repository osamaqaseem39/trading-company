import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Blog, blogApi } from '../../services/api';
import { Modal } from '../../components/ui/modal';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'title' | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogApi.getAll();
      setBlogs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blogs. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogApi.delete(_id);
        setBlogs(blogs.filter(blog => blog._id !== _id));
        setError(null);
      } catch (err) {
        setError('Failed to delete blog. Please try again later.');
        console.error('Error deleting blog:', err);
      }
    }
  };

  const openModal = (img: string) => {
    setModalImg(img.replace('server/', ''));
    setModalOpen(true);
  };

  // Search and sort logic
  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
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

  const handleSort = (key: 'title') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#062373' }}>Blog Posts</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64 text-[#062373]"
              style={{ color: '#062373' }}
            />
            <Link
              to="/blog/add"
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Add New Post
            </Link>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" style={{ color: '#062373' }}>
            {error}
          </div>
        )}
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full border border-gray-200 rounded-lg text-[#062373]">
              <thead className="text-[#062373]">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort('title')}>
                    Title {sortKey === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[#062373]">
                {sorted.map((blog) => (
                  <tr key={blog._id} className="border-t">
                    <td className="px-4 py-2 border">
                      {blog.featuredImage && (
                        <img
                          src={blog.featuredImage.replace('server/', '')}
                          alt={blog.title}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() => openModal(blog.featuredImage!)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2 border font-medium">{blog.title}</td>
                    <td className="px-4 py-2 border text-xs text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border">
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="px-3 py-1 rounded font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition mr-2"
                      >
                        View
                      </Link>
                      <Link
                        to={`/blog/edit/${blog._id}`}
                        className="px-3 py-1 rounded font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition mr-2"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="px-3 py-1 rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64" style={{ color: '#062373' }}>No blog posts found.</div>
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

export default BlogList; 