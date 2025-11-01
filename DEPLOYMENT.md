# Deployment Instructions

## Step 1: Create Git Repository

1. Go to GitHub.com and create a new repository
   - Name it: `ffmpeg-compression-server`
   - Make it **Public** (or ensure Coolify has access if private)
   - **Do NOT** initialize with README (we already have one)

2. Push the server code to GitHub:
   ```bash
   cd ffmpeg-compression-server
   git init
   git add .
   git commit -m "Initial commit: FFmpeg compression server"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ffmpeg-compression-server.git
   git push -u origin main
   ```

## Step 2: Deploy to Coolify

1. **Log into Coolify Dashboard**
   - Open your Coolify instance URL in a browser
   - Log in with your credentials

2. **Create New Application**
   - Click "Resources" in the sidebar
   - Click "New Resource" button
   - Select "New Application"

3. **Connect Git Repository**
   - Click "Connect to Git" or "Git Repository"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - If first time, authorize Coolify to access your repositories
   - Search for and select: `ffmpeg-compression-server`
   - Select branch: `main` (or `master`)

4. **Configure Build Settings**
   - **Build Pack**: Select "Docker"
   - **Dockerfile Path**: Should auto-detect as `Dockerfile` (leave default)
   - **Port**: `3000` (or leave default if shown)

5. **Set Environment Variables**
   - Click "Environment Variables" section
   - Click "Add Environment Variable" and add:
     - **Key**: `PORT`
     - **Value**: `3000`
     - Click "Add"
   - Add another:
     - **Key**: `NODE_ENV`
     - **Value**: `production`
     - Click "Add"
   - Add another (optional):
     - **Key**: `MAX_FILE_SIZE`
     - **Value**: `100` (maximum file size in MB)
     - Click "Add"
   - Add another (optional, for CORS):
     - **Key**: `ALLOWED_ORIGINS`
     - **Value**: `https://your-netlify-site.netlify.app` (your Netlify domain)
     - Click "Add"

6. **Deploy**
   - Click "Save" or "Deploy" button
   - Wait for deployment (this will take 3-5 minutes):
     - Building Docker image
     - Installing FFmpeg
     - Installing Node.js dependencies
     - Starting the server

7. **Get Your Server URL**
   - Once deployment completes, Coolify will show you the public URL
   - Example: `https://ffmpeg-api.yourdomain.com` or `https://ffmpeg-compression-server.coolify-app.com`
   - **Copy this URL** - you'll need it for Netlify

8. **Test the Server**
   - Open the health endpoint in your browser:
     `https://your-server-url.com/api/health`
   - Should return:
     ```json
     {
       "status": "ok",
       "ffmpeg": "available",
       "timestamp": "...",
       "jobs": {...}
     }
     ```

## Step 3: Configure Netlify

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Select your site

2. **Add Environment Variable**
   - Go to: **Site Settings** → **Environment Variables**
   - Click **Add variable**
   - **Key**: `NEXT_PUBLIC_COMPRESSION_API_URL`
   - **Value**: Your Coolify server URL (from Step 2, item 7)
     - Example: `https://ffmpeg-api.yourdomain.com`
   - **Scopes**: Check both "All scopes" (or just "Production" and "Preview")
   - Click **Save**

3. **Redeploy Your Site**
   - Option A: Push a commit to your main branch (Netlify will auto-deploy)
   - Option B: Go to **Deploys** tab → Click **Trigger deploy** → **Deploy site**

4. **Wait for Deployment**
   - Monitor the deployment in Netlify dashboard
   - Should complete in 2-3 minutes

## Step 4: Test the Integration

1. **Visit Your Test Page**
   - Go to: `https://your-site.netlify.app/test`
   - Check the status indicator:
     - Green "Ready to compress" = API connected ✓
     - Red "API server unavailable" = Check your server URL

2. **Test Compression**
   - Upload an audio file (e.g., `beautiful-loop-253269.mp3`)
   - Select a preset (e.g., "Medium Quality")
   - Click "Compress MP3"
   - Watch progress bar (should show real-time updates)
   - Wait for completion
   - Verify compression results and download

## Troubleshooting

### Server Health Check Fails
- Check Coolify logs for errors
- Verify FFmpeg is installed: `docker exec -it <container> ffmpeg -version`
- Check port is exposed correctly

### Frontend Shows "API server unavailable"
- Verify environment variable is set in Netlify
- Check the variable name: `NEXT_PUBLIC_COMPRESSION_API_URL` (exact spelling)
- Verify server URL is correct (test in browser: `https://your-server.com/api/health`)
- Check CORS settings if using custom domain

### Compression Jobs Fail
- Check Coolify server logs
- Verify file size is under limit (default 100MB)
- Check file format is supported (MP3, WAV, M4A, etc.)

### CORS Errors
- Add your Netlify domain to `ALLOWED_ORIGINS` environment variable in Coolify
- Format: `https://your-site.netlify.app,https://your-custom-domain.com`
- Redeploy server after changing environment variables

## Next Steps

Once everything is working:
- Monitor server logs in Coolify
- Check Netlify function logs for any errors
- Test with various file sizes and formats
- Adjust compression presets if needed in `ffmpeg-compression-server/src/utils/presets.js`

