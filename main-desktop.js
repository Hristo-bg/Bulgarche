const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

let mainWindow;
let server;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        },
        title: 'Bulgarche - Learn Bulgarian',
        show: false,
        icon: path.join(__dirname, 'icon', 'bulgarche-icon.png')
    });

    // Enable DevTools for debugging
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    // Load the app directly from local files
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log('Loading app from:', indexPath);
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
        Menu.setApplicationMenu(null);
        mainWindow.setMenuBarVisibility(false);
        mainWindow.setTitle('Bulgarche - Learn Bulgarian / Научи Български');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startServer() {
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
        '.txt': 'text/plain; charset=utf-8'
    };

    const net = require('net');
    const findPort = (startPort) => new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => resolve(findPort(startPort + 1)));
    });

    const port = findPort(3002);
    
    server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        let pathname = parsedUrl.pathname;
        
        if (pathname === '/') {
            pathname = '/index.html';
        }
        
        let filePath;
        if (pathname.startsWith('/txt/') || pathname.startsWith('/audiofiles/') || pathname.startsWith('/icon/')) {
            filePath = path.join(__dirname, pathname);
        } else {
            filePath = path.join(__dirname, 'public', pathname);
        }
        
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, 'public', 'index.html');
        }
        
        const ext = String(path.extname(filePath)).toLowerCase();
        const mime = mimeTypes[ext] || 'application/octet-stream';
        const shouldReadAsText = /^(?:\.html|\.js|\.css|\.json|\.txt|\.svg)$/i.test(ext);
        
        fs.readFile(filePath, shouldReadAsText ? 'utf-8' : undefined, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
                return;
            }
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content);
        });
    });
    
    server.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

app.whenReady().then(() => {
    createWindow();
    startServer();
});

app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
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
