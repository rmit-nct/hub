const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const arg = process.argv[2];

if (!arg) {
  console.error(
    'No command provided. Usage: node script.js <init|install|dev|start|run|serve|deploy>'
  );
  process.exit(1);
}

const projectRoot = path.resolve(__dirname);
process.chdir(projectRoot);

const isWin = process.platform === 'win32';
const venvPath = path.join(projectRoot, '.conda');
const venvBin = path.join(venvPath, isWin ? 'Scripts' : 'bin');

const commands = {
  init: `conda create -p "${venvPath}" python=3.12.12 -y`,
  install: `${path.join(venvBin, 'pip')} install -r requirements.txt`,
  dev: `${path.join(venvBin, 'uvicorn')} main:app --host 127.0.0.1 --port 5500 --reload`,
  start: `${path.join(venvBin, 'uvicorn')} main:app --host 127.0.0.1 --port 5500`,
  run: `${path.join(venvBin, 'modal')} run modal_deployment.py`,
  serve: `${path.join(venvBin, 'modal')} serve modal_deployment.py`,
  deploy: `${path.join(venvBin, 'modal')} deploy modal_deployment.py`,
};

// Check if venv exists (except for init command)
if (arg !== 'init' && !fs.existsSync(venvPath)) {
  console.error('Virtual environment not found. Creating it now...');
  try {
    execSync(commands.init, { stdio: 'inherit' });
    console.log('Virtual environment created successfully.');
  } catch (e) {
    console.error('Failed to create virtual environment:', e);
    process.exit(1);
  }
}

const cmd = commands[arg];

if (!cmd) {
  console.error(`Unknown command: ${arg}`);
  process.exit(1);
}

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
