import fs from 'fs';
import http from 'http';
import https from 'https';

export default function downloadFile(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        // Determine whether to use http or https based on the URL
        const client = url.startsWith('https://') ? https : http;
        
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(filepath, () => {}); // Delete partial file
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
        
        file.on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
    });
}