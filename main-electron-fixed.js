const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

let mainWindow;
let server;

// Disable menu bar
app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
});

async function findAvailablePort(startPort) {
    const net = require('net');
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => resolve(findAvailablePort(startPort + 1)));
    });
}

async function startDesktopServer() {
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
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
        '.txt': 'text/plain; charset=utf-8'
    };

    const availablePort = await findAvailablePort(3002);
    
    // Determine base directory based on whether app is packaged
    const baseDir = app.isPackaged 
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public')
        : path.join(__dirname, 'public');

    server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        let pathname = parsedUrl.pathname;
        
        // Handle root request
        if (pathname === '/') {
            pathname = '/index.html';
        }
        
        // Determine file path
        let filePath;
        if (pathname.startsWith('/txt/') || pathname.startsWith('/audiofiles/') || pathname.startsWith('/icon/')) {
            // These folders are in the root or resources
            const resourceDir = app.isPackaged 
                ? path.join(process.resourcesPath, 'app.asar.unpacked')
                : __dirname;
            filePath = path.join(resourceDir, pathname);
        } else {
            // Everything else is in public
            filePath = path.join(baseDir, pathname);
        }
        
        console.log(`[SERVER] Request: ${req.url} -> ${filePath}`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`[SERVER] File not found: ${filePath}`);
            // Try to serve index.html for SPA routing
            const indexPath = path.join(baseDir, 'index.html');
            if (fs.existsSync(indexPath)) {
                filePath = indexPath;
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
                return;
            }
        }
        
        const ext = String(path.extname(filePath)).toLowerCase();
        const mime = mimeTypes[ext] || 'application/octet-stream';
        const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg)$/i.test(ext);
        
        fs.readFile(filePath, shouldReadAsText ? 'utf-8' : undefined, (err, content) => {
            if (err) {
                console.log(`[SERVER] Error reading file: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>500 - Server Error</h1>', 'utf-8');
                return;
            }
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content);
        });
    });
    
    return new Promise((resolve) => {
        server.listen(availablePort, () => {
            console.log(`[SERVER] Started on port ${availablePort}`);
            resolve(availablePort);
        });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false // Allow loading local resources
        },
        title: 'Bulgarche - Learn Bulgarian',
        show: false,
        icon: app.isPackaged 
            ? path.join(process.resourcesPath, 'app.asar.unpacked', 'icon', 'bulgarche-icon.png')
            : path.join(__dirname, 'icon', 'bulgarche-icon.png'),
        webSecurity: false
    });

    // Enable DevTools for debugging
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
        mainWindow.setMenuBarVisibility(false);
        mainWindow.setTitle('Bulgarche - Learn Bulgarian / Научи Български');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    try {
        const port = await startDesktopServer();
        
        // Load the app from the local server
        mainWindow.loadURL(`http://localhost:${port}`);
        
        createWindow();
        
        console.log('[APP] Desktop app started successfully');
    } catch (error) {
        console.error('[APP] Failed to start:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // Close server when app quits
        if (server) {
            server.close();
        }
        app.quit();
    }
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});
