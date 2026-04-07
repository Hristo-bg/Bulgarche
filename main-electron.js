const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let serverPort;

// Disable menu bar
Menu.setApplicationMenu(null);

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
    const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg)$/i;

    const availablePort = await findAvailablePort(3002);
    serverPort = availablePort;

    const baseDir = app.isPackaged ? path.join(process.resourcesPath, 'app.asar', 'public') : path.join(__dirname, 'public');

    const server = http.createServer((req, res) => {
        const decodedUrl = decodeURIComponent(req.url || '/');
        const urlPath = decodedUrl.split(/[?#]/)[0].replace(/^\/+/, '');
        let filePath;
        if (!urlPath) {
            filePath = path.join(baseDir, 'index.html');
        } else if (urlPath.startsWith('txt/') || urlPath.startsWith('audiofiles/') || urlPath.startsWith('icon/')) {
            filePath = path.join(__dirname, urlPath);
        } else {
            filePath = path.join(baseDir, urlPath);
        }
        if (!fs.existsSync(filePath)) {
            console.log(`[SERVER] File NOT found: ${filePath} -> falling back to index.html`);
            filePath = path.join(baseDir, 'index.html');
        } else {
            console.log(`[SERVER] Serving file: ${filePath}`);
        }
        const ext = String(path.extname(filePath)).toLowerCase();
        const mime = mimeTypes[ext] || 'application/octet-stream';
        fs.readFile(filePath, shouldReadAsText.test(ext) ? 'utf-8' : undefined, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404</h1>', 'utf-8');
                return;
            }
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content);
        });
    });
    return new Promise((resolve) => server.listen(availablePort, resolve));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        title: 'Bulgarche - Learn Bulgarian',
        show: false,
        autoHideMenuBar: true
    });

    // Load the app via local HTTP server to avoid file:// SW and CSP issues
    mainWindow.loadURL(`http://localhost:${serverPort}`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Remove menu bar completely
        mainWindow.setMenuBarVisibility(false);
        // DevTools can be enabled for debugging while developing
        // mainWindow.webContents.openDevTools({ mode: 'detach' });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await startDesktopServer();
    createWindow();
    
    // Clear cache to ensure changes appear
    if (mainWindow) {
        mainWindow.webContents.session.clearCache().then(() => {
            console.log('Cache cleared successfully');
        });
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});
