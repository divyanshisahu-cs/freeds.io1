const express = require('express');

const dotenv = require('dotenv');

const cors = require('cors');

const mongoose = require('mongoose');

const path = require('path');

const postRoutes =
  require("./routes/postRoutes");

const authRoutes =
  require("./routes/authRoutes");


dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 5000;


// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);


// ROUTES
app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/auth",
  authRoutes
);


// HOME ROUTE
app.get('/', (req, res) => {

  res.send(
    'Freeds.io Backend is running'
  );
});


// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (MongoDB not connected)`);
    });
  });
