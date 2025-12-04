import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import downloadFile from './downloadFile';
import path from "path";
import Transcode from './transcoder';
import uploader from './uploder';
import deleteSourceFiles from './deleteSourceFiles';

const connection = new IORedis({ maxRetriesPerRequest: null });

const worker = new Worker('transcoder',async(job)=>
    {
        const {key,filename} = job.data;
        
        //download file
        const filepath = path.join("input",filename)
        await downloadFile(`http://localhost:3000/${filename}`,filepath)

        //transcode videos
        await Transcode("1080",filepath)
        await Transcode("720",filepath)
        await Transcode("360",filepath)
        await Transcode("144",filepath)

        //upload and delete files
        await uploader(key);
        await deleteSourceFiles(filename);
    },
    { 
        connection,
        concurrency: 1  // Process only 1 job at a time
    },
);