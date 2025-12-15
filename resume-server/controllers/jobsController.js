const axios = require('axios');

// API call counter for Jooble API usage tracking
let apiCallCount = 0;

/**
 * Fetch trending jobs from Jooble REST API
 * @route GET /api/jobs
 * @query {string} role - Job role/title (optional)
 * @query {string} location - Job location (optional)
 * @query {string} experience - Experience level (optional, not used by Jooble but kept for compatibility)
 * @returns {Array} Array of job objects containing title, company, location, salary, job type, and apply link
 */
const getTrendingJobs = async (req, res) => {
  try {
    const { role, location } = req.query;
    const apiKey = process.env.JOB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Jooble API key is not configured. Please set JOB_API_KEY in .env file.'
      });
    }

    // Check if API call limit is reached
    if (apiCallCount >= 480) {
      return res.status(429).json({
        success: false,
        message: 'Jooble API request limit is near exhaustion (480+). Please try again later.'
      });
    }

    // Build Jooble API URL
    const joobleApiUrl = `https://jooble.org/api/${apiKey}`;

    // Prepare request body for Jooble API
    const requestBody = {
      keywords: role || 'developer', // Default to 'developer' if no role specified
      location: location || '' // Empty string if no location specified
    };

    // Increment API call counter before making the request
    apiCallCount++;
    console.log('JOOBLE API USED:', apiCallCount);

    // Make POST request to Jooble API
    const response = await axios.post(joobleApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    // Extract jobs from Jooble response
    // Jooble API returns jobs in response.data.jobs array
    const jobs = response.data?.jobs || [];
    
    // Format jobs to match required structure
    const formattedJobs = jobs.map(job => {
      // Extract job type (remote/on-site)
      // Jooble may provide this in different fields, check common patterns
      let jobType = 'On-site'; // Default
      const titleLower = (job.title || '').toLowerCase();
      const locationLower = (job.location || '').toLowerCase();
      const snippetLower = (job.snippet || '').toLowerCase();
      
      // Check if job is remote
      if (
        titleLower.includes('remote') ||
        locationLower.includes('remote') ||
        snippetLower.includes('remote') ||
        job.type === 'Remote' ||
        job.type === 'remote'
      ) {
        jobType = 'Remote';
      }

      // Format salary
      let salaryStr = 'Not specified';
      if (job.salary) {
        salaryStr = job.salary;
      }

      // Format location
      const locationStr = job.location || 'N/A';

      // Get apply link
      const applyLink = job.link || job.url || '#';

      return {
        title: job.title || 'N/A',
        company: job.company || job.employer || 'N/A',
        location: locationStr,
        salary: salaryStr,
        jobType: jobType,
        applyLink: applyLink
      };
    });

    res.json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs,
      usage: apiCallCount
    });

  } catch (error) {
    console.error('Error fetching jobs from Jooble API:', error.message);
    
    // Handle different error types
    if (error.response) {
      // API responded with error status
      const statusCode = error.response.status || 500;
      const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.message;
      
      return res.status(statusCode).json({
        success: false,
        error: 'Failed to fetch jobs from Jooble API',
        message: errorMessage
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(503).json({
        success: false,
        error: 'Jooble API is currently unavailable',
        message: 'The job search service is not responding. Please try again later.'
      });
    } else {
      // Error setting up the request
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
};

module.exports = {
  getTrendingJobs
};

