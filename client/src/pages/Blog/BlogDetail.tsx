import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Blog, blogApi } from '../../services/api';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    if (!slug) return;
    
    try {
      const response = await blogApi.getBySlug(slug);
      setBlog(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blog post. Please try again later.');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleDelete = async () => {
    if (!blog || !window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await blogApi.delete(blog._id);
      navigate('/blog');
    } catch (err) {
      setError('Failed to delete blog post. Please try again.');
      console.error('Error deleting blog:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Blog post not found'}
        </div>
        <Link
          to="/blog"
          className="mt-4 inline-block text-brand-500 hover:text-brand-600"
        >
          ← Back to Blog List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/blog"
            className="text-brand-500 hover:text-brand-600"
          >
            ← Back to Blog List
          </Link>
          <div className="flex gap-2">
            <Link
              to={`/blog/edit/${blog._id}`}
              className="text-indigo-500 hover:text-indigo-600 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        </div>

        <article className="prose dark:prose-invert lg:prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span>Published: {new Date(blog.createdAt).toLocaleDateString()}</span>
            {blog.updatedAt !== blog.createdAt && (
              <span className="ml-4">
                Updated: {new Date(blog.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="mt-6 text-gray-800 dark:text-gray-200 leading-relaxed">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail; 