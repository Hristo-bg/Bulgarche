const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

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
            preload: isDev ? undefined : path.join(__dirname, 'preload.js')
        }
    });

    // Force desktop mode - remove all menus
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.removeMenu();

    // Prevent opening external links in the app window
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Load the local HTML file
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log('[Electron] Loading app from:', indexPath);
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setTitle('Bulgarche Desktop - Learn Bulgarian');
        console.log('[Electron] App window shown');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools only in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

// App is ready
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS, re-create window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS, applications stay active until explicitly quit
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Disable navigation to external sites
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        // Allow only loading the index.html
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });

    // Prevent opening new windows
    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});

