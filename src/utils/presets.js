/**
 * Compression preset configurations
 * Maps preset keys to FFmpeg arguments
 */

const PRESETS = {
  high: {
    label: "High Quality (192k)",
    ffmpegArgs: ['-b:a', '192k', '-ar', '44100', '-ac', '2', '-q:a', '2'],
    bitrate: 192,
    sampleRate: 44100,
    channels: 2
  },
  medium: {
    label: "Medium Quality (128k)",
    ffmpegArgs: ['-b:a', '128k', '-ar', '44100', '-ac', '2', '-q:a', '4'],
    bitrate: 128,
    sampleRate: 44100,
    channels: 2
  },
  low: {
    label: "Low Quality (64k)",
    ffmpegArgs: ['-b:a', '64k', '-ar', '44100', '-ac', '2', '-q:a', '6'],
    bitrate: 64,
    sampleRate: 44100,
    channels: 2
  },
  voice: {
    label: "Voice (64k mono)",
    ffmpegArgs: ['-b:a', '64k', '-ar', '24000', '-ac', '1', '-q:a', '6'],
    bitrate: 64,
    sampleRate: 24000,
    channels: 1
  },
  podcast: {
    label: "Podcast (96k)",
    ffmpegArgs: ['-b:a', '96k', '-ar', '44100', '-ac', '2', '-q:a', '5'],
    bitrate: 96,
    sampleRate: 44100,
    channels: 2
  }
};

/**
 * Get preset configuration by key
 * @param {string} presetKey - The preset key
 * @returns {object|null} Preset configuration or null if not found
 */
function getPreset(presetKey) {
  return PRESETS[presetKey] || null;
}

/**
 * Check if preset exists
 * @param {string} presetKey - The preset key
 * @returns {boolean}
 */
function isValidPreset(presetKey) {
  return presetKey in PRESETS;
}

/**
 * Get all available presets
 * @returns {object} All preset configurations
 */
function getAllPresets() {
  return PRESETS;
}

module.exports = {
  getPreset,
  isValidPreset,
  getAllPresets,
  PRESETS
};

