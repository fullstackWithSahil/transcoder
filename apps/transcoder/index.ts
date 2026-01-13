import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import downloadFile from './downloadFile';
import path from "path";
import Transcode from './transcoder';
import uploader from './uploder';
import fs from 'fs';
import deleteSourceFiles from './deleteSourceFiles';

const connection = new IORedis({ maxRetriesPerRequest: null });
const outputDir = path.join(process.cwd(), 'output');
["1080","720","360","144"].forEach(resolution=>{
    const resDir = path.join(outputDir,resolution);
    if (!fs.existsSync(resDir)) {
        fs.mkdirSync(resDir, { recursive: true });
    }
});
const inputDir = path.join(process.cwd(), 'input');
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
}

const worker = new Worker('transcoder',async(job)=>
    {
        const {key,filename} = job.data;
        
        //download file
        const filepath = path.join(inputDir,filename)
        await downloadFile(`http://localhost:3000/${filename}`,filepath)

        //transcode videos
        await Transcode("1080",filename)
        await Transcode("720",filename)
        await Transcode("360",filename)
        await Transcode("144",filename)

        //upload and delete files
        await uploader(key);
        await deleteSourceFiles(filename);
    },
    { 
        connection,
        concurrency: 1  // Process only 1 job at a time
    },
);