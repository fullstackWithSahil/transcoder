import express from "express";

const app = express();

app.get("/",(req,res)=>{
    res.send("Downloader Service is up and running!");
});

app.listen(3000, () => {
  console.log("Downloader service is running on port 3000");
})