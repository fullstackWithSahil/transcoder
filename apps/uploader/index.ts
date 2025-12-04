import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Queue } from 'bullmq';
import { startWorker } from "./worker";
const filesQueue = new Queue('files');

const app = express();

// Use memory storage first, then save manually
const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.send("uploader Service is up and running!");
});

app.post("/file", upload.single("file"), async (req, res) => {
  try {
    const key = req.body.key;
    
    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }
    
    // Create directory structure
    const dirPath = path.dirname(`uploads/${key}`);
    fs.mkdirSync(dirPath, { recursive: true });
    
    // Write file to disk
    fs.writeFileSync(`uploads/${key}`, req.file.buffer);
    filesQueue.add("file",{key});
    
    console.log("File stored at:", key);
    res.json({ 
      message: "File uploaded successfully",
      path: key 
    });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

app.listen(3001, () => {
    startWorker()
  console.log("uploader service is running on port 3001");
});