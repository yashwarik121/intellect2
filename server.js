const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const CSV_FILE_PATH = path.join(__dirname, 'src', 'data', 'registered_users.csv');
const LEAVES_FILE_PATH = path.join(__dirname, 'src', 'data', 'leave_requests.json');

// Ensure data files exist
const ensureFilesExist = () => {
  const dir = path.dirname(CSV_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const defaultHeaders =
      'EmployeeID,FullName,Email,Password,Role,CreatedAt\n' +
      'EMP1001,Admin User,admin@intellect.com,adminpassword,ADMIN,2026-07-29T13:00:00.000Z\n' +
      'EMP1002,Rahul Sharma,rahul.sharma@intellect.com,password123,EMPLOYEE,2026-07-29T13:00:00.000Z\n';
    fs.writeFileSync(CSV_FILE_PATH, defaultHeaders, 'utf8');
  }
  if (!fs.existsSync(LEAVES_FILE_PATH)) {
    const defaultLeaves = [
      {
        id: 'LV-101',
        employeeId: 'EMP1002',
        leaveType: 'Casual Leave',
        startDate: '2026-08-05',
        endDate: '2026-08-07',
        reason: 'Family vacation',
        status: 'PENDING',
        appliedDate: '2026-08-01',
      },
    ];
    fs.writeFileSync(LEAVES_FILE_PATH, JSON.stringify(defaultLeaves, null, 2), 'utf8');
  }
};

ensureFilesExist();

// Helper to parse CSV lines into JSON objects
const parseCSVToJSON = (csvText) => {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
    if (parts.length >= 4) {
      result.push({
        employeeId: parts[0],
        fullName: parts[1],
        email: parts[2],
        password: parts[3],
        role: parts[4] || 'EMPLOYEE',
        createdAt: parts[5] || new Date().toISOString(),
      });
    }
  }
  return result;
};

// Helper to convert JSON array to CSV string
const parseJSONToCSV = (users) => {
  const headers = 'EmployeeID,FullName,Email,Password,Role,CreatedAt';
  const rows = users.map((u) => {
    const empId = `"${u.employeeId.replace(/"/g, '""')}"`;
    const name = `"${u.fullName.replace(/"/g, '""')}"`;
    const email = `"${u.email.replace(/"/g, '""')}"`;
    const pass = `"${(u.password || '').replace(/"/g, '""')}"`;
    const role = `"${(u.role || 'EMPLOYEE').replace(/"/g, '""')}"`;
    const created = `"${(u.createdAt || new Date().toISOString()).replace(/"/g, '""')}"`;
    return `${empId},${name},${email},${pass},${role},${created}`;
  });
  return [headers, ...rows].join('\n');
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API 1: GET /api/employees ---
  if (req.method === 'GET' && req.url === '/api/employees') {
    setTimeout(() => {
      try {
        ensureFilesExist();
        const csvData = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        const users = parseCSVToJSON(csvData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: users }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to fetch employees' }));
      }
    }, 400); // 400ms simulated network latency for smooth loading spinner demonstration
    return;
  }

  // --- API 2: POST /api/employees (Register New Employee) ---
  if (req.method === 'POST' && req.url === '/api/employees') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      setTimeout(() => {
        try {
          const newUser = JSON.parse(body);
          if (!newUser.employeeId || !newUser.fullName || !newUser.email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Missing required employee fields' }));
            return;
          }

          ensureFilesExist();
          const csvData = fs.readFileSync(CSV_FILE_PATH, 'utf8');
          const users = parseCSVToJSON(csvData);

          const existingIdx = users.findIndex(
            (u) => u.employeeId.toUpperCase() === newUser.employeeId.toUpperCase()
          );
          if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...newUser };
          } else {
            users.unshift({
              ...newUser,
              createdAt: newUser.createdAt || new Date().toISOString(),
            });
          }

          const updatedCSV = parseJSONToCSV(users);
          fs.writeFileSync(CSV_FILE_PATH, updatedCSV, 'utf8');

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: true,
              message: 'Employee registered and saved to CSV',
              data: newUser,
            })
          );
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to register employee' }));
        }
      }, 500);
    });
    return;
  }

  // --- API 3: GET /api/leaves ---
  if (req.method === 'GET' && req.url.startsWith('/api/leaves')) {
    setTimeout(() => {
      try {
        ensureFilesExist();
        const leavesData = fs.readFileSync(LEAVES_FILE_PATH, 'utf8');
        const leaves = JSON.parse(leavesData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: leaves }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to fetch leaves' }));
      }
    }, 400);
    return;
  }

  // --- API 4: POST /api/leaves (Submit Leave Request) ---
  if (req.method === 'POST' && req.url === '/api/leaves') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      setTimeout(() => {
        try {
          const leavePayload = JSON.parse(body);
          ensureFilesExist();
          const leavesData = fs.readFileSync(LEAVES_FILE_PATH, 'utf8');
          const leaves = JSON.parse(leavesData);

          const newLeave = {
            id: `LV-${Date.now().toString().slice(-4)}`,
            employeeId: leavePayload.employeeId || 'EMP1001',
            leaveType: leavePayload.leaveType || 'Casual Leave',
            startDate: leavePayload.startDate,
            endDate: leavePayload.endDate,
            reason: leavePayload.reason,
            status: 'PENDING',
            appliedDate: new Date().toISOString().split('T')[0],
          };

          leaves.unshift(newLeave);
          fs.writeFileSync(LEAVES_FILE_PATH, JSON.stringify(leaves, null, 2), 'utf8');

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: true,
              message: 'Leave request submitted for approval',
              data: newLeave,
            })
          );
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to submit leave request' }));
        }
      }, 500);
    });
    return;
  }

  // Legacy GET / POST CSV endpoint
  if (req.method === 'GET' && req.url === '/api/csv') {
    ensureFilesExist();
    const csvData = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/csv' });
    res.end(csvData);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/csv') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      fs.writeFileSync(CSV_FILE_PATH, body, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[Employee & Leave API Server] Running on http://localhost:${PORT}`);
});
