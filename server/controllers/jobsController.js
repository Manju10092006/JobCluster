const axios = require('axios');
const { redisGet, redisSet } = require('../middleware/redisSafe');

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
    const { role, location, experience } = req.query;
    
    // Build cache key: jobs:search:${keywords}:${location}:${experience}
    const keywords = role || 'developer';
    const locationStr = location || '';
    const experienceStr = experience || '';
    const cacheKey = `jobs:search:${keywords}:${locationStr}:${experienceStr}`;
    
    // Try to get from cache first
    const cachedData = await redisGet(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        console.log(`✅ Cache HIT for key: ${cacheKey}`);
        return res.json({
          success: true,
          fromCache: true,
          count: parsed.count,
          jobs: parsed.jobs,
          usage: apiCallCount
        });
      } catch (parseError) {
        console.error('⚠️  Error parsing cached data:', parseError.message);
        // Continue to fetch from API if cache parse fails
      }
    } else {
      console.log(`❌ Cache MISS for key: ${cacheKey}`);
    }
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
      keywords: keywords, // Use the normalized keywords variable
      location: locationStr // Use the normalized location variable
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

    // Cache the results for 600 seconds (10 minutes)
    const cacheData = {
      count: formattedJobs.length,
      jobs: formattedJobs
    };
    await redisSet(cacheKey, JSON.stringify(cacheData), 600);
    
    res.json({
      success: true,
      fromCache: false,
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

/**
 * Search jobs using Jooble API
 * @route POST /api/jobs/search
 * @body {string} query - Search query (required)
 * @body {string} location - Location filter (optional)
 * @body {number} page - Page number (optional, default: 1)
 * @returns {Array} Array of job objects with title, company, location, salary, snippet, type, url
 */
const searchJobs = async (req, res) => {
  try {
    // Accept both 'keywords' and 'query' for compatibility
    const { keywords, query, location, page = 1 } = req.body;
    const searchQuery = keywords || query || '';

    // Validate query
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Keywords/query parameter is required',
        jobs: []
      });
    }

    // Build cache key: jobs:<query>:<location>:<page>
    const queryStr = searchQuery.trim().toLowerCase();
    const locationStr = (location || '').trim().toLowerCase();
    const pageNum = parseInt(page) || 1;
    const cacheKey = `jobs:${queryStr}:${locationStr}:${pageNum}`;

    // Try to get from cache first
    const { redisGet, redisSet } = require('../middleware/redisSafe');
    const cachedData = await redisGet(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        console.log(`✅ Cache HIT for key: ${cacheKey}`);
        return res.json({
          success: true,
          jobs: parsed.jobs || [],
          fromCache: true
        });
      } catch (parseError) {
        console.error('⚠️  Error parsing cached data:', parseError.message);
        // Continue to fetch from API if cache parse fails
      }
    } else {
      console.log(`❌ Cache MISS for key: ${cacheKey}`);
    }

    // Get API key from environment
    const apiKey = process.env.JOOBLE_API_KEY;
    if (!apiKey) {
      console.error('❌ JOOBLE_API_KEY not configured');
      return res.json({
        success: false,
        error: 'Jooble API key is not configured',
        jobs: []
      });
    }

    // Build Jooble API URL
    const joobleApiUrl = `https://jooble.org/api/${apiKey}`;

    // Prepare request body for Jooble API
    const requestBody = {
      keywords: searchQuery.trim(),
      location: location ? location.trim() : '',
      page: pageNum
    };

    console.log(`🔍 Fetching jobs from Jooble: keywords="${searchQuery}", location="${location || 'any'}", page=${pageNum}`);

    // Make POST request to Jooble API
    let response;
    try {
      response = await axios.post(joobleApiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
    } catch (axiosError) {
      console.error('❌ Jooble API request failed:', axiosError.message);
      return res.json({
        success: false,
        error: 'Failed to fetch jobs from Jooble API',
        jobs: []
      });
    }

    // Extract jobs from Jooble response
    const jobs = response.data?.jobs || [];
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.log('⚠️  No jobs returned from Jooble API');
      return res.json({
        success: false,
        jobs: []
      });
    }

    // Map and filter to only required fields
    const formattedJobs = jobs.map(job => {
      return {
        title: job.title || 'N/A',
        company: job.company || job.employer || 'N/A',
        location: job.location || 'N/A',
        salary: job.salary || 'Not specified',
        snippet: job.snippet || '',
        type: job.type || 'Full-time',
        url: job.link || job.url || '#'
      };
    });

    // Cache the results for 10 minutes (600 seconds)
    const cacheData = {
      jobs: formattedJobs,
      timestamp: Date.now()
    };
    await redisSet(cacheKey, JSON.stringify(cacheData), 600);

    console.log(`✅ Fetched ${formattedJobs.length} jobs from Jooble API`);

    res.json({
      success: true,
      jobs: formattedJobs,
      fromCache: false
    });

  } catch (error) {
    console.error('❌ Error in searchJobs:', error.message);
    // Never throw server errors - always return JSON response
    return res.json({
      success: false,
      error: 'Internal server error',
      jobs: []
    });
  }
};

module.exports = {
  getTrendingJobs,
  searchJobs
};

