const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Function to find available port
async function findAvailablePort(startPort) {
    const net = require('net');
    
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => {
                resolve(port);
            });
        });
        
        server.on('error', () => {
            // Port is in use, try next port
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// MIME types
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

// Start server with available port detection
async function startServer() {
    try {
        const availablePort = await findAvailablePort(PORT);
        
        const server = http.createServer((req, res) => {
            console.log(`${req.method} ${req.url}`);

            // Decode URL to handle Cyrillic characters
            const decodedUrl = decodeURIComponent(req.url || '/');

            // Extract clean path part (strip query/hash, leading slashes)
            const urlPath = decodedUrl.split(/[?#]/)[0].replace(/^\/+/, ''); // e.g. "txt/uroci.txt"

            let filePath;

            if (!urlPath || urlPath === '') {
                // Root → serve main app
                filePath = path.join(__dirname, 'public', 'index.html');
            } else if (urlPath.startsWith('txt/')) {
                // Text content (lessons, tests, words)
                filePath = path.join(__dirname, urlPath);
            } else if (urlPath.startsWith('audiofiles/')) {
                // Audio files
                filePath = path.join(__dirname, urlPath);
            } else if (urlPath.startsWith('icon/')) {
                // Icons
                filePath = path.join(__dirname, urlPath);
            } else {
                // Everything else served from public/
                filePath = path.join(__dirname, 'public', urlPath);
            }

            // If not found, fall back to index.html so SPA keeps working
            if (!fs.existsSync(filePath)) {
                filePath = path.join(__dirname, 'public', 'index.html');
            }


            // Get file extension
            const extname = String(path.extname(filePath)).toLowerCase();
            const mimeType = mimeTypes[extname] || 'application/octet-stream';

            // Read and serve file
            // For binary assets, do NOT force utf-8.
            const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg)$/i.test(extname);
            fs.readFile(filePath, shouldReadAsText ? 'utf-8' : undefined, (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        // File not found
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end('<h1>404 Not Found</h1><p>The requested file was not found.</p>', 'utf-8');
                    } else {
                        // Server error
                        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end('<h1>500 Server Error</h1><p>Sorry, there was a problem loading the application.</p>', 'utf-8');
                        console.error('Server error:', error);
                    }
                } else {
                    // Success
                    res.writeHead(200, { 'Content-Type': mimeType });
                    res.end(content);
                }
            });
        });

        server.listen(availablePort, () => {
            console.log(`\n🚀 BULGARCHE SERVER STARTED SUCCESSFULLY!`);
            console.log(`📍 Server running at: http://localhost:${availablePort}/`);
            console.log(`📁 Serving files from: ${__dirname}`);
            console.log(`🔧 Port: ${availablePort} (auto-detected available port)`);
            console.log(`⏹ Press Ctrl+C to stop server\n`);
          
            // Auto-open browser
            const { exec } = require('child_process');
            const url = `http://localhost:${availablePort}`;
          
            switch (process.platform) {
                case 'win32':
                    exec(`start ${url}`);
                    break;
                case 'darwin':
                    exec(`open ${url}`);
                    break;
                default:
                    exec(`xdg-open ${url}`);
            }
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`\n❌ Port ${availablePort} is already in use!`);
                console.log(`🔄 Trying to find available port...`);
            } else {
                console.error('\n❌ Server error:', error);
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
