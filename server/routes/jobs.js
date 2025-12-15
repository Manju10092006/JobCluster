const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/search", async (req, res) => {
  const { keywords, location, page = 1 } = req.query;

  if (!keywords) return res.status(400).json({ success: false, error: "keywords required" });

  try {
    const url = `${process.env.JOOBLE_API_URL}/${process.env.JOOBLE_API_KEY}`;

    const response = await axios.post(url, {
      keywords,
      location,
      page: Number(page)
    });

    return res.json({
      success: true,
      jobs: response.data.jobs || [],
      totalResults: response.data.totalCount || 0,
      page: Number(page),
    });

  } catch (error) {
    console.error("JOOBLE ERROR:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || "Failed to fetch jobs",
    });
  }
});

module.exports = router;

