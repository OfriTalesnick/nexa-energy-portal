const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Google Sheets configuration
const SPREADSHEET_ID = '1wW7S0fSO71uH3mPJrryHv2-kWMIf31vjF4nQSFWPoBk';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexa-portal';
let db;
let usersCollection;
let ordersCollection;

// Hardcoded admin user (fallback)
const ADMIN_USER = {
    id: 'admin_nexa',
    name: 'NEXA Office',
    email: 'office@terranexa.co.il',
    password: 'nexa2024',
    createdAt: new Date().toISOString()
};

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await client.connect();
        console.log('✅ Connected to MongoDB');

        db = client.db('nexa-portal');
        usersCollection = db.collection('users');
        ordersCollection = db.collection('orders');

        // Ensure admin user exists
        const adminExists = await usersCollection.findOne({ email: ADMIN_USER.email });
        if (!adminExists) {
            await usersCollection.insertOne(ADMIN_USER);
            console.log('✅ Admin user created');
        }

        // Create indexes
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await ordersCollection.createIndex({ userId: 1 });
        await ordersCollection.createIndex({ createdAt: -1 });

    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.log('⚠️  Server will continue with limited functionality');
    }
}

// Helper function to generate ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Middleware to check if user is admin
async function checkAdmin(req, res, next) {
    const userEmail = req.headers['x-user-email'];

    if (!userEmail) {
        return res.status(401).json({ message: 'לא מחובר' });
    }

    if (userEmail !== ADMIN_USER.email) {
        return res.status(403).json({ message: 'אין הרשאה - נדרשות הרשאות מנהל' });
    }

    next();
}

// Google Sheets Integration
async function syncToGoogleSheets(order) {
    try {
        const credentialsPath = path.join(__dirname, 'google-credentials.json');
        const fs = require('fs');

        if (!fs.existsSync(credentialsPath)) {
            console.log('Google Sheets credentials not found. Skipping sync.');
            return;
        }

        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

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

        if (!usersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
        }

        const newUser = {
            id: generateId(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        await usersCollection.insertOne(newUser);

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

        // Check hardcoded admin first (fallback if DB is down)
        if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
            return res.json({
                message: 'התחברות הצליחה',
                user: { id: ADMIN_USER.id, name: ADMIN_USER.name, email: ADMIN_USER.email }
            });
        }

        if (!usersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        const user = await usersCollection.findOne({ email, password });

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

        if (!ordersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        const newOrder = {
            id: generateId(),
            ...orderData,
            createdAt: new Date().toISOString(),
            status: 'התקבל',
            resultLink: ''
        };

        await ordersCollection.insertOne(newOrder);

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

        if (!ordersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        const userOrders = await ordersCollection
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(userOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.get('/api/orders/all', checkAdmin, async (req, res) => {
    try {
        if (!ordersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        const orders = await ordersCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!ordersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        const order = await ordersCollection.findOne({ id: orderId });

        if (!order) {
            return res.status(404).json({ message: 'הזמנה לא נמצאה' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

app.put('/api/orders/:orderId', checkAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, resultLink } = req.body;

        if (!ordersCollection) {
            return res.status(503).json({ message: 'שירות לא זמין כרגע' });
        }

        const updateFields = {};
        if (status !== undefined) updateFields.status = status;
        if (resultLink !== undefined) updateFields.resultLink = resultLink;

        const result = await ordersCollection.findOneAndUpdate(
            { id: orderId },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ message: 'הזמנה לא נמצאה' });
        }

        // Sync to Google Sheets
        await syncToGoogleSheets(result.value);

        res.json({
            message: 'הזמנה עודכנה בהצלחה',
            order: result.value
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
});

// Start server
async function startServer() {
    await connectToDatabase();

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════╗
║   NEXA Energy Rating Portal Server         ║
║   Server running on http://localhost:${PORT}  ║
╚════════════════════════════════════════════╝

🔗 MongoDB: ${db ? '✅ Connected' : '❌ Not connected'}
📊 Google Sheets: ${SPREADSHEET_ID}

🚀 Server is ready to accept requests!
        `);
    });
}

startServer();
