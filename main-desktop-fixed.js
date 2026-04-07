const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, 'icon', 'bulgarche-icon.png'),
        title: 'Bulgarche - Learn Bulgarian',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Remove menu bar
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);

    // Load the app
    const indexPath = path.join(__dirname, 'public', 'index.html');
    mainWindow.loadFile(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
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
