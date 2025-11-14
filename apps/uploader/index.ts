import express from "express";

const app = express();

app.get("/",(req,res)=>{
    res.send("uploader Service is up and running!");
});

app.listen(3001, () => {
  console.log("uploader service is running on port 3001");
})