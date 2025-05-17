// File: server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const templateRoutes = require('./routes/templates');
app.use('/api', templateRoutes);

app.listen(port, () => {
  console.log(`Canvas template service running at http://localhost:${port}`);
});
