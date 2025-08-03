import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addMusic = async (req, res) => {
    const reqInput = ["name", "artist", "album", "duration"];
    const input = req.body;
    reqInput.forEach((element) => {
            if(input[element] === "" || input[element] === undefined){
                return res.status(401).json({message : `${element} is required`})
        }
    })
    console.log(reqInput)
    const folderPath = path.join(__dirname, `../cdn/assets/${input.name}`);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    const imageFile = req.files.find(file => file.fieldname === 'image');
    const audioFile = req.files.find(file => file.fieldname === 'audio');
    if (!imageFile || !imageFile.buffer || !audioFile || !audioFile.buffer) {
        return res.status(401).json({message : `Desired files are missing`});
    }else{
        const imageExt = path.extname(imageFile.originalname);
        const audioExt = path.extname(audioFile.originalname);
        const imagePath = path.join(folderPath, `image${imageExt}`);
        fs.writeFileSync(imagePath, imageFile.buffer);
        const audioPath = path.join(folderPath, `audio${audioExt}`);
        fs.writeFileSync(audioPath, audioFile.buffer);
    }
    res.status(200).json({message : 'Data saved successfully'})
}

export default {addMusic};