const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const CSV_FILE_PATH = path.join(__dirname, 'src', 'data', 'registered_users.csv');
const LEAVES_FILE_PATH = path.join(__dirname, 'src', 'data', 'leave_requests.json');

// Ensure data files exist on disk
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

// Parse CSV text from disk into JSON array
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

// Convert JSON array back into CSV string
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
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url;

  // --- API 1: POST /api/register ---
  if (req.method === 'POST' && url === '/api/register') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      setTimeout(() => {
        try {
          const newUser = JSON.parse(body);
          if (!newUser.employeeId || !newUser.fullName || !newUser.email || !newUser.password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Missing required registration fields' }));
            return;
          }

          ensureFilesExist();
          const csvText = fs.readFileSync(CSV_FILE_PATH, 'utf8');
          const users = parseCSVToJSON(csvText);

          const cleanId = newUser.employeeId.trim().toUpperCase();
          const existing = users.find((u) => u.employeeId.toUpperCase() === cleanId);
          if (existing) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: `Employee ID "${cleanId}" is already registered!` }));
            return;
          }

          const userRecord = {
            employeeId: cleanId,
            fullName: newUser.fullName.trim(),
            email: newUser.email.trim(),
            password: newUser.password,
            role: newUser.role || 'EMPLOYEE',
            createdAt: new Date().toISOString(),
          };

          users.unshift(userRecord);
          fs.writeFileSync(CSV_FILE_PATH, parseJSONToCSV(users), 'utf8');

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Registration successful and saved to CSV', user: userRecord }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to process registration' }));
        }
      }, 300);
    });
    return;
  }

  // --- API 2: POST /api/login ---
  if (req.method === 'POST' && url === '/api/login') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      setTimeout(() => {
        try {
          const { employeeId, password } = JSON.parse(body);
          if (!employeeId || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Employee ID and Password are required' }));
            return;
          }

          ensureFilesExist();
          const csvText = fs.readFileSync(CSV_FILE_PATH, 'utf8');
          const users = parseCSVToJSON(csvText);

          const cleanId = employeeId.trim().toUpperCase();
          const foundUser = users.find((u) => u.employeeId.toUpperCase() === cleanId);

          if (!foundUser) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: `No account found for Employee ID "${cleanId}". Please register first.` }));
            return;
          }

          if (foundUser.password !== password) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Incorrect password. Please try again.' }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Login successful', user: foundUser }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to process login' }));
        }
      }, 300);
    });
    return;
  }

  // --- API 3: GET /api/employees ---
  if (req.method === 'GET' && url === '/api/employees') {
    setTimeout(() => {
      try {
        ensureFilesExist();
        const csvText = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        const users = parseCSVToJSON(csvText);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: users }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to fetch employees' }));
      }
    }, 300);
    return;
  }

  // --- API 4: DELETE /api/employees (Delete User by Employee ID) ---
  if (req.method === 'DELETE' && url.startsWith('/api/employees/')) {
    const targetEmpId = url.replace('/api/employees/', '').trim().toUpperCase();
    setTimeout(() => {
      try {
        ensureFilesExist();
        const csvText = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        let users = parseCSVToJSON(csvText);

        const initialCount = users.length;
        users = users.filter((u) => u.employeeId.toUpperCase() !== targetEmpId);

        if (users.length === initialCount) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: `Employee ID "${targetEmpId}" not found` }));
          return;
        }

        fs.writeFileSync(CSV_FILE_PATH, parseJSONToCSV(users), 'utf8');
        console.log(`[CSV Server] Deleted employee "${targetEmpId}" from registered_users.csv on disk!`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Employee "${targetEmpId}" deleted from CSV` }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to delete employee' }));
      }
    }, 300);
    return;
  }

  // --- API 5: GET /api/leaves ---
  if (req.method === 'GET' && url.startsWith('/api/leaves')) {
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
    }, 300);
    return;
  }

  // --- API 6: POST /api/leaves ---
  if (req.method === 'POST' && url === '/api/leaves') {
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
          res.end(JSON.stringify({ success: true, message: 'Leave request submitted', data: newLeave }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to submit leave' }));
        }
      }, 300);
    });
    return;
  }

  // Legacy raw CSV endpoints
  if (req.method === 'GET' && url === '/api/csv') {
    ensureFilesExist();
    const csvData = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/csv' });
    res.end(csvData);
    return;
  }

  if (req.method === 'POST' && url === '/api/csv') {
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
  console.log(`[Intellect REST API & CSV Sync Server] Running on http://localhost:${PORT}`);
});
