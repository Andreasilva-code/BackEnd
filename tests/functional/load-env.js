#!/usr/bin/env node

// Cargar variables de .env.test
require('dotenv').config({ path: '.env.test' });

// Ejecutar Playwright
const { spawn } = require('child_process');

const playwright = spawn('npx', ['playwright', 'test', 'tests/functional'], {
    stdio: 'inherit',
    shell: true
});

playwright.on('exit', (code) => {
    process.exit(code);
});
