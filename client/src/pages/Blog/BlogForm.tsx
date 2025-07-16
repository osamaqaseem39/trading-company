import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogApi, CreateBlogInput } from '../../services/api';

interface BlogFormProps {
  mode: 'add' | 'edit';
}

// Upload a file to cPanel server and return the public URL
async function uploadToCpanel(file: File): Promise<string> {
  const formData = new FormData();
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  formData.append('file', file, uniqueName);
  const response = await fetch('https://punjabac.osamaqaseem.online/upload.php', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (data.url) {
    return data.url;
  } else {
    throw new Error(data.error || 'Upload failed');
  }
}

const BlogForm: React.FC<BlogFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [preview, setPreview] = useState('');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [previewFeatured, setPreviewFeatured] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateBlogInput>({
    title: '',
    content: '',
    status: 'draft',
    slug: ''
  });

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-'); // Replace multiple dashes with single dash
  };

  const formatText = (text: string) => {
    // Replace headings
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');

    // Replace bold and italic
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<em>$1</em>');

    // Replace lists
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>').replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
    text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>').replace(/((?:<li>.*<\/li>\n?)+)/g, '<ol>$1</ol>');

    // Replace code
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');

    // Replace blockquotes
    text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Replace horizontal lines
    text = text.replace(/^---$/gm, '<hr>');

    // Replace links and images
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    text = text.replace(/!img\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');

    // Replace alignment tags
    text = text.replace(/<center>(.+?)<\/center>/g, '<div style="text-align: center">$1</div>');
    text = text.replace(/<right>(.+?)<\/right>/g, '<div style="text-align: right">$1</div>');
    text = text.replace(/<left>(.+?)<\/left>/g, '<div style="text-align: left">$1</div>');

    // Replace newlines with <br>
    text = text.replace(/\n/g, '<br>');

    return text;
  };

  useEffect(() => {
    setPreview(formatText(formData.content));
  }, [formData.content]);

  useEffect(() => {
    const fetchBlog = async () => {
      if (mode === 'edit' && id) {
        try {
          const response = await blogApi.getById(id);
          const { slug, ...blogData } = response.data;
          setFormData({
            ...blogData,
            slug
          });
          setPreviewFeatured(response.data.featuredImage || null);
          setError(null);
        } catch (err) {
          setError('Failed to fetch blog. Please try again later.');
          console.error('Error fetching blog:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBlog();
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const slug = generateSlug(formData.title);
      let featuredImageUrl = formData.featuredImage;
      if (featuredImageFile) {
        featuredImageUrl = await uploadToCpanel(featuredImageFile);
      }
      // Always set featuredImage, even if empty
      const payload = {
        ...formData,
        slug,
        featuredImage: featuredImageUrl || '',
      };
      // Debug log
      console.log('Submitting blog:', payload);
      if (mode === 'add') {
        await blogApi.create(payload);
        navigate('/blog');
      } else if (mode === 'edit' && id) {
        await blogApi.update(id, payload);
        navigate(`/blog`);
      }
    } catch (err) {
      setError(`Failed to ${mode} blog post. Please try again.`);
      console.error(`Error ${mode}ing blog:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImageFile(e.target.files[0]);
      setPreviewFeatured(URL.createObjectURL(e.target.files[0]));
      // Clear the previous featuredImage in formData so it doesn't get sent accidentally
      setFormData(prev => ({ ...prev, featuredImage: '' }));
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let insertion = '';

    switch(format) {
      case 'bold':
        insertion = '**' + (start === end ? 'text' : selectedText) + '**';
        break;
      case 'italic':
        insertion = '__' + (start === end ? 'text' : selectedText) + '__';
        break;
      case 'h1':
        insertion = '# ' + (start === end ? 'Heading 1' : selectedText);
        break;
      case 'h2':
        insertion = '## ' + (start === end ? 'Heading 2' : selectedText);
        break;
      case 'h3':
        insertion = '### ' + (start === end ? 'Heading 3' : selectedText);
        break;
      case 'ul':
        insertion = '- ' + (start === end ? 'List item' : selectedText);
        break;
      case 'ol':
        insertion = '1. ' + (start === end ? 'List item' : selectedText);
        break;
      case 'code':
        insertion = '`' + (start === end ? 'code' : selectedText) + '`';
        break;
      case 'quote':
        insertion = '> ' + (start === end ? 'Quote' : selectedText);
        break;
      case 'hr':
        insertion = '---';
        break;
      case 'link':
        insertion = '[' + (start === end ? 'link text' : selectedText) + '](url)';
        break;
      case 'image':
        insertion = '!img[alt text](image-url)';
        break;
      case 'center':
        insertion = '<center>' + (start === end ? 'centered text' : selectedText) + '</center>';
        break;
      case 'right':
        insertion = '<right>' + (start === end ? 'right-aligned text' : selectedText) + '</right>';
        break;
      case 'left':
        insertion = '<left>' + (start === end ? 'left-aligned text' : selectedText) + '</left>';
        break;
    }

    const newText = text.substring(0, start) + insertion + text.substring(end);
    setFormData(prev => ({ ...prev, content: newText }));
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
      <h1 className="text-2xl font-bold mb-6">
        {mode === 'add' ? 'Create New Blog Post' : 'Edit Blog Post'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Featured Image</label>
          <input type="file" accept="image/*" onChange={handleFeaturedChange} />
          {previewFeatured && (
            <div className="relative inline-block">
              <img src={previewFeatured} alt="Preview" className="h-32 mt-2 rounded" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                onClick={() => {
                  setPreviewFeatured(null);
                  setFeaturedImageFile(null);
                  setFormData(prev => ({ ...prev, featuredImage: '' }));
                }}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          )}
          {!previewFeatured && formData.featuredImage && (
            <div className="relative inline-block">
              <img src={formData.featuredImage} alt="Current" className="h-32 mt-2 rounded" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                onClick={() => {
                  setFormData(prev => ({ ...prev, featuredImage: '' }));
                }}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            <div className="flex gap-2 border-r pr-2 mr-2">
              <button
                type="button"
                onClick={() => insertFormatting('bold')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('italic')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Italic"
              >
                I
              </button>
            </div>
            <div className="flex gap-2 border-r pr-2 mr-2">
              <button
                type="button"
                onClick={() => insertFormatting('h1')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('h2')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('h3')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Heading 3"
              >
                H3
              </button>
            </div>
            <div className="flex gap-2 border-r pr-2 mr-2">
              <button
                type="button"
                onClick={() => insertFormatting('ul')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Bullet List"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('ol')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Numbered List"
              >
                1.
              </button>
            </div>
            <div className="flex gap-2 border-r pr-2 mr-2">
              <button
                type="button"
                onClick={() => insertFormatting('code')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Code"
              >
                {'</>'}
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('quote')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Quote"
              >
                "
              </button>
            </div>
            <div className="flex gap-2 border-r pr-2 mr-2">
              <button
                type="button"
                onClick={() => insertFormatting('link')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Link"
              >
                🔗
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('image')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Image"
              >
                🖼️
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => insertFormatting('center')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Center Align"
              >
                ≡
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('right')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Right Align"
              >
                ≫
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('left')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Left Align"
              >
                ≪
              </button>
            </div>
          </div>
          <textarea
            id="content-textarea"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="mt-1 p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'add' ? 'Create Post' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm; 