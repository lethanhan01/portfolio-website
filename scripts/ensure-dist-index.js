const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const distIndex = path.join(distDir, 'index.html');
const srcIndex = path.resolve(__dirname, '../src/index.html');

try {
    if (!fs.existsSync(distIndex)) {
        fs.mkdirSync(distDir, { recursive: true });
        if (fs.existsSync(srcIndex)) {
            fs.copyFileSync(srcIndex, distIndex);
            console.log('Created dist/index.html from src/index.html');
        } else {
            throw new Error('src/index.html not found');
        }
    } else {
        console.log('dist/index.html already exists');
    }
} catch (err) {
    console.error('ensure-dist-index failed:', err.message || err);
    process.exit(1);
}
