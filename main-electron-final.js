const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        title: 'Bulgarche - Learn Bulgarian',
        show: false,
        icon: path.join(__dirname, 'icon', 'bulgarche-icon.png')
    });

    // Enable DevTools for debugging
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    // Load based on environment
    if (app.isPackaged) {
        // Production: Load from local files
        const indexPath = path.join(__dirname, 'public', 'index.html');
        console.log('Loading production app from:', indexPath);
        mainWindow.loadFile(indexPath);
    } else {
        // Development: Load from local server
        const http = require('http');
        const fs = require('fs');
        const url = require('url');
        
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

        const server = http.createServer((req, res) => {
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

        const net = require('net');
        const findPort = (startPort) => new Promise((resolve) => {
            const server = net.createServer();
            server.listen(startPort, () => {
                const port = server.address().port;
                server.close(() => resolve(port));
            });
            server.on('error', () => resolve(findPort(startPort + 1)));
        });

        findPort(3002).then(port => {
            server.listen(port, () => {
                console.log(`Dev server started on port ${port}`);
                mainWindow.loadURL(`http://localhost:${port}`);
            });
        });
    }

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

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});
