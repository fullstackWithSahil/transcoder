import express from "express";

const app = express();

app.get("/",(req,res)=>{
    res.send("Transcoder Service is up and running!");
});

app.listen(3002, () => {
  console.log("Transcoderr service is running on port 3002");
})