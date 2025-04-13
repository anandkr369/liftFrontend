// const express = require('express');
// const app = express();
// const cors = require('cors');
// const dotenv = require('dotenv');

// // Load environment variables from .env file (for local development)
// dotenv.config();

// // Use CORS and JSON middleware
// app.use(cors());
// app.use(express.json());

// // In-memory floor requests (for now, persist in memory)
// let floorRequests = {}; 

// // Endpoint to submit floor requests
// app.post('/api/floor-request', (req, res) => {
//   const { elevatorId, floor } = req.body;
//   const key = `${elevatorId}-floor-${floor}`;

//   if (!floorRequests[key]) floorRequests[key] = 0;
//   floorRequests[key]++;

//   res.json({ success: true, count: floorRequests[key] });
// });

// // Endpoint to get all floor requests
// app.get('/api/floor-request', (req, res) => {
//   res.json(floorRequests);
// });

// // Endpoint to reset floor requests (for when the elevator reaches a floor)
// app.post('/api/reset-floor-request', (req, res) => {
//   const { elevatorId, floor } = req.body;
//   const key = `${elevatorId}-floor-${floor}`;
//   floorRequests[key] = 0;

//   res.json({ success: true });
// });

// // Set port from environment variables or default to 3000
// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });




const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

app.use(cors());
app.use(express.json());

// Store floor requests with timestamps
let floorRequests = {};

// Add a new request with timestamp
app.post('/api/floor-request', (req, res) => {
  const { elevatorId, floor } = req.body;
  const key = `${elevatorId}-floor-${floor}`;
  const now = Date.now();

  if (!floorRequests[key]) {
    floorRequests[key] = [];
  }

  // Add current timestamp to array
  floorRequests[key].push(now);

  // Remove timestamps older than 5 minutes
  floorRequests[key] = floorRequests[key].filter(
    timestamp => now - timestamp <= 5 * 60 * 1000
  );

  res.json({ success: true, count: floorRequests[key].length });
});

// Get count of requests in last 5 minutes
app.get('/api/floor-request', (req, res) => {
  const { elevatorId, floor } = req.query;
  const key = `${elevatorId}-floor-${floor}`;
  const now = Date.now();

  if (!floorRequests[key]) {
    return res.json({ count: 0 });
  }

  // Remove old timestamps
  floorRequests[key] = floorRequests[key].filter(
    timestamp => now - timestamp <= 5 * 60 * 1000
  );

  res.json({ count: floorRequests[key].length });
});

// Manual reset (optional)
app.post('/api/reset-floor-request', (req, res) => {
  const { elevatorId, floor } = req.body;
  const key = `${elevatorId}-floor-${floor}`;
  floorRequests[key] = [];

  res.json({ success: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
