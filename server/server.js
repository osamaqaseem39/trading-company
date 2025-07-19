const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

// Routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const productRoutes = require('./routes/products');
const quotesRouter = require('./routes/quotes');
const supplierRoutes = require('./routes/suppliers');
const brandRoutes = require('./routes/brands');
const categoryRoutes = require('./routes/categories');
const subcategoryRoutes = require('./routes/subcategories');

// Load environment variables
dotenv.config();

const app = express();

// Middleware - CORS must be first!
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-auth-token',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Content-Type',
    'Authorization',
    'x-auth-token'
  ],
  optionsSuccessStatus: 200
}));

// Also add a pre-flight middleware to ensure headers are set
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  next();
});

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check MongoDB connection middleware
app.use((req, res, next) => {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  if (state !== 1) {
    console.error('MongoDB not connected. Current state:', states[state] || 'unknown');
    console.error('Connection details:', {
      state: states[state] || 'unknown',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      port: mongoose.connection.port || 'unknown'
    });
    return res.status(503).json({ 
      message: 'Database connection not ready',
      state: states[state] || 'unknown',
      details: {
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
        port: mongoose.connection.port || 'unknown'
      }
    });
  }
  next();
});

// Handle OPTIONS requests
app.options('*', cors());

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));
}

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Hide credentials in logs

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 2000,
      retryReads: true
    };

    await mongoose.connect(mongoURI, options);
    console.log('✨ MongoDB Connected Successfully!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    global.mongoConnected = true;
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      state: mongoose.connection.readyState
    });
    global.mongoConnected = false;
    return false;
  }
};

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  global.mongoConnected = true;
  console.log('🔄 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  global.mongoConnected = false;
  console.error('🔴 MongoDB connection error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
});

mongoose.connection.on('disconnected', () => {
  global.mongoConnected = false;
  console.log('🔸 MongoDB connection disconnected');
  // Attempt to reconnect
  setTimeout(connectDB, 5000);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quotesRouter);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/uploads/products', express.static(path.join(__dirname, '../uploads/products')));
app.use('/uploads/brochures', express.static(path.join(__dirname, '../uploads/brochures')));
app.use('/uploads/brand-category', express.static(path.join(__dirname, '../uploads/brand-category')));

// Root route for API health check
app.get('/', (req, res) => {
  const mongoStatus = {
    isConnected: mongoose.connection.readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    database: mongoose.connection.name || 'not connected',
    host: mongoose.connection.host || 'not connected',
    port: mongoose.connection.port || 'not connected',
    models: Object.keys(mongoose.models),
    collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : []
  };

  const serverStatus = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    env: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform
  };

  res.json({ 
    status: mongoStatus.isConnected ? 'healthy' : 'unhealthy',
    message: mongoStatus.isConnected ? 'Server is running' : 'Server is running but database is not connected',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
    server: serverStatus
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server only after MongoDB connection is established
const startServer = async () => {
  let retries = 5;
  let connected = false;

  while (retries > 0 && !connected) {
    console.log(`Attempting to connect to MongoDB (${retries} retries left)...`);
    connected = await connectDB();
    if (!connected) {
      retries--;
      if (retries > 0) {
        console.log('Waiting 5 seconds before retrying...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  if (!connected) {
    console.error('Failed to connect to MongoDB after multiple attempts');
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📚 Swagger documentation available at /api-docs`);
    }
  });
};

// Start the server
startServer(); 