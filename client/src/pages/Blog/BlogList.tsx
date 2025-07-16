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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
        <Link
          to="/blog/add"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Add New Post
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 flex flex-col hover:shadow-2xl transition-shadow"
          >
            {blog.featuredImage && (
              <img
                src={blog.featuredImage.replace('server/', '')}
                alt={blog.title}
                className="h-48 w-full object-cover mb-3 rounded-lg cursor-pointer transition-transform hover:scale-105"
                onClick={() => openModal(blog.featuredImage!)}
              />
            )}
            <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200">{blog.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">{blog.content.substring(0, 150)}...</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-4">{new Date(blog.createdAt).toLocaleDateString()}</span>
            <div className="mt-auto flex gap-2 pt-4">
              <Link
                to={`/blog/${blog.slug}`}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
              >
                View
              </Link>
              <Link
                to={`/blog/edit/${blog._id}`}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(blog._id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isFullscreen={false}>
        {modalImg && (
          <img src={modalImg} alt="Preview" className="max-h-[80vh] max-w-full rounded-lg mx-auto" />
        )}
      </Modal>
    </div>
  );
};

export default BlogList; 