# microCoswin9 Installation & Run Guide

Follow these steps to set up and run the MicroFix V10 (Full-Stack) application locally.

## Prerequisites

- **Node.js**: Version >= 18.0.0 is required. (Recommended: Latest LTS)
  - Download from: [nodejs.org](https://nodejs.org/)
  - Verify with: `node -v`

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/Mouhamed-dridi/microCoswin9.git
   cd microCoswin9
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Automated (Recommended)
Run the automated setup script (Windows):
```bash
./setup.bat
```

### Option 2: Manual
You need to run both the Backend and the Frontend.

1. **Start Backend**:
   ```bash
   npm run server
   ```
   (Runs on `http://localhost:3001`)

2. **Start Frontend**:
   ```bash
   npm run dev
   ```
   (Runs on `http://localhost:5173` or similar, check terminal output)

3. **Combined (Concurrent)**:
   ```bash
   npm run dev
   ```
   *Note: I have configured `npm run dev` to start both via `concurrently`.*

## Project Structure
- `server/`: Backend Express server.
- `databases/`: JSON file storage.
- `src/`: React frontend code.

## Troubleshooting
- **Port Conflict**: If port 3001 (Backend) or 5173 (Frontend) is busy, check for running processes.
- **Clean Reinstall**:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
