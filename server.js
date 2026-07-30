const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const CSV_FILE_PATH = path.join(__dirname, 'src', 'data', 'registered_users.csv');

// Ensure directory and CSV file exist on disk
const ensureCSVFileExists = () => {
  const dir = path.dirname(CSV_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const defaultHeaders = 'EmployeeID,FullName,Email,Password,Role,CreatedAt\n' +
      'EMP1001,Admin User,admin@intellect.com,adminpassword,ADMIN,2026-07-29T13:00:00.000Z\n' +
      'EMP1002,Rahul Sharma,rahul.sharma@intellect.com,password123,EMPLOYEE,2026-07-29T13:00:00.000Z\n';
    fs.writeFileSync(CSV_FILE_PATH, defaultHeaders, 'utf8');
    console.log('[CSV Server] Created initial registered_users.csv on disk');
  }
};

ensureCSVFileExists();

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/csv - Read CSV file from disk
  if (req.method === 'GET' && req.url === '/api/csv') {
    try {
      ensureCSVFileExists();
      const csvData = fs.readFileSync(CSV_FILE_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/csv' });
      res.end(csvData);
    } catch (err) {
      console.error('[CSV Server] Error reading CSV file:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read CSV file' }));
    }
    return;
  }

  // POST /api/csv - Save updated CSV file permanently to disk
  if (req.method === 'POST' && req.url === '/api/csv') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        if (!body || body.trim().length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Empty CSV content' }));
          return;
        }

        fs.writeFileSync(CSV_FILE_PATH, body, 'utf8');
        console.log('[CSV Server] Successfully updated registered_users.csv on disk!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'CSV updated permanently on disk' }));
      } catch (err) {
        console.error('[CSV Server] Error writing CSV file:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to write CSV file to disk' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[CSV Sync Server] Running permanently on http://localhost:${PORT}`);
  console.log(`[CSV Sync Server] Syncing physical file: ${CSV_FILE_PATH}`);
});
