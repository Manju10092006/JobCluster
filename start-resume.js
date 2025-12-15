const { spawn } = require('child_process');
const path = require('path');

// Use absolute path to handle spaces correctly
const resumeBackendPath = path.resolve(__dirname, 'APP (2)', 'backend');
console.log('Starting RESUME server from:', resumeBackendPath);

const npm = spawn('npm', ['run', 'dev'], {
  cwd: resumeBackendPath,
  stdio: 'inherit',
  shell: true
});

npm.on('error', (err) => {
  console.error('Failed to start resume server:', err);
  process.exit(1);
});

npm.on('exit', (code) => {
  process.exit(code);
});

