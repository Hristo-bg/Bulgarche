const { contextBridge, shell } = require('electron');

// Override window.open to prevent opening browser
contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url) => {
        shell.openExternal(url);
    }
});

// Prevent default browser behavior
window.addEventListener('DOMContentLoaded', () => {
    // Override window.open
    window.open = function(url, target, features) {
        shell.openExternal(url);
        return null;
    };
    
    // Override location changes
    Object.defineProperty(window.location, 'href', {
        get: function() {
            return window.location.toString();
        },
        set: function(value) {
            if (value.startsWith('file://')) {
                window.location.replace(value);
            } else {
                shell.openExternal(value);
            }
        }
    });
});
