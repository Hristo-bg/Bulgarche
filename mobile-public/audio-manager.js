// Audio Manager for Bulgarche app
class AudioManager {
    constructor() {
        this.audioCache = new Map();
        this.audioMap = null;
        this.audioContext = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('Audio manager initialized');
        } catch (error) {
            console.error('Failed to initialize audio manager:', error);
        }
    }

    // Find audio file for a word
    // Uses audio-map.json (APK) when present, else direct Cyrillic filename (PC)
    findAudioFile(word) {
        if (!word || typeof word !== 'string') return null;
        
        const base = word.toLowerCase()
            .replace(/[^\w\s\u0430-\u044f]/g, '')
            .trim();
        if (!base) return null;

        const variations = [
            base,
            base.replace(/\s+/g, ''),
            base.replace(/-/g, ''),
        ];

        // Check audio map first (APK build uses ASCII filenames)
        if (this.audioMap) {
            for (const v of variations) {
                const mapped = this.audioMap[v];
                if (mapped) return this.assetUrl('audiofiles/' + mapped);
            }
        }

        // Direct filename (PC/local)
        for (const v of variations) {
            if (this.audioCache.has(v)) {
                return this.assetUrl(`audiofiles/${encodeURIComponent(v)}.wav`);
            }
        }
        return this.assetUrl(`audiofiles/${encodeURIComponent(variations[0])}.wav`);
    }

    // Load audio-map.json (used by APK build with ASCII filenames)
    async loadAudioMap() {
        try {
            const r = await fetch(this.assetUrl('audiofiles/audio-map.json'));
            if (r.ok) {
                this.audioMap = await r.json();
                const keys = Object.keys(this.audioMap);
                keys.forEach(k => this.audioCache.set(k.toLowerCase(), true));
            }
        } catch (e) { /* no map = use direct filenames */ }
    }

    async preloadAudioFiles() {
        try {
            await this.loadAudioMap();
            console.log('Preloading audio files...');
            
            // Load wordsbg.txt file to get all available audio words
            const response = await fetch(this.assetUrl('txt/wordsbg.txt'));
            if (response.ok) {
                const text = await response.text();
                const words = text.split('\n')
                    .map(line => line.trim())
                    .filter(word => word.length > 0);
                
                console.log(`Found ${words.length} words with audio files`);
                console.log('Sample audio words:', words.slice(0, 10));
                
                // Add all words to the audio cache with proper normalization
                words.forEach(word => {
                    if (word && word.trim()) {
                        const cleanWord = word.trim().toLowerCase();
                        this.audioCache.set(cleanWord, true);
                        
                        // Also add variations for better matching
                        const noSpaces = cleanWord.replace(/\s+/g, '');
                        const noHyphens = cleanWord.replace(/-/g, '');
                        
                        if (noSpaces !== cleanWord) {
                            this.audioCache.set(noSpaces, true);
                        }
                        if (noHyphens !== cleanWord) {
                            this.audioCache.set(noHyphens, true);
                        }
                    }
                });
                
                console.log('Audio cache populated with available words and variations');
            } else {
                console.log('Could not load wordsbg.txt, using fallback');
                await this.preloadCommonWords();
            }
            
        } catch (error) {
            console.error('Error preloading audio files:', error);
            await this.preloadCommonWords();
        }
    }

    async preloadCommonWords() {
        // Common Bulgarian words that likely have audio
        const commonWords = [
            'здравей', 'благодаря', 'добре', 'да', 'не', 'моля', 'извинете',
            'дом', 'вода', 'хляб', 'мляко', 'час', 'ден', 'нощ', 'утро',
            'аз', 'ти', 'той', 'тя', 'ние', 'вие', 'те', 'съм', 'си', 'е', 'сме', 'сте', 'са',
            'човек', 'жена', 'мъж', 'дете', 'майка', 'баща', 'брат', 'сестра',
            'голям', 'малък', 'добър', 'лош', 'нов', 'стар', 'красив', 'син', 'червен',
            'яде', 'пие', 'спи', 'работя', 'уча', 'играя', 'говоря', 'виждам', 'чувам',
            'къща', 'стая', 'кухня', 'градина', 'улица', 'магазин', 'училище', 'болница'
        ];
        
        for (const word of commonWords) {
            this.audioCache.set(word, true); // Mark as available
        }
    }

    // Play audio for a word
    async playAudio(word) {
        try {
            const audioFile = this.findAudioFile(word);
            if (!audioFile) {
                console.log(`No audio file found for: ${word}`);
                return false;
            }

            // Create audio with proper encoding
            const audio = new Audio();
            audio.src = audioFile;

            return new Promise((resolve) => {
                audio.addEventListener('ended', () => resolve(true));
                audio.addEventListener('error', (error) => {
                    console.error('Audio playback error:', error);
                    resolve(false);
                });

                audio.play().catch(error => {
                    console.error('Audio play error:', error);
                    resolve(false);
                });
            });
        } catch (error) {
            console.error(`Error playing audio for ${word}:`, error);
            return false;
        }
    }

    // Stop all audio
    stopAllAudio() {
        // This would require tracking active audio elements
        // For now, we'll just log it
        console.log('Stopping all audio playback');
    }

    // Check if audio is available for a word
    // In browser/PC mode we optimistically assume audio exists for dictionary words
    // and let playback fail gracefully if the file is really missing.
    hasAudio(word) {
        return !!this.findAudioFile(word);
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.audioManager.init();
    window.audioManager.preloadAudioFiles();
});

// Shared asset URL resolver (http(s) + file://)
AudioManager.prototype.assetUrl = function(relativePath) {
    const clean = String(relativePath || '').replace(/^\/+/, '');
    return new URL(clean, window.location.href).toString();
};

// Enhanced audio button creator
window.createAudioButton = function(word, options = {}) {
    const button = document.createElement('button');
    button.className = 'audio-btn';
    button.innerHTML = '🔊';
    button.title = `Play audio for: ${word}`;

    // Check if audio is available
    if (window.audioManager.hasAudio(word)) {
        button.addEventListener('click', async () => {
            button.disabled = true;
            button.innerHTML = '🔇';

            const success = await window.audioManager.playAudio(word);

            // Re-enable button as soon as playback promise resolves
            button.disabled = false;
            button.innerHTML = success ? '🔊' : '❌';
        });
    } else {
        button.disabled = true;
        button.innerHTML = '🔇';
        button.title = `No audio available for: ${word}`;
        button.style.opacity = '0.5';
    }

    return button;
};
