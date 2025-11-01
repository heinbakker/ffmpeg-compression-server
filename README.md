# FFmpeg Compression API Server

A Node.js/Express server that provides audio compression API endpoints using FFmpeg. Designed for deployment on Coolify.

## Features

- Asynchronous job-based compression
- Real-time progress tracking
- Support for multiple compression presets
- Automatic file cleanup
- Health check endpoint
- Docker-ready deployment

## Prerequisites

- Node.js 20+ (or Docker)
- FFmpeg installed
- Coolify account (for deployment)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Make sure FFmpeg is installed:**
   ```bash
   ffmpeg -version
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or with auto-reload:
   ```bash
   npm run dev
   ```

4. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## API Endpoints

### POST /api/jobs
Start a new compression job.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Audio file (MP3, WAV, M4A, etc.)
  - `preset`: Compression preset key (`high`, `medium`, `low`, `voice`, `podcast`)

**Response:**
```json
{
  "jobId": "uuid",
  "status": "queued"
}
```

### GET /api/jobs/:jobId
Get job status and progress.

**Response:**
```json
{
  "jobId": "uuid",
  "status": "processing",
  "progress": 45,
  "downloadUrl": "/api/jobs/uuid/download"
}
```

Status values: `queued`, `processing`, `completed`, `error`

### GET /api/jobs/:jobId/download
Download the compressed file.

**Response:** Binary MP3 file

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "ffmpeg": "available",
  "timestamp": "2025-01-28T...",
  "jobs": {
    "total": 5,
    "queued": 1,
    "processing": 2,
    "completed": 1,
    "error": 1
  }
}
```

## Compression Presets

- `high`: High Quality (192kbps, 44.1kHz, stereo)
- `medium`: Medium Quality (128kbps, 44.1kHz, stereo)
- `low`: Low Quality (64kbps, 44.1kHz, stereo)
- `voice`: Voice (64kbps, 24kHz, mono)
- `podcast`: Podcast (96kbps, 44.1kHz, stereo)

## Deployment to Coolify

### Step 1: Create Git Repository

1. Create a new repository on GitHub (or GitLab/Bitbucket)
   - Name it: `ffmpeg-compression-server`
   - Make it public or ensure Coolify has access
   - Don't initialize with README (we already have one)

2. Push this code to your repository:
   ```bash
   cd ffmpeg-compression-server
   git init
   git add .
   git commit -m "Initial commit: FFmpeg compression server"
   git remote add origin https://github.com/YOUR_USERNAME/ffmpeg-compression-server.git
   git push -u origin main
   ```

### Step 2: Deploy on Coolify

1. **Log into Coolify Dashboard**
   - Go to your Coolify instance URL

2. **Create New Application**
   - Click "Resources" → "New Resource"
   - Select "New Application"
   - Choose "Docker" as the build pack

3. **Connect Git Repository**
   - Click "Connect to Git"
   - Select your Git provider (GitHub/GitLab)
   - Authorize Coolify if needed
   - Select the repository: `ffmpeg-compression-server`
   - Select branch: `main` (or `master`)

4. **Configure Build Settings**
   - Build pack: Docker
   - Dockerfile path: `Dockerfile` (default, should auto-detect)
   - Port: `3000` (or leave default)

5. **Set Environment Variables**
   Click "Environment Variables" and add:
   - `PORT=3000` (or your preferred port)
   - `NODE_ENV=production`
   - `MAX_FILE_SIZE=100` (maximum file size in MB)
   - `ALLOWED_ORIGINS=https://your-netlify-domain.com` (optional, for CORS)

6. **Deploy**
   - Click "Deploy" or "Save & Deploy"
   - Wait for the build to complete (this may take a few minutes)
   - The build will:
     - Install FFmpeg in the Docker container
     - Install Node.js dependencies
     - Start the server

7. **Get Your Server URL**
   - Once deployed, Coolify will show you the public URL
   - Example: `https://ffmpeg-api.yourdomain.com`
   - Test it: `https://ffmpeg-api.yourdomain.com/api/health`

### Step 3: Update Netlify Frontend

1. **Go to Netlify Dashboard**
   - Select your site
   - Go to Site Settings → Environment Variables

2. **Add Environment Variable**
   - Key: `NEXT_PUBLIC_COMPRESSION_API_URL`
   - Value: Your Coolify server URL (e.g., `https://ffmpeg-api.yourdomain.com`)
   - Click "Save"

3. **Redeploy Your Site**
   - Either push a commit or trigger a manual redeploy
   - Wait for deployment to complete

4. **Test**
   - Visit your site's `/test` page
   - Upload an audio file and compress it
   - Verify it works!

## Troubleshooting

### FFmpeg not available
- Check the Dockerfile includes FFmpeg installation
- Verify health endpoint shows `"ffmpeg": "available"`

### Jobs stuck in "queued" status
- Check server logs in Coolify
- Verify FFmpeg is installed correctly
- Check file permissions on `/tmp/uploads`

### CORS errors
- Add your Netlify domain to `ALLOWED_ORIGINS` environment variable
- Format: `https://your-site.netlify.app,https://your-custom-domain.com`

### Files not cleaning up
- Check `/tmp/uploads` directory permissions
- Verify cleanup interval is running (check logs)

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (default: development)
- `MAX_FILE_SIZE`: Maximum upload size in MB (default: 100)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS (default: *)

## Testing

Test the API with curl:

```bash
# Health check
curl https://your-server.com/api/health

# Create job
curl -X POST -F "file=@audio.mp3" -F "preset=medium" https://your-server.com/api/jobs

# Get status (replace JOB_ID)
curl https://your-server.com/api/jobs/JOB_ID

# Download (replace JOB_ID)
curl -O https://your-server.com/api/jobs/JOB_ID/download
```

## License

MIT

