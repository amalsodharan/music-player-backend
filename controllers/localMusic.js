import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const addMusic = async (req, res) => {
    const reqInput = ["name", "artist", "album", "duration"];
    const input = req.body;
    reqInput.forEach((element) => {
            if(input[element] === "" || input[element] === undefined){
                return res.status(401).json({message : `${element} is required`})
        }
    })
    console.log(reqInput)
    const folderPath = path.join(__dirname, 'cdn/assets');
     if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    const imageFile = req.files.find(file => file.fieldname === 'image');
    const audioFile = req.files.find(file => file.fieldname === 'audio');
    if(imageFile === undefined || imageFile === ""){
        return res.status(401).json({message : `Image is required`});
    }else{
        let filePath = path.join(folderPath, imageFile.originalname);
        fs.writeFileSync(filePath, file.buffer);
    }
    // if(audioFile === undefined || audioFile === ""){
    //     return res.status(401).json({message : `Audio file is required`});
    // }
    res.status(200).json({message : 'Data saved successfully'})
}

export default {addMusic};