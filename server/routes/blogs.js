const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the blog
 *         title:
 *           type: string
 *           description: Blog title
 *         content:
 *           type: string
 *           description: Blog content
 *         author:
 *           type: string
 *           description: User ID of the author
 *         featuredImage:
 *           type: string
 *           description: URL to the featured image
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           description: Blog status
 *        
 *         slug:
 *           type: string
 *           description: URL-friendly version of the title
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the blog was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the blog was last updated
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: A list of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Get a blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Blog slug
 *     responses:
 *       200:
 *         description: The blog post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/blogs/id/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: The blog post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/id/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               content:
 *                 type: string
 *                 description: Blog content
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Blog status
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/',
  auth,
  [
    body('title').trim().notEmpty(),
    body('content').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, tags, status, featuredImage } = req.body;

      // Log the request data for debugging
      console.log('Creating blog with data:', {
        title,
        contentLength: content?.length,
        tags,
        status,
        userId: req.user?.userId
      });

      if (!req.user || !req.user.userId) {
        console.error('Auth error: Missing user ID');
        return res.status(401).json({ message: 'Authentication failed - missing user ID' });
      }

      const blog = new Blog({
        title,
        content,
        tags: tags || [],
        status: status || 'draft',
        author: req.user.userId,
        featuredImage: featuredImage || null
      });

      // Log the blog object before saving
      console.log('Blog object before save:', blog);

      await blog.save();
      
      // Log successful creation
      console.log('Blog created successfully:', blog._id);
      
      res.status(201).json(blog);
    } catch (error) {
      // Log the detailed error
      console.error('Blog creation error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });

      // Send more detailed error message to client
      res.status(500).json({
        message: 'Server error while creating blog',
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               content:
 *                 type: string
 *                 description: Blog content
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of tags
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Blog status
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.put('/:id',
  auth,
  [
    check('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    check('content')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Content cannot be empty'),
    check('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    check('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be either draft or published')
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation error',
          errors: errors.array()
        });
      }

      // Find blog and check permissions
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({
          message: 'Blog not found',
          code: 'BLOG_NOT_FOUND'
        });
      }

      // Check if user is the author
      if (blog.author.toString() !== req.user.userId) {
        return res.status(401).json({
          message: 'Not authorized to edit this blog',
          code: 'UNAUTHORIZED_EDIT'
        });
      }

      const { title, content, tags, status, featuredImage } = req.body;

      // Only update fields that are provided
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (tags !== undefined) updates.tags = tags;
      if (status !== undefined) updates.status = status;
      if (featuredImage !== undefined) updates.featuredImage = featuredImage;

      // Add last modified timestamp
      updates.lastModified = new Date();

      // Update the blog with the new values
      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      // Log the update
      console.log(`Blog ${req.params.id} updated by user ${req.user.userId}`);

      res.json({
        message: 'Blog updated successfully',
        blog: updatedBlog
      });
    } catch (error) {
      console.error('Blog update error:', {
        blogId: req.params.id,
        userId: req.user?.userId,
        error: error.message
      });

      // Handle different types of errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message),
          code: 'VALIDATION_ERROR'
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          message: 'Invalid blog ID format',
          code: 'INVALID_ID'
        });
      }

      res.status(500).json({
        message: 'Server error while updating blog',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete('/:id',
  auth,
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Check if user is the author
      if (blog.author.toString() !== req.user.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await Blog.deleteOne({ _id: req.params.id });
      res.json({ message: 'Blog removed' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/blogs/verify:
 *   post:
 *     summary: Verify if a blog post exists
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title to check
 *               slug:
 *                 type: string
 *                 description: Blog slug to check
 *     responses:
 *       200:
 *         description: Verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Whether the blog exists
 *                 blog:
 *                   type: object
 *                   description: Blog details if it exists
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/verify',
  [
    body('title').optional().trim(),
    body('slug').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, slug } = req.body;

      if (!title && !slug) {
        return res.status(400).json({
          message: 'Either title or slug must be provided',
          code: 'INVALID_INPUT'
        });
      }

      // Build query based on provided parameters
      const query = {};
      if (title) query.title = title;
      if (slug) query.slug = slug;

      const blog = await Blog.findOne(query)
        .populate('author', 'username')
        .select('-content'); // Exclude content for faster response

      res.json({
        exists: !!blog,
        blog: blog || null,
        message: blog ? 'Blog found' : 'Blog not found'
      });

    } catch (error) {
      console.error('Blog verification error:', error);
      res.status(500).json({
        message: 'Server error while verifying blog',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router; 