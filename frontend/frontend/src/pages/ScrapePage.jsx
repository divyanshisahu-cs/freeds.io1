import React, { useState } from "react";
import api from "../services/api";

function ScrapePage() {

  const [url, setUrl] = useState("");

  const [jobs, setJobs] = useState([]);

  const handleScrape = async () => {

    const response = await api.post(
      "/api/scrape",
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
