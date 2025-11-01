/**
 * Compression API Routes
 */

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const jobManager = require('../services/jobManager');
const ffmpegService = require('../services/ffmpegService');
const { isValidPreset } = require('../utils/presets');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE || 100) * 1024 * 1024 // Default 100MB
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const validMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/mp4',
      'audio/x-m4a',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'video/mp4',
      'video/webm'
    ];

    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

/**
 * POST /api/jobs
 * Start a new compression job
 */
router.post('/jobs', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const preset = req.body.preset || 'medium';
    
    if (!isValidPreset(preset)) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: `Invalid preset: ${preset}` });
    }

    // Create job
    const jobId = uuidv4();
    jobManager.createJob(jobId, {
      filePath: req.file.path,
      preset,
      originalFileName: req.file.originalname
    });

    // Start processing asynchronously
    processJob(jobId, req.file.path, preset, req.file.originalname).catch(error => {
      console.error(`[Routes] Job ${jobId} processing error:`, error);
      jobManager.updateJob(jobId, {
        status: 'error',
        error: error.message
      });
    });

    res.json({
      jobId,
      status: 'queued'
    });
  } catch (error) {
    console.error('[Routes] Error creating job:', error);
    res.status(500).json({ error: error.message || 'Failed to create compression job' });
  }
});

/**
 * GET /api/jobs/:jobId
 * Get job status and progress
 */
router.get('/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobManager.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const response = {
    jobId: job.id,
    status: job.status,
    progress: job.progress
  };

  if (job.status === 'completed' && job.downloadUrl) {
    response.downloadUrl = job.downloadUrl;
  }

  if (job.status === 'error' && job.error) {
    response.error = job.error;
  }

  res.json(response);
});

/**
 * GET /api/jobs/:jobId/download
 * Download compressed file
 */
router.get('/jobs/:jobId/download', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobManager.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: `Job is not completed. Status: ${job.status}` });
    }

    if (!job.outputPath) {
      return res.status(500).json({ error: 'Output file not found' });
    }

    // Check if file exists
    try {
      await fs.access(job.outputPath);
    } catch {
      return res.status(404).json({ error: 'Compressed file not found' });
    }

    // Set headers for file download
    const originalName = job.originalFileName || 'audio.mp3';
    const baseName = path.parse(originalName).name;
    const downloadName = `compressed_${baseName}.mp3`;

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

    // Stream file
    const fileStream = require('fs').createReadStream(job.outputPath);
    fileStream.pipe(res);

    // Clean up after streaming (with delay to ensure file is sent)
    fileStream.on('end', () => {
      setTimeout(async () => {
        try {
          await fs.unlink(job.outputPath);
          await fs.unlink(job.filePath);
          console.log(`[Routes] Cleaned up files for job ${jobId}`);
        } catch (error) {
          console.error(`[Routes] Cleanup error for job ${jobId}:`, error);
        }
      }, 5000); // 5 second delay
    });
  } catch (error) {
    console.error('[Routes] Download error:', error);
    res.status(500).json({ error: error.message || 'Failed to download file' });
  }
});

/**
 * Process compression job
 * @param {string} jobId - Job identifier
 * @param {string} filePath - Path to input file
 * @param {string} preset - Compression preset
 * @param {string} originalFileName - Original file name
 */
async function processJob(jobId, filePath, preset, originalFileName) {
  try {
    // Validate file - use original filename for extension check since multer doesn't preserve extensions
    const isValid = await ffmpegService.validateAudioFile(filePath, originalFileName);
    if (!isValid) {
      throw new Error('Invalid audio file format');
    }

    // Update job status
    jobManager.updateJob(jobId, { status: 'processing', progress: 0 });

    // Generate output path
    const outputPath = path.join('/tmp/uploads', `compressed_${jobId}.mp3`);

    // Compress audio
    const result = await ffmpegService.compressAudio(
      filePath,
      outputPath,
      preset,
      (progress) => {
        jobManager.updateJob(jobId, { progress: Math.round(progress) });
      }
    );

    // Update job with completion
    const downloadUrl = `/api/jobs/${jobId}/download`;
    jobManager.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      outputPath: result.outputPath,
      downloadUrl
    });

    console.log(`[Routes] Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`[Routes] Job ${jobId} failed:`, error);
    jobManager.updateJob(jobId, {
      status: 'error',
      error: error.message
    });

    // Clean up input file on error
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

module.exports = router;

