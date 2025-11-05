const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Google Sheets configuration
const SPREADSHEET_ID = '1wW7S0fSO71uH3mPJrryHv2-kWMIf31vjF4nQSFWPoBk';

// Initialize data files
async function initDataFiles() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });

        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([]));
        }

        try {
            await fs.access(ORDERS_FILE);
        } catch {
            await fs.writeFile(ORDERS_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Helper functions
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}

async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Google Sheets Integration
async function syncToGoogleSheets(order) {
    try {
        const credentialsPath = path.join(__dirname, 'google-credentials.json');

        try {
            await fs.access(credentialsPath);
        } catch {
            console.log('Google Sheets credentials not found. Skipping sync.');
            return;
        }

        const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Prepare row data: ID | Date | Building | Address | Consultant | Status | Drive_Link
        const rowData = [
            order.id,
            new Date(order.createdAt).toLocaleDateString('he-IL'),
            order.data['שם הבניין'] || '',
            order.data['כתובת (רחוב + מספר)'] || '',
            order.data['שם היועץ התרמי'] || '',
            order.status,
            order.resultLink || ''
        ];

        // Check if order already exists in sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:A'
        });

        const existingIds = response.data.values || [];
        const rowIndex = existingIds.findIndex(row => row[0] === order.id);

        if (rowIndex >= 0) {
            // Update existing row
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `Sheet1!A${rowIndex + 1}:G${rowIndex + 1}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [rowData]
                }
            });
            console.log('Order updated in Google Sheets');
        } else {
            // Append new row
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:G',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [rowData]
                }
            });
            console.log('Order added to Google Sheets');
        }
    } catch (error) {
        console.error('Error syncing to Google Sheets:', error.message);
    }
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'יש למלא את כל השדות' });
        }

        const users = await readJSON(USERS_FILE);

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
        }

        const newUser = {
            id: generateId(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeJSON(USERS_FILE, users);

        res.status(201).json({
            message: 'משתמש נוצר בהצלחה',
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'יש למלא את כל השדות' });
        }

        const users = await readJSON(USERS_FILE);
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
        }

        res.json({
            message: 'התחברות הצליחה',
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

// Orders Routes
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;

        if (!orderData.userId) {
            return res.status(400).json({ message: 'חסר מזהה משתמש' });
        }

        const orders = await readJSON(ORDERS_FILE);

        const newOrder = {
            id: generateId(),
            ...orderData,
            createdAt: new Date().toISOString(),
            status: 'התקבל',
            resultLink: ''
        };

        orders.push(newOrder);
        await writeJSON(ORDERS_FILE, orders);

        // Sync to Google Sheets
        await syncToGoogleSheets(newOrder);

        res.status(201).json({
            message: 'הזמנה נוצרה בהצלחה',
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await readJSON(ORDERS_FILE);
        const userOrders = orders.filter(order => order.userId === userId);
        res.json(userOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.get('/api/orders/all', async (req, res) => {
    try {
        const orders = await readJSON(ORDERS_FILE);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const orders = await readJSON(ORDERS_FILE);
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            return res.status(404).json({ message: 'הזמנה לא נמצאה' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.put('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, resultLink } = req.body;

        const orders = await readJSON(ORDERS_FILE);
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ message: 'הזמנה לא נמצאה' });
        }

        // Update order
        if (status !== undefined) {
            orders[orderIndex].status = status;
        }
        if (resultLink !== undefined) {
            orders[orderIndex].resultLink = resultLink;
        }

        await writeJSON(ORDERS_FILE, orders);

        // Sync to Google Sheets
        await syncToGoogleSheets(orders[orderIndex]);

        res.json({
            message: 'הזמנה עודכנה בהצלחה',
            order: orders[orderIndex]
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

// Start server
async function startServer() {
    await initDataFiles();

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════╗
║   NEXA Energy Rating Portal Server         ║
║   Server running on http://localhost:${PORT}  ║
╚════════════════════════════════════════════╝

📁 Data directory: ${DATA_DIR}
👥 Users file: ${USERS_FILE}
📋 Orders file: ${ORDERS_FILE}

🚀 Server is ready to accept requests!
        `);
    });
}

startServer();
