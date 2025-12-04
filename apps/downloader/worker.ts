import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs';
import path from 'path';
import https from 'https';

const connection = new IORedis({ maxRetriesPerRequest: null });
const myQueue = new Queue('transcoder', { connection }); // Add connection here

export default function startWorker(){
    const worker = new Worker('videos', async(job) => {
        const { key } = job.data;
        const link = `https://bucket.buisnesstools.in/${key}`;
        
        // Create downloads directory if it doesn't exist
        const downloadsDir = path.join(process.cwd(), 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }
        
        // Preserve original file extension from the key
        const originalExtension = path.extname(key) || '.mp4';
        const filename = `${String(Date.now())}${originalExtension}`;
        const filepath = path.join(downloadsDir, filename);
        
        // Download the file
        await downloadFile(link, filepath);
        
        // Store mapping in Redis using the same connection
        await connection.set(key, filename);
        
        // Add to transcoder queue
        await myQueue.add("transcoder", { key, filename });
        
        console.log(`Downloaded: ${filename}`);
        
        return { success: true, filepath };
    },
    { 
        connection,
        concurrency: 1
    });
    
    return worker;
}

function downloadFile(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
        
        file.on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
    });
}
//user_30SOmzLmWXd48N6vM3KE5X0S5GS/sharavan/thumbnail.webp
//user_30SOmzLmWXd48N6vM3KE5X0S5GS/tanay/thumbnail-1763036652757.webp
//user_35rllTQIbiUQ2UOTsjjgCCVpgL2/sahil/thumbnail-1764223477449.webp