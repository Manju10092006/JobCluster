const axios = require("axios");

exports.searchJobs = async (req, res) => {
  try {
    const { keywords, location } = req.body;
    const apiKey = process.env.JOB_API_KEY;
    const url = `https://jooble.org/api/${apiKey}`;
    
    const payload = {
      keywords: keywords || "",
      location: location || ""
    };

    const { data } = await axios.post(url, payload);
    return res.json({ success: true, jobs: data.jobs || [] });

  } catch (error) {
    console.error("Jooble Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
};

