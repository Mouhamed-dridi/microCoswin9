import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database file paths
const DB_DIR = path.join(__dirname, '../databases');
const TICKETS_FILE = path.join(DB_DIR, 'tickets.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const PROVIDERS_FILE = path.join(DB_DIR, 'providers.json');
const MACHINES_FILE = path.join(DB_DIR, 'machines.json');
const MAINTENANCE_TEAM_FILE = path.join(DB_DIR, 'maintenanceTeam.json');

// Ensure database files exist
const initDb = async () => {
  await fs.ensureDir(DB_DIR);
  if (!(await fs.pathExists(TICKETS_FILE))) await fs.writeJson(TICKETS_FILE, []);
  if (!(await fs.pathExists(USERS_FILE))) await fs.writeJson(USERS_FILE, [{ username: 'admin', password: 'password', role: 'manager' }]);
  if (!(await fs.pathExists(PROVIDERS_FILE))) await fs.writeJson(PROVIDERS_FILE, []);
  if (!(await fs.pathExists(MACHINES_FILE))) await fs.writeJson(MACHINES_FILE, []);
  if (!(await fs.pathExists(MAINTENANCE_TEAM_FILE))) await fs.writeJson(MAINTENANCE_TEAM_FILE, []);
};

initDb();

// Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await fs.readJson(TICKETS_FILE);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read tickets' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const tickets = await fs.readJson(TICKETS_FILE);
    const newTicket = req.body;
    tickets.push(newTicket);
    await fs.writeJson(TICKETS_FILE, tickets, { spaces: 2 });
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save ticket' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await fs.readJson(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      res.json({ success: true, user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/providers', async (req, res) => {
  try {
    const providers = await fs.readJson(PROVIDERS_FILE);
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/machines', async (req, res) => {
  try {
    console.log('GET /api/machines called');
    const machines = await fs.readJson(MACHINES_FILE);
    res.json(machines);
  } catch (err) {
    console.error('Error reading machines:', err);
    res.status(500).json({ error: 'Failed to read machines' });
  }
});

app.post('/api/machines', async (req, res) => {
  try {
    console.log('POST /api/machines called with data:', req.body);
    const machines = await fs.readJson(MACHINES_FILE);
    const newMachine = req.body;
    machines.push(newMachine);
    await fs.writeJson(MACHINES_FILE, machines, { spaces: 2 });
    res.status(201).json(newMachine);
  } catch (err) {
    console.error('Error saving machines:', err);
    res.status(500).json({ error: 'Failed to save machines' });
  }
});

app.put('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log(`PUT /api/machines/${id} called with data:`, updatedData);

    let machines = await fs.readJson(MACHINES_FILE);
    const index = machines.findIndex(m => m.id === id);

    if (index !== -1) {
      machines[index] = { ...machines[index], ...updatedData };
      await fs.writeJson(MACHINES_FILE, machines, { spaces: 2 });
      res.status(200).json(machines[index]);
    } else {
      res.status(404).json({ error: 'Machine not found' });
    }
  } catch (err) {
    console.error('Error updating machine:', err);
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

app.get('/api/maintenanceTeam', async (req, res) => {
  try {
    console.log('GET /api/maintenanceTeam called');
    const team = await fs.readJson(MAINTENANCE_TEAM_FILE);
    res.json(team);
  } catch (err) {
    console.error('Error reading maintenanceTeam:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/maintenanceTeam', async (req, res) => {
  try {
    console.log('POST /api/maintenanceTeam called');
    const team = req.body;
    await fs.writeJson(MAINTENANCE_TEAM_FILE, team, { spaces: 2 });
    res.status(200).json(team);
  } catch (err) {
    console.error('Error saving maintenanceTeam:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
