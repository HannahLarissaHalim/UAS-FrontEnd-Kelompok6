const express = require('express');
const http = require('http');
const url = require('url');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables FIRST
dotenv.config();
connectDB();

// Import Express routes
const menuRoutes = require('./routes/menuRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const kantinBursaRoutes = require('./routes/KantinBursaRoutes');
const indomieRoutes = require('./routes/IndomieRoutes');
const vendorAuthRoutes = require('./routes/vendorAuth');

// Import Controllers (for manual HTTP server)
const authController = require('./controllers/authController');
const userController = require('./controllers/usersController');
const menuController = require('./controllers/menuController');
const vendorController = require('./controllers/vendorController');
const vendorAuthController = require('./controllers/vendorAuthController');
const kantinBursaController = require('./controllers/KantinBursaController');
const indomieController = require('./controllers/IndomieController');
const orderController = require('./controllers/orderController');

const PORT_EXPRESS = process.env.PORT || 5000;
const PORT_HTTP = 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ======================================================
// EXPRESS SERVER
// ======================================================
const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/kantinbursa', kantinBursaRoutes);
app.use('/api/indomie', indomieRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/menus', menuRoutes);
app.use('/api/vendor', vendorAuthRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'FTEAT Backend API (Express)',
    version: '1.0.0',
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

app.listen(PORT_EXPRESS, () => {
  console.log(`🚀 Express server running on port ${PORT_EXPRESS}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ======================================================
// HTTP SERVER (Manual API)
// ======================================================
const enableCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const handleRequest = (req, res, callback, params = null) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        callback(req, res, body, params);
      } catch (error) {
        console.error("JSON Parsing/Controller Error:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Kesalahan internal server.' }));
      }
    });
  } else {
    callback(req, res, null, params);
  }
};

const server = http.createServer(async (req, res) => {
  enableCors(req, res);

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  const parts = path.split('/').filter(p => p);

  //Debug
  console.log('=== HTTP REQUEST ===');
  console.log('Method:', method);
  console.log('Path:', path);
  console.log('Parts:', parts);

  const callGetController = (controller, ...params) => controller(req, res, ...params);

  if (path === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      message: 'FTEAT Backend API is running! (Node.js Native)',
      version: '1.0.0',
    }));
  }

  if (parts[0] === 'api') {
    const resource = parts[1];
    const param1 = parts[2];
    const param2 = parts[3];
    const param3 = parts[4];

    // auth
    if (resource === 'auth') {
      if (param1 === 'register' && method === 'POST') return handleRequest(req, res, authController.register);
      if (param1 === 'login' && method === 'POST') return handleRequest(req, res, authController.login);
      if (param1 === 'me' && method === 'GET') return callGetController(authController.getMe);
    }

    // users
    if (resource === 'users') {
      if (parts.length === 2 && method === 'GET') return callGetController(userController.listUsers);
      if (param1 === 'id' && param2 && method === 'GET') return callGetController(userController.getUserById, param2);
    }

    // vendor auth
    if (resource === 'vendor') {
      if (param1 === 'login' && method === 'POST') {
        return handleRequest(req, res, vendorAuthController.vendorLogin);
      }
    }

    // vendors
    if (resource === 'vendors') {
      if (parts.length === 2 && method === 'GET') return callGetController(vendorController.getVendors);
      if (parts.length === 3 && method === 'GET') return callGetController(vendorController.getVendorWithMenus, param1);
    }

    // menus
     if (resource === 'menus') {
      //debug
      console.log('Menu route detected');
      console.log('Parts:', parts);
      console.log('Method:', method);
      
      if (parts.length === 2 && method === 'GET') {
        console.log('Route: Get all menus');
        return callGetController(menuController.getMenus);
      }
      
      if (parts.length === 3 && param1 === 'delete-multiple' && method === 'POST') {
        console.log('Route: Delete multiple menus');
        return handleRequest(req, res, menuController.deleteMultipleMenus);
      }
      
      if (parts.length === 4 && param1 === 'vendor' && method === 'GET') {
        console.log('Route: Get menus by vendor:', param2);
        return callGetController(menuController.getMenusByVendor, param2);
      }
      
      if (parts.length === 4 && param2 === 'stock' && method === 'PATCH') {
        console.log('Route: Update stock status for menu:', param1);
        return handleRequest(req, res, menuController.updateStockStatus, param1);
      }
      
      if (parts.length === 3 && method === 'GET' && param1 !== 'vendor') {
        console.log('Route: Get menu by ID:', param1);
        return callGetController(menuController.getMenuById, param1);
      }
      
      if (parts.length === 2 && method === 'POST') {
        console.log('Route: Create new menu');
        return handleRequest(req, res, menuController.createMenu);
      }
      
      if (parts.length === 3 && method === 'PUT') {
        console.log('Route: Update menu:', param1);
        return handleRequest(req, res, (req, res, body) => {
          menuController.updateMenu(req, res, body, param1);
        });
      }
      
      if (parts.length === 3 && method === 'DELETE') {
        console.log('Route: Delete menu:', param1);
        return callGetController(menuController.deleteMenu, param1);
      }
    }


    // kantinbursa
    if (resource === 'kantinbursa') {
      if (parts.length === 2 && method === 'GET') return callGetController(kantinBursaController.getKantinBursaMenus);
      if (parts.length === 3 && method === 'GET') return callGetController(kantinBursaController.getKantinBursaMenuById, param1);
    }

    // indomie
    if (resource === 'indomie') {
      if (parts.length === 2 && method === 'GET') return callGetController(indomieController.getIndomieMenu);
      if (parts.length === 3 && method === 'GET') return callGetController(indomieController.getIndomieMenuById, param1);
    }

    // orders
    if (resource === 'orders') {
      if (parts.length === 2 && method === 'POST') return handleRequest(req, res, orderController.createOrder);
      if (parts.length === 2 && method === 'GET') return callGetController(orderController.getOrders);
      if (parts.length === 4 && param2 === 'status' && ['PUT', 'PATCH'].includes(method))
        return handleRequest(req, res, orderController.updateOrderStatus, param1);
      if (parts.length === 3 && method === 'GET')
        return callGetController(orderController.getOrderById, param1);
    }
  }

  console.log('No matching route found');
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Route tidak ditemukan' }));
});

server.listen(PORT_HTTP, () => {
  console.log(`🌐 HTTP native server running on port ${PORT_HTTP}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});