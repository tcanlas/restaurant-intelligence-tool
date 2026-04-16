const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const csv = require('csv-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/sales', (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, 'data', 'sales.csv');

  // Ensure the directory and file exist to prevent crashes
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Sales data file not found. Please add sales.csv to the backend/data folder.' });
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Convert strings to numbers during the stream
      results.push({
        ...row,
        net_sales: parseFloat(row.net_sales) || 0,
        order_count: parseInt(row.order_count, 10) || 0,
        labor_cost: parseFloat(row.labor_cost) || 0,
      });
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (error) => {
      res.status(500).json({ error: 'Error parsing CSV file' });
    });
});

// Demonstrating scalability: Calculate summaries without storing the whole file in memory
app.get('/api/sales-summary', (req, res) => {
  const summary = {
    total_sales: 0,
    total_orders: 0,
    total_labor: 0,
    row_count: 0
  };
  const filePath = path.join(__dirname, 'data', 'sales.csv');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Data file missing' });
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // We only update the summary object, we DON'T push to an array.
      // This handles 1GB+ files with very low RAM usage.
      summary.total_sales += parseFloat(row.net_sales) || 0;
      summary.total_orders += parseInt(row.order_count, 10) || 0;
      summary.total_labor += parseFloat(row.labor_cost) || 0;
      summary.row_count++;
    })
    .on('end', () => {
      res.json(summary);
    })
    .on('error', () => {
      res.status(500).json({ error: 'Processing error' });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});