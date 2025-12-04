import path from "path";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

export default async function uploader(key: string) {
  try {
    let filesToUpload: { path: string; key: string }[] = [];
    const resolutions = ["1080", "720", "360", "144"];
    
    for (const res of resolutions) {
      const folderPath = path.join("output", res);
      
      // Check if folder exists
      if (!fs.existsSync(folderPath)) {
        console.log(`Folder not found: ${folderPath}`);
        continue;
      }
      
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const finalkey = `${key}/${res}/${file}`;
        const localFilePath = path.join(folderPath, file);
        filesToUpload.push({ path: localFilePath, key: finalkey });
      }
    }
    
    console.log(`Uploading ${filesToUpload.length} files...`);
    
    const promises = filesToUpload.map((file) => {
      return new Promise((resolve, reject) => {
        const formdata = new FormData();
        formdata.append("file", fs.createReadStream(file.path));
        formdata.append("key", file.key);
        
        axios.post("http://localhost:3001/file", formdata, {
          headers: formdata.getHeaders() // Important: include form-data headers
        })
          .then(async({ data }) => {
            fs.unlink(file.path,()=>{
                console.log(`✓ Uploaded: ${file.key}`);
                resolve(data);
            })
          })
          .catch((error) => {
            console.log(`✗ Error uploading file: ${file.path}`);
            console.log("Error>>", error.message);
            reject(error);
          });
      });
    });
    
    await Promise.all(promises);
    console.log("All files uploaded successfully!");
  } catch (error) {
    console.log("There was an error uploading files:", error);
  }
}
uploader("sahil")