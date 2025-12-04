import { Worker } from 'bullmq';
import { sleep } from 'bun';
import IORedis from 'ioredis';
const connection = new IORedis({ maxRetriesPerRequest: null });

export function startWorker(){
    const worker = new Worker('files', async(job) => {
        await sleep(1000)
        console.log(job.data);
    },{ 
        connection,
        concurrency: 1
    })
}