import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { watchDirs, projectRoot } from './watcher.js';

const PORT = 3000;
const ROOT = projectRoot();

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
};

/** Active SSE response objects waiting for reload events. */
const sseClients = new Set();

function notifyReload() {
  for (const res of sseClients) {
    try {
      res.write('data: reload\n\n');
    } catch {
      sseClients.delete(res);
    }
  }
}

async function serveFile(filePath, res) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // SSE endpoint for live reload.
  if (pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':\n\n'); // initial keep-alive comment
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Root → index.html
  if (pathname === '/' || pathname === '/index.html') {
    await serveFile(path.join(ROOT, 'public', 'index.html'), res);
    return;
  }

  // Serve src files for browser ESM imports.
  if (pathname.startsWith('/src/')) {
    await serveFile(path.join(ROOT, pathname), res);
    return;
  }

  // Fallback: try public/.
  await serveFile(path.join(ROOT, 'public', pathname), res);
});

server.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`matr-layout dev server running at ${url}`);

  // Auto-open browser (best-effort).
  const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
  const { exec } = await import('node:child_process');
  exec(`${openCmd} ${url}`);
});

// Watch src/ and public/ for changes.
watchDirs([path.join(ROOT, 'src'), path.join(ROOT, 'public')], () => {
  console.log('Change detected — reloading...');
  notifyReload();
});
