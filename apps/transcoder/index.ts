import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

async function sleep(){
    return new Promise((res,rej)=>{
        setTimeout(()=>{
            res("sleep over")
        },1000)
    })
}

const worker = new Worker('transcoder',async(job)=>{
        await sleep();
        console.log(job.data);
    },
    { 
        connection,
        concurrency: 1  // Process only 1 job at a time
    },
);