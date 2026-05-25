import React, { useState } from "react";
import axios from "axios";

function ScrapePage() {

  const [url, setUrl] = useState("");

  const [jobs, setJobs] = useState([]);

  const handleScrape = async () => {

    const response = await axios.post(
      "http://localhost:5000/api/scrape",
      {
        url,
      }
    );

    setJobs(response.data);
  };

  return (
    <div>

      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleScrape}>
        Scrape
      </button>

      {jobs.map((job, index) => (
        <div key={index}>
          <h3>{job.title}</h3>
          <p>{job.location}</p>
        </div>
      ))}

    </div>
  );
}

export default ScrapePage;