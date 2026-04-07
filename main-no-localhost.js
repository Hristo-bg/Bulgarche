const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, 'icon', 'bulgarche-icon.png'),
        title: 'Bulgarche Desktop',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload-no-localhost.js')
        }
    });

    // Remove all menus
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);

    // Block localhost and external URLs
    mainWindow.webContents.on('will-navigate', (event, url) => {
        console.log('Navigation attempt:', url);
        if (url.includes('localhost') || url.includes('127.0.0.1') || !url.startsWith('file://')) {
            console.log('Blocked navigation to:', url);
            event.preventDefault();
            return;
        }
    });

    // Block new windows
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        console.log('Blocked new window:', url);
        return { action: 'deny' };
    });

    // Force load local file - NO localhost
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log('Loading DESKTOP app from:', indexPath);
    console.log('NOT using localhost - forcing desktop mode!');
    
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setTitle('Bulgarche Desktop - Learn Bulgarian');
        console.log('Desktop window shown - NOT in browser!');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    console.log('Starting Bulgarche Desktop - NO LOCALHOST!');
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
