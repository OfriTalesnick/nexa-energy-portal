# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (free tier) for the NEXA Energy Portal.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (512MB storage, perfect for this app)
3. Select a cloud provider and region (choose closest to your Render server location)
4. Name your cluster (e.g., "nexa-portal")
5. Click **"Create"**

## Step 3: Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create credentials:
   - Username: `nexa_admin`
   - Password: Generate a strong password (save it!)
5. User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Configure Network Access

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is necessary for Render to connect
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your username (e.g., `nexa_admin`)
7. Replace `<password>` with the password you created

**Example final string:**
```
mongodb+srv://nexa_admin:YourPassword123@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

## Step 6: Add to Render Environment Variables

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Select your **nexa-energy-portal** service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key:** `MONGODB_URI`
   - **Value:** Your full connection string from Step 5
6. Click **"Save Changes"**

Render will automatically redeploy with the new environment variable.

## Step 7: Verify Connection

After Render redeploys (~2 minutes):

1. Check your Render logs for: `✅ Connected to MongoDB`
2. Test by registering a new user at https://nexa-energy-portal.onrender.com
3. Restart the server - your user should still exist!

## What's Stored in MongoDB

- **Database:** `nexa-portal`
- **Collections:**
  - `users` - User accounts (email, password, name)
  - `orders` - Energy rating orders

## Default Admin Login

Even if MongoDB is down, this hardcoded admin always works:

- **Email:** office@terranexa.co.il
- **Password:** nexa2024

## Troubleshooting

### "Error: Authentication failed"
- Double-check your username and password in the connection string
- Make sure there are no special characters that need URL encoding

### "Error: Network timeout"
- Verify "Allow Access from Anywhere" is enabled in Network Access
- Check that your connection string is correct

### "Service unavailable"
- MongoDB might be down temporarily
- Check MongoDB Atlas status
- Admin can still log in with hardcoded credentials

## Free Tier Limits

MongoDB Atlas free tier (M0) includes:
- 512 MB storage (plenty for thousands of orders)
- Shared CPU/RAM
- No backups (paid feature)

For a production app with critical data, consider upgrading to M10 ($0.08/hour).
