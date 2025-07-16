import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Blog {
  _id: string;
  title: string;
  content: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published';
  slug: string;
}

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk('blogs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:3000/api/blogs');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchById',
  async (_id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/blogs/id/${_id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blogs/fetchBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/blogs/${slug}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/create',
  async (blogData: Omit<Blog, '_id' | 'slug'>, { rejectWithValue, getState }: any) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post('http://localhost:3000/api/blogs', blogData, {
        headers: { 'x-auth-token': token },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/update',
  async (
    { _id, blogData }: { _id: string; blogData: Partial<Blog> },
    { rejectWithValue, getState }: any
  ) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`http://localhost:3000/api/blogs/${_id}`, blogData, {
        headers: { 'x-auth-token': token },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/delete',
  async (_id: string, { rejectWithValue, getState }: any) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`http://localhost:3000/api/blogs/${_id}`, {
        headers: { 'x-auth-token': token },
      });
      return _id;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch blog by ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch blog by slug
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.push(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.blogs.findIndex((blog) => blog._id === action.payload._id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog?._id === action.payload._id) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter((blog) => blog._id !== action.payload);
        if (state.currentBlog?._id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentBlog, clearError } = blogSlice.actions;
export default blogSlice.reducer; 