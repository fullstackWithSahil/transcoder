import express from "express";
import { Queue } from 'bullmq';
import startWorker from "./worker";
const myQueue = new Queue('videos');
import fs from "fs/promises";
import path from "path";

const app = express();

// Add this line to parse JSON request bodies
app.use(express.json());
app.use(express.static('downloads'))

app.get("/", (req, res) => {
    res.send("Downloader Service is up and running!");
});

app.post("/video", async (req, res) => {
    try {
        const { key } = req.body;
        await myQueue.add('keys',{key});
        res.json({ key });
    } catch (error) {
        console.log("There was an error adding the video to rabbitMq:", error);
        res.status(500).json({ error: "Failed to process video request" });
    }
});

app.delete("/delete/:filename",async(req,res)=>{
    const {filename} = req.params;
    try {
        const filepath = path.join(__dirname,`/downloads/${filename}`)
        await fs.unlink(filepath)
        res.send("file deleted successfully");
    } catch (error) {
        console.log(`There was an error deleting ${filename}`)
    }
})

app.listen(3000, () => {
    console.log("Downloader service is running on port 3000");
    startWorker();
});