const http = require('http');
const url = require('url');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables FIRST
dotenv.config();

// Koneksi ke MongoDB
connectDB(); 

// Import Controllers (Casing diperbaiki berdasarkan konvensi PascalCase/CamelCase)
const authController = require('./controllers/authController');
const userController = require('./controllers/usersController'); 
const menuController = require('./controllers/menuController');
const vendorController = require('./controllers/vendorController');
const vendorAuthController = require('./controllers/vendorAuthController');
const kantinBursaController = require('./controllers/KantinBursaController'); 
const indomieController = require('./controllers/IndomieController');       
const orderController = require('./controllers/orderController'); 

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Helper CORS (Middleware Manual)
const enableCors = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Helper JSON Parsing dan Error Handling
const handleRequest = (req, res, callback, params = null) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }
    
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
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

// --- REQUEST HANDLER UTAMA (Routing Manual) ---
const server = http.createServer(async (req, res) => {
    enableCors(req, res);

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    const parts = path.split('/').filter(p => p); 

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

        if (resource === 'auth') {
            if (param1 === 'register' && method === 'POST') {
                return handleRequest(req, res, authController.register);
            }
            if (param1 === 'login' && method === 'POST') {
                return handleRequest(req, res, authController.login);
            }
            if (param1 === 'me' && method === 'GET') {
                return callGetController(authController.getMe);
            }
        }
        
        if (resource === 'users') {
            if (parts.length === 2 && method === 'GET') {
                return callGetController(userController.listUsers);
            }
            if (param1 === 'id' && param2 && method === 'GET') {
                return callGetController(userController.getUserById, param2);
            }
        }
        
        if (resource === 'vendor') {
            if (param1 === 'login' && method === 'POST') {
                return handleRequest(req, res, vendorAuthController.vendorLogin);
            }
        }
        
        if (resource === 'vendors') {
            if (parts.length === 2 && method === 'GET') {
                return callGetController(vendorController.getVendors);
            }
            if (parts.length === 3 && method === 'GET') {
                return callGetController(vendorController.getVendorWithMenus, param1);
            }
        }
        
        if (resource === 'menus') {
            if (method === 'GET' && parts.length === 2) {
                return callGetController(menuController.getMenus);
            }
        }

        if (resource === 'kantinbursa') {
             if (parts.length === 2 && method === 'GET') {
                return callGetController(kantinBursaController.getKantinBursaMenus);
            }
            if (parts.length === 3 && method === 'GET') {
                return callGetController(kantinBursaController.getKantinBursaMenuById, param1);
            }
        }

        if (resource === 'indomie') {
             if (parts.length === 2 && method === 'GET') {
                return callGetController(indomieController.getIndomieMenu);
            }
            if (parts.length === 3 && method === 'GET') {
                return callGetController(indomieController.getIndomieMenuById, param1);
            }
        }

        if (resource === 'orders') {
            if (parts.length === 2 && method === 'POST') {
                return handleRequest(req, res, orderController.createOrder);
            }
            if (parts.length === 2 && method === 'GET') {
                return callGetController(orderController.getOrders);
            }
            if (parts.length === 4 && param2 === 'status' && (method === 'PUT' || method === 'PATCH')) {
                return handleRequest(req, res, orderController.updateOrderStatus, param1);
            }
            if (parts.length === 3 && method === 'GET') {
                return callGetController(orderController.getOrderById, param1);
            }
        }
    }


    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Route tidak ditemukan' }));
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});