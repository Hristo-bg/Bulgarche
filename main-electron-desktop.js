const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let server;

// Set app icon
const appIconPath = path.join(__dirname, 'icon', 'bulgarche-icon.ico');
console.log('App icon path:', appIconPath);
if (fs.existsSync(appIconPath)) {
    console.log('Icon file found, setting app icon...');
    if (app.dock) app.dock.setIcon(appIconPath);
} else {
    console.log('Icon file not found at:', appIconPath);
}

function createWindow() {
    let iconPath;
    if (app.isPackaged) {
        // Production: Load from packaged files
        iconPath = path.join(process.resourcesPath, 'icon', 'bulgarche-icon.ico');
        console.log('Creating packaged window with icon:', iconPath);
    } else {
        // Development: Load from local files
        iconPath = path.join(__dirname, 'icon', 'bulgarche-icon.ico');
        console.log('Creating development window with icon:', iconPath);
    }
    
    // Fallback if icon doesn't exist
    if (!fs.existsSync(iconPath)) {
        iconPath = path.join(__dirname, 'icon', 'bulgarche-icon.ico');
        console.log('Fallback icon path:', iconPath);
    }
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // Allow loading local files
            allowRunningInsecureContent: true,
            experimentalFeatures: true
        },
        title: 'Bulgarche - Learn Bulgarian',
        show: false,
        icon: iconPath,
        autoHideMenuBar: true,
        frame: true,
        resizable: true,
        maximizable: true,
        minimizable: true,
        alwaysOnTop: false,
        fullscreenable: true
    });

    // Remove menu bar completely
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);

    // Always load as desktop app (no server mode)
    let indexPath;
    if (app.isPackaged) {
        // Production: Load from packaged files
        indexPath = path.join(process.resourcesPath, 'public', 'index.html');
        console.log('Loading packaged desktop app from:', indexPath);
    } else {
        // Development: Load from local files
        indexPath = path.join(__dirname, 'public', 'index.html');
        console.log('Loading development desktop app from:', indexPath);
    }
    
    // Fallback to local path if packaged path doesn't exist
    if (!fs.existsSync(indexPath)) {
        indexPath = path.join(__dirname, 'public', 'index.html');
        console.log('Fallback to local path:', indexPath);
    }
    
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setTitle('Bulgarche - Learn Bulgarian / Научи Български');
        
        // Ensure window is properly focused and on top
        mainWindow.setAlwaysOnTop(true, 'floating');
        setTimeout(() => {
            mainWindow.setAlwaysOnTop(false);
            mainWindow.focus();
        }, 500);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (server) {
            server.close();
        }
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function startDevServer() {
    const http = require('http');
    const url = require('url');
    
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.txt': 'text/plain; charset=utf-8',
        '.ico': 'image/x-icon'
    };

    server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        let pathname = parsedUrl.pathname;
        
        // Handle root path
        if (pathname === '/') {
            pathname = '/index.html';
        }
        
        // Security: Prevent directory traversal
        pathname = pathname.replace(/\.\./g, '');
        
        let filePath;
        if (pathname.startsWith('/txt/') || pathname.startsWith('/audiofiles/') || pathname.startsWith('/icon/')) {
            filePath = path.join(__dirname, pathname);
        } else if (pathname.startsWith('/public/')) {
            filePath = path.join(__dirname, pathname);
        } else {
            filePath = path.join(__dirname, 'public', pathname);
        }
        
        // If file doesn't exist, serve index.html for SPA routing
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, 'public', 'index.html');
        }
        
        const ext = String(path.extname(filePath)).toLowerCase();
        const mime = mimeTypes[ext] || 'application/octet-stream';
        const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg|\.ico)$/i.test(ext);
        
        try {
            const content = fs.readFileSync(filePath, shouldReadAsText ? 'utf-8' : undefined);
            res.writeHead(200, { 
                'Content-Type': mime,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(content);
        } catch (err) {
            console.error('Error serving file:', err);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>500 - Internal Server Error</h1>', 'utf-8');
        }
    });

    // Find available port
    const net = require('net');
    const findPort = (startPort) => new Promise((resolve) => {
        const testServer = net.createServer();
        testServer.listen(startPort, () => {
            const port = testServer.address().port;
            testServer.close(() => resolve(port));
        });
        testServer.on('error', () => resolve(findPort(startPort + 1)));
    });

    findPort(3002).then(port => {
        server.listen(port, '127.0.0.1', () => {
            console.log(`Dev server started on http://localhost:${port}`);
            mainWindow.loadURL(`http://localhost:${port}`);
        });
    });
}

app.whenReady().then(() => {
    createWindow();

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

// Handle certificate errors for local files
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('file://') || url.startsWith('http://localhost')) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
    
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost' && !navigationUrl.startsWith('file://')) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
});

// Security: Prevent remote content loading in production
if (app.isPackaged) {
    app.on('web-contents-created', (event, contents) => {
        contents.on('will-navigate', (event, navigationUrl) => {
            if (!navigationUrl.startsWith('file://')) {
                event.preventDefault();
            }
        });
    });
}
