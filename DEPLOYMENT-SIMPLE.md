# Simple Deployment - Direct Dockerfile Method

This is the **fastest way** to deploy - no GitHub needed!

## Step 1: Prepare Files for Upload

You'll need to upload these files directly to Coolify:
1. `Dockerfile`
2. `package.json`
3. All files in `src/` directory

## Step 2: Deploy in Coolify

1. **Log into Coolify Dashboard**
   - You're already logged in!

2. **Create New Application**
   - Click **"Resources"** → **"New Resource"** → **"New Application"**
   - Choose **"Docker"** as build pack

3. **Upload Files Directly**
   - Look for **"Dockerfile"** or **"Upload Files"** option
   - Upload these files/folders:
     ```
     Dockerfile
     package.json
     src/
       ├── index.js
       ├── routes/
       │   └── compress.js
       ├── services/
       │   ├── jobManager.js
       │   └── ffmpegService.js
       └── utils/
           └── presets.js
     ```
   - **OR** if Coolify allows, create these files directly in the editor

4. **Alternative: Use Coolify's File Manager**
   - Some Coolify versions have a file manager/editor
   - Create the Dockerfile and source files directly there
   - Copy-paste the contents from your local files

5. **Set Environment Variables**
   - Click **"Environment Variables"**
   - Add:
     - `PORT=3000`
     - `NODE_ENV=production`
     - `MAX_FILE_SIZE=100` (optional)
     - `ALLOWED_ORIGINS=https://your-netlify-site.netlify.app` (optional)

6. **Deploy**
   - Click **"Save"** or **"Deploy"**
   - Wait for build to complete (3-5 minutes)

7. **Get Your Server URL**
   - Copy the public URL Coolify gives you
   - Test it: `https://your-server-url.com/api/health`

## Step 3: Configure Netlify

1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Add:
   - **Key**: `NEXT_PUBLIC_COMPRESSION_API_URL`
   - **Value**: Your Coolify server URL
3. **Redeploy** your site

## That's It!

No GitHub, no Git commands - just upload files and deploy!

---

**Note**: If Coolify doesn't support direct file upload, you can also:
- Use Coolify's built-in file editor to create files
- Or use the GitHub method (see DEPLOYMENT.md)

