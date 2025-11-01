/**
 * Job Manager - In-memory job queue and status tracking
 */

class JobManager {
  constructor() {
    this.jobs = new Map();
    this.cleanupInterval = null;
    this.startCleanupInterval();
  }

  /**
   * Create a new job
   * @param {string} jobId - Unique job identifier
   * @param {object} jobData - Job data (file path, preset, etc.)
   * @returns {object} Job status
   */
  createJob(jobId, jobData) {
    const job = {
      id: jobId,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      filePath: jobData.filePath,
      outputPath: null,
      preset: jobData.preset,
      originalFileName: jobData.originalFileName,
      error: null,
      downloadUrl: null
    };

    this.jobs.set(jobId, job);
    console.log(`[JobManager] Created job ${jobId}`);
    return job;
  }

  /**
   * Get job status
   * @param {string} jobId - Job identifier
   * @returns {object|null} Job status or null if not found
   */
  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Update job status
   * @param {string} jobId - Job identifier
   * @param {object} updates - Status updates
   */
  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[JobManager] Attempted to update non-existent job ${jobId}`);
      return;
    }

    Object.assign(job, updates, { updatedAt: new Date() });
    console.log(`[JobManager] Updated job ${jobId}: ${JSON.stringify(updates)}`);
  }

  /**
   * Delete job and clean up
   * @param {string} jobId - Job identifier
   */
  deleteJob(jobId) {
    this.jobs.delete(jobId);
    console.log(`[JobManager] Deleted job ${jobId}`);
  }

  /**
   * Clean up old completed/errored jobs (older than 1 hour)
   */
  cleanupOldJobs() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let cleaned = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'error') &&
        job.updatedAt.getTime() < oneHourAgo
      ) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[JobManager] Cleaned up ${cleaned} old jobs`);
    }
  }

  /**
   * Start cleanup interval (runs every 10 minutes)
   */
  startCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupOldJobs();
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Get job statistics
   * @returns {object} Statistics about jobs
   */
  getStats() {
    const stats = {
      total: this.jobs.size,
      queued: 0,
      processing: 0,
      completed: 0,
      error: 0
    };

    for (const job of this.jobs.values()) {
      if (stats.hasOwnProperty(job.status)) {
        stats[job.status]++;
      }
    }

    return stats;
  }
}

// Singleton instance
const jobManager = new JobManager();

module.exports = jobManager;

