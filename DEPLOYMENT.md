# How to Deploy NEXA Energy Rating Portal to Render (FREE)

## Step-by-Step Deployment Guide

### 1. Create a GitHub Account (if you don't have one)
- Go to https://github.com
- Sign up for free

### 2. Create a New Repository on GitHub
- Click the "+" icon in top right → "New repository"
- Name: `nexa-energy-portal` (or any name you prefer)
- Make it Public
- Do NOT initialize with README (we already have files)
- Click "Create repository"

### 3. Push Your Code to GitHub
Copy and paste these commands one at a time in your terminal:

```bash
cd energy-rating-portal
git remote add origin https://github.com/YOUR_USERNAME/nexa-energy-portal.git
git branch -M main
git push -u origin main
```

(Replace `YOUR_USERNAME` with your actual GitHub username)

### 4. Create a Render Account
- Go to https://render.com
- Click "Get Started for Free"
- Sign up with GitHub (easiest option)

### 5. Deploy on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (`nexa-energy-portal`)
3. Configure the service:
   - **Name**: `nexa-energy-portal`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select **FREE**
4. Click "Create Web Service"

### 6. Wait for Deployment
- Render will automatically deploy your app (takes 2-3 minutes)
- You'll get a URL like: `https://nexa-energy-portal.onrender.com`

### 7. Your Portal is Live!
- Click on the URL to test your portal
- Share this URL wherever you need it

## Important Notes

- **Free tier limitations**:
  - App may sleep after 15 minutes of inactivity
  - First visit after sleep takes ~30 seconds to wake up
  - This is completely normal for free hosting

- **Data persistence**:
  - User data and orders are saved in JSON files
  - They persist across deployments on Render

- **No credit card required** for the free tier

## Next Step: Add Button to Gamma Website

Once deployed, you can add a button to your Gamma website (https://neax5282-stw1umw.gamma.site) that links to your new portal URL.
