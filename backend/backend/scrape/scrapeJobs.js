const axios = require("axios");
const cheerio = require("cheerio");

const scrapeJobs = async (url) => {

  const response = await axios.get(url);

  const $ = cheerio.load(response.data);

  let jobs = [];

  $(".job").each((i, el) => {

    jobs.push({
      title: $(el).find(".title").text(),
      location: $(el).find(".location").text(),
    });

  });

  return jobs;
};

module.exports = scrapeJobs;