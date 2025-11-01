# Quick Start - Coolify Direct Deployment

Fastest way to deploy without GitHub!

## What You Need

Just these files from the `ffmpeg-compression-server/` folder:

1. **Dockerfile** (one file)
2. **package.json** (one file)  
3. **src/** folder (with all the JavaScript files inside)

## Deployment Steps

### Option 1: Coolify File Upload (If Available)

1. In Coolify Dashboard → **New Application** → **Docker**
2. Upload or paste:
   - `Dockerfile`
   - `package.json`
   - `src/` folder contents
3. Set environment variables:
   - `PORT=3000`
   - `NODE_ENV=production`
4. Deploy!

### Option 2: Coolify Code Editor

1. In Coolify Dashboard → **New Application** → **Docker**
2. Use the built-in code editor to create:
   - `Dockerfile` (copy from our Dockerfile)
   - `package.json` (copy from our package.json)
   - `src/index.js` (copy from our index.js)
   - `src/routes/compress.js` (copy from our compress.js)
   - `src/services/jobManager.js` (copy from our jobManager.js)
   - `src/services/ffmpegService.js` (copy from our ffmpegService.js)
   - `src/utils/presets.js` (copy from our presets.js)
3. Set environment variables
4. Deploy!

### Option 3: Zip Upload (If Supported)

1. Zip the entire `ffmpeg-compression-server/` folder contents
2. Upload zip to Coolify
3. Coolify extracts and builds
4. Set environment variables
5. Deploy!

## After Deployment

1. Copy your server URL (from Coolify)
2. Add to Netlify: `NEXT_PUBLIC_COMPRESSION_API_URL` = your server URL
3. Test on `/test` page!

**That's it - no Git needed!**

