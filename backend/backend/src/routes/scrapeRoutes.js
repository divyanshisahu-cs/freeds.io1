const express = require("express");

const router = express.Router();

const scrapeJobs = require("../../scrape/scrapeJobs");

router.post("/", async (req, res) => {

  const jobs = await scrapeJobs(req.body.url);

  res.json(jobs);

});

module.exports = router;
