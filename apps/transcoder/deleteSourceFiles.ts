import path from "path";
import fs from "fs/promises";
import axios from "axios";

export default async function deleteSourceFiles(filename: string) {
	try {
		const filepath = path.join("input", filename);
		await fs.unlink(filepath);
		await axios.delete(`http://localhost:3000/delete/${filename}`);
	} catch (error) {
		console.log("There was an error deleting: ", filename);
		console.log(error);
	}
}
