const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  const decodedUrl = decodeURIComponent(req.url || '/');
  const urlPath = decodedUrl.split(/[?#]/)[0];

  if (method === 'GET' && (urlPath === '/icon-192.png' || urlPath === '/icon-512.png')) {
    const iconPath = path.join(__dirname, 'public', 'icon', 'bulgarche-icon.png');
    const content = fs.readFileSync(iconPath);
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(content);
    return;
  }

  if (method === 'POST' && urlPath === '/api/save') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const outPath = path.join(__dirname, 'saved-data.jsonl');
        fs.appendFileSync(outPath, `${JSON.stringify({ ts: Date.now(), ...data })}\n`, 'utf-8');
        sendJson(res, 200, { ok: true });
      } catch (e) {
        sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      }
    });
    return;
  }

  const cleanPath = urlPath.replace(/^\/+/, '');
  let filePath;

  if (!cleanPath) {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else if (cleanPath.startsWith('txt/')) {
    filePath = path.join(__dirname, cleanPath);
  } else if (cleanPath.startsWith('audiofiles/')) {
    filePath = path.join(__dirname, cleanPath);
  } else if (cleanPath.startsWith('icon/')) {
    filePath = path.join(__dirname, cleanPath);
  } else {
    filePath = path.join(__dirname, 'public', cleanPath);
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'public', 'index.html');
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';
  const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg)$/i.test(extname);

  fs.readFile(filePath, shouldReadAsText ? 'utf-8' : undefined, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at: http://localhost:${PORT}/`);
});
