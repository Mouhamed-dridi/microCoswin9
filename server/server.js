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
const MAINTENANCE_REQUESTS_FILE = path.join(DB_DIR, 'maintenanceRequests.json');
const GROUPS_FILE = path.join(DB_DIR, 'groups.json');

// Safe JSON read helper
const safeReadJson = async (filePath, defaultValue = []) => {
  try {
    if (!(await fs.pathExists(filePath))) return defaultValue;
    const stats = await fs.stat(filePath);
    if (stats.size === 0) return defaultValue;
    return await fs.readJson(filePath);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
};

// Ensure database files exist
const initDb = async () => {
  await fs.ensureDir(DB_DIR);
  const files = [
    { path: TICKETS_FILE, default: [] },
    { path: USERS_FILE, default: [{ username: 'admin', password: 'password', role: 'manager' }] },
    { path: PROVIDERS_FILE, default: [] },
    { path: MACHINES_FILE, default: [] },
    { path: MAINTENANCE_TEAM_FILE, default: [] },
    { path: path.join(DB_DIR, 'session.json'), default: {} },
    { path: path.join(DB_DIR, 'settings.json'), default: {} },
    { path: path.join(DB_DIR, 'groups.json'), default: [] },
  ];

  for (const file of files) {
    if (!(await fs.pathExists(file.path)) || (await fs.stat(file.path)).size === 0) {
      await fs.writeJson(file.path, file.default, { spaces: 2 });
    }
  }
};

initDb();

// Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await safeReadJson(TICKETS_FILE);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read tickets' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const tickets = await safeReadJson(TICKETS_FILE);
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
    const users = await safeReadJson(USERS_FILE);
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
    const providers = await safeReadJson(PROVIDERS_FILE);
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/machines', async (req, res) => {
  try {
    console.log('GET /api/machines called');
    const machines = await safeReadJson(MACHINES_FILE);
    res.json(machines);
  } catch (err) {
    console.error('Error reading machines:', err);
    res.status(500).json({ error: 'Failed to read machines' });
  }
});

app.post('/api/machines', async (req, res) => {
  try {
    console.log('POST /api/machines called with data:', req.body);
    const machines = await safeReadJson(MACHINES_FILE);
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

app.get('/api/groups', async (req, res) => {
  try {
    const groups = await safeReadJson(GROUPS_FILE);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const groups = await safeReadJson(GROUPS_FILE);
    const newGroup = req.body;
    groups.push(newGroup);
    await fs.writeJson(GROUPS_FILE, groups, { spaces: 2 });
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let groups = await safeReadJson(GROUPS_FILE);
    const filtered = groups.filter(g => g.id !== id);
    if (groups.length !== filtered.length) {
      await fs.writeJson(GROUPS_FILE, filtered, { spaces: 2 });
      res.status(200).json({ message: 'Deleted' });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/maintenanceRequests', async (req, res) => {
  try {
    const data = await safeReadJson(MAINTENANCE_REQUESTS_FILE);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/maintenanceRequests', async (req, res) => {
  try {
    const data = await safeReadJson(MAINTENANCE_REQUESTS_FILE);
    const newRequest = { ...req.body, id: Date.now().toString() };
    data.push(newRequest);
    await fs.writeJson(MAINTENANCE_REQUESTS_FILE, data, { spaces: 2 });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/api/maintenanceRequests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let data = await safeReadJson(MAINTENANCE_REQUESTS_FILE);
    const filtered = data.filter(item => item.id !== id);
    await fs.writeJson(MAINTENANCE_REQUESTS_FILE, filtered, { spaces: 2 });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/maintenanceTeam', async (req, res) => {
  try {
    console.log('GET /api/maintenanceTeam called');
    const team = await safeReadJson(MAINTENANCE_TEAM_FILE);
    res.json(team);
  } catch (err) {
    console.error('Error reading maintenanceTeam:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/maintenanceTeam', async (req, res) => {
  try {
    console.log('POST /api/maintenanceTeam called');
    const team = await safeReadJson(MAINTENANCE_TEAM_FILE);
    const newTechnician = req.body;
    team.push(newTechnician);
    await fs.writeJson(MAINTENANCE_TEAM_FILE, team, { spaces: 2 });
    res.status(201).json(newTechnician);
  } catch (err) {
    console.error('Error saving maintenanceTeam:', err);
    res.status(500).json({ error: 'Failed to save maintenance team member' });
  }
});

app.put('/api/maintenanceTeam/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log(`PUT /api/maintenanceTeam/${id} called`);

    let team = await safeReadJson(MAINTENANCE_TEAM_FILE);
    const index = team.findIndex(t => t.id === id);

    if (index !== -1) {
      team[index] = { ...team[index], ...updatedData };
      await fs.writeJson(MAINTENANCE_TEAM_FILE, team, { spaces: 2 });
      res.status(200).json(team[index]);
    } else {
      res.status(404).json({ error: 'Technician not found' });
    }
  } catch (err) {
    console.error('Error updating maintenanceTeam:', err);
    res.status(500).json({ error: 'Failed to update maintenance team member' });
  }
});

app.delete('/api/maintenanceTeam/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/maintenanceTeam/${id} called`);

    let team = await safeReadJson(MAINTENANCE_TEAM_FILE);
    const filteredTeam = team.filter(t => t.id !== id);

    if (team.length !== filteredTeam.length) {
      await fs.writeJson(MAINTENANCE_TEAM_FILE, filteredTeam, { spaces: 2 });
      res.status(200).json({ message: 'Deleted successfully' });
    } else {
      res.status(404).json({ error: 'Technician not found' });
    }
  } catch (err) {
    console.error('Error deleting from maintenanceTeam:', err);
    res.status(500).json({ error: 'Failed to delete maintenance team member' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
