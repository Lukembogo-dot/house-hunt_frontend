import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the direct Render URL to bypass Cloudflare SSL issues during build
const API_BASE = 'https://house-hunt-api-kemz.onrender.com';
const PUBLIC_DIR = path.join(__dirname, '../public');

async function downloadFile(endpoint, filename) {
    try {
        console.log(`📡 Fetching ${filename} from ${API_BASE}...`);
        const response = await axios.get(`${API_BASE}/${endpoint}`, {
            responseType: 'text',
            headers: {
                'User-Agent': 'HouseHuntBuilder/1.0'
            }
        });

        const filePath = path.join(PUBLIC_DIR, filename);
        fs.writeFileSync(filePath, response.data);
        console.log(`✅ Saved ${filename} to public directory.`);
    } catch (error) {
        console.error(`❌ Error fetching ${filename}:`, error.message);
        // We don't exit(1) because we don't want to break the build if the API is temporarily down,
        // but the sitemap will be missing/stale.
    }
}

async function main() {
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    await downloadFile('sitemap.xml', 'sitemap.xml');
    await downloadFile('robots.txt', 'robots.txt');
}

main();
