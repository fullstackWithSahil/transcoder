// import path from "path";
// import fs from "fs";
// import { promises as fsPromises } from "fs";
// import FormData from "form-data";
// import axios from "axios";

// export default async function uploader(key: string) {
//   try {
//     let filesToUpload: { path: string; key: string }[] = [];
//     const resolutions = ["1080", "720", "360", "144"];
    
//     for (const res of resolutions) {
//       const folderPath = path.join("output", res);
      
//       if (!fs.existsSync(folderPath)) {
//         console.log(`Folder not found: ${folderPath}`);
//         continue;
//       }
      
//       const files = fs.readdirSync(folderPath);
//       for (const file of files) {
//         const finalkey = `${key}/${res}/${file}`;
//         const localFilePath = path.join(folderPath, file);
//         filesToUpload.push({ path: localFilePath, key: finalkey });
//       }
//     }
    
//     console.log(`Uploading ${filesToUpload.length} files...`);
    
//     // Upload in batches
//     const BATCH_SIZE = 5; // Adjust based on your server capacity
//     const results = [];
    
//     for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
//       const batch = filesToUpload.slice(i, i + BATCH_SIZE);
//       console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filesToUpload.length / BATCH_SIZE)}`);
      
//       const batchPromises = batch.map(async (file) => {
//         const formdata = new FormData();
//         formdata.append("file", fs.createReadStream(file.path));
//         formdata.append("key", file.key);
        
//         try {
//           const { data } = await axios.post("http://localhost:3001/file", formdata);
          
//           await fsPromises.unlink(file.path);
//           console.log(`✓ Uploaded: ${file.key}`);
//           return { success: true, file: file.key, data };
//         } catch (error) {
//           console.log(`✗ Error uploading file: ${file.path}`);
//           console.log("Error>>", error instanceof Error ? error.message : error);
//           return { success: false, file: file.key, error };
//         }
//       });
      
//       const batchResults = await Promise.all(batchPromises);
//       results.push(...batchResults);
//     }
    
//     const successful = results.filter(r => r.success).length;
//     const failed = results.filter(r => !r.success).length;
    
//     console.log(`\nUpload complete: ${successful} successful, ${failed} failed`);
    
//     if (failed > 0) {
//       console.log("\nFailed files:");
//       results.filter(r => !r.success).forEach(r => console.log(`- ${r.file}`));
//     }
    
//   } catch (error) {
//     console.log("There was an error uploading files:", error);
//   }
// }

// uploader("tanay")

import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";


export default async function uploader(key: string) {
    try {
        const resolutions = ["1080", "720", "360", "144"];
        resolutions.forEach((res)=>{
            const folderPath = path.join(__dirname,`output/${res}`)
            const files = fs.readdirSync(folderPath);
            files.forEach((file)=>{
                const filePath = path.join(folderPath,file);
                const formdata = new FormData()
                formdata.append("key",`${key}/${res}/${file}`);
                formdata.append("file", fs.createReadStream(filePath));
                axios.post("http://localhost:3001/file", formdata).then(({data})=>{
                    fs.unlink(filePath,()=>{
                        console.log("deleted>>",file)
                    })
                }).catch((err)=>{
                    console.log("erroro>>",err)
                })
            })
        })
    } catch (error) {
        console.log(error)
    }
}
uploader("tanay")