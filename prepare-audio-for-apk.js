/**
 * Prepares audio files for APK build - renames Cyrillic filenames to ASCII
 * to avoid Gradle/Windows path issues. Creates audio-map.json for the app.
 */
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'audiofiles');
const outDir = path.join(__dirname, 'mobile', 'www', 'audiofiles');
const mapPath = path.join(outDir, 'audio-map.json');

if (!fs.existsSync(audioDir)) {
    console.log('No audiofiles folder, skipping.');
    process.exit(0);
}

const map = {};
let i = 1;

function safeName(n) {
    return String(n).padStart(4, '0') + '.wav';
}

const files = fs.readdirSync(audioDir);
for (const f of files) {
    if (!f.endsWith('.wav')) continue;
    const base = f.slice(0, -4);
    const key = base.toLowerCase().trim();
    const safe = safeName(i++);
    map[key] = safe;
}

fs.mkdirSync(outDir, { recursive: true });
for (const [orig, safe] of Object.entries(map)) {
    const src = path.join(audioDir, orig + '.wav');
    const dst = path.join(outDir, safe);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
    }
}
fs.writeFileSync(mapPath, JSON.stringify(map, null, 0), 'utf8');
console.log('Prepared', Object.keys(map).length, 'audio files with ASCII names.');
