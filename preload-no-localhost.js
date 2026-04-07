const { contextBridge, shell } = require('electron');

// Override all browser behaviors
window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload: Blocking localhost and browser behavior');
    
    // Override window.open
    window.open = function(url, target, features) {
        console.log('Blocked window.open:', url);
        shell.openExternal(url);
        return null;
    };
    
    // Override location.href
    Object.defineProperty(window.location, 'href', {
        get: function() {
            return window.location.toString();
        },
        set: function(value) {
            console.log('Blocked location.href change:', value);
            if (value.startsWith('file://')) {
                window.location.replace(value);
            } else if (value.includes('localhost') || value.includes('127.0.0.1')) {
                console.log('BLOCKED localhost redirect!');
                return; // Block localhost
            } else {
                shell.openExternal(value);
            }
        }
    });
    
    // Override fetch to prevent localhost requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            console.log('BLOCKED localhost fetch:', url);
            return Promise.reject(new Error('localhost blocked'));
        }
        return originalFetch.call(this, url, options);
    };
    
    // Block any localhost redirects
    window.addEventListener('beforeunload', (e) => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
            e.preventDefault();
            e.returnValue = '';
            console.log('BLOCKED localhost redirect!');
        }
    });
});

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url) => {
        shell.openExternal(url);
    }
});
