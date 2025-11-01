/**
 * FFmpeg Service - Handles audio compression using FFmpeg
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { getPreset } = require('../utils/presets');

/**
 * Compress audio file using FFmpeg
 * @param {string} inputPath - Path to input audio file
 * @param {string} outputPath - Path to output compressed file
 * @param {string} presetKey - Compression preset key
 * @param {function} onProgress - Progress callback (progress: 0-100)
 * @returns {Promise<object>} Compression result with file info
 */
async function compressAudio(inputPath, outputPath, presetKey, onProgress) {
  return new Promise((resolve, reject) => {
    const preset = getPreset(presetKey);
    if (!preset) {
      return reject(new Error(`Invalid preset: ${presetKey}`));
    }

    console.log(`[FFmpegService] Starting compression: ${inputPath} -> ${outputPath}`);
    console.log(`[FFmpegService] Preset: ${presetKey}, Args: ${preset.ffmpegArgs.join(' ')}`);

    const command = ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioBitrate(preset.bitrate)
      .audioChannels(preset.channels)
      .audioFrequency(preset.sampleRate)
      .format('mp3')
      .outputOptions(preset.ffmpegArgs)
      .on('start', (commandLine) => {
        console.log(`[FFmpegService] FFmpeg command: ${commandLine}`);
        onProgress?.(5);
      })
      .on('progress', (progress) => {
        // progress.percent is 0-100
        const percent = Math.min(Math.max(progress.percent || 0, 5), 95);
        console.log(`[FFmpegService] Progress: ${percent.toFixed(1)}%`);
        onProgress?.(percent);
      })
      .on('end', async () => {
        try {
          const stats = await fs.stat(outputPath);
          console.log(`[FFmpegService] Compression completed. Output size: ${stats.size} bytes`);
          onProgress?.(100);
          
          resolve({
            outputPath,
            fileSize: stats.size,
            duration: null // Could be extracted from FFmpeg if needed
          });
        } catch (error) {
          reject(new Error(`Failed to read output file: ${error.message}`));
        }
      })
      .on('error', (error) => {
        console.error(`[FFmpegService] FFmpeg error:`, error);
        reject(new Error(`FFmpeg compression failed: ${error.message}`));
      });

    command.run();
  });
}

/**
 * Validate audio file format
 * @param {string} filePath - Path to audio file
 * @returns {Promise<boolean>} True if valid audio file
 */
async function validateAudioFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return false;
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.mp4', '.webm'];
    
    return validExtensions.includes(ext);
  } catch (error) {
    console.error(`[FFmpegService] File validation error:`, error);
    return false;
  }
}

/**
 * Get audio file duration using FFmpeg
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} Duration in seconds
 */
async function getDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject(new Error(`Failed to get duration: ${error.message}`));
        return;
      }

      const duration = metadata.format.duration || 0;
      resolve(Math.round(duration));
    });
  });
}

module.exports = {
  compressAudio,
  validateAudioFile,
  getDuration
};

