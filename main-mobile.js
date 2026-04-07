const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let serverPort;

// Disable menu bar
Menu.setApplicationMenu(null);

// Function to find available port
function findAvailablePort(startPort) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => {
                resolve(port);
            });
        });
        
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// Simple server for Mobile Electron
async function startMobileServer() {
    const availablePort = await findAvailablePort(4000);
    serverPort = availablePort;
    
    const server = http.createServer((req, res) => {
        const decodedUrl = decodeURIComponent(req.url || '/');
        const urlPath = decodedUrl.split(/[?#]/)[0].replace(/^\/+/, '');
        
        let filePath;
        
        if (!urlPath || urlPath === '') {
            filePath = path.join(__dirname, 'mobile-public', 'index.html');
        } else if (urlPath.startsWith('txt/')) {
            filePath = path.join(__dirname, urlPath);
        } else if (urlPath.startsWith('audiofiles/')) {
            filePath = path.join(__dirname, urlPath);
        } else if (urlPath.startsWith('icon/')) {
            filePath = path.join(__dirname, urlPath);
        } else {
            filePath = path.join(__dirname, 'mobile-public', urlPath);
        }
        
        if (!fs.existsSync(filePath)) {
            console.log(`[MOBILE-SERVER] File NOT found: ${filePath} -> falling back to index.html`);
            filePath = path.join(__dirname, 'mobile-public', 'index.html');
        } else {
            console.log(`[MOBILE-SERVER] Serving file: ${filePath}`);
        }
        
        const extname = String(path.extname(filePath)).toLowerCase();
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
        
        const mimeType = mimeTypes[extname] || 'application/octet-stream';
        const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg)$/i.test(extname);
        
        fs.readFile(filePath, shouldReadAsText ? 'utf-8' : undefined, (error, content) => {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(content);
            }
        });
    });
    
    return new Promise((resolve) => {
        server.listen(availablePort, () => {
            console.log(`Mobile server running on port ${availablePort}`);
            resolve();
        });
    });
}

function createMobileWindow() {
    // Phone dimensions (typical smartphone)
    const phoneWidth = 375;
    const phoneHeight = 812;
    
    mainWindow = new BrowserWindow({
        width: phoneWidth,
        height: phoneHeight,
        minWidth: 320,
        minHeight: 568,
        maxWidth: 450,
        maxHeight: 1000,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        },
        icon: path.join(__dirname, 'icon', 'bulgarche-icon.png'),
        title: 'Bulgarche Mobile',
        show: false,
        autoHideMenuBar: true,
        resizable: true,
        frame: true,
        backgroundColor: '#ffffff'
    });

    // Load the mobile app after server starts
    setTimeout(() => {
        mainWindow.loadURL(`http://localhost:${serverPort}`);
        mainWindow.show();
        
        // Remove menu bar completely
        mainWindow.setMenuBarVisibility(false);
        
        // Center window on screen
        mainWindow.center();
    }, 1000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await startMobileServer();
    createMobileWindow();

    // Clear cache to ensure changes appear
    if (mainWindow) {
        mainWindow.webContents.session.clearCache().then(() => {
            console.log('Cache cleared successfully');
        });
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMobileWindow();
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
