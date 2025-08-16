import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import musicControllers from './controllers/musicController.js';
import localMusic from './controllers/localMusic.js';
import path from 'path';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/cdn", express.static(path.join(process.cwd(), "cdn")));

const PORT = process.env.PORT;

const upload = multer();

app.get('/', (req, res) => {
    res.send("This is a Sample API");
});

app.get('/search/lastfm', musicControllers.musicController);
app.get('/search/jamendo', musicControllers.jamendoSearchController);
app.get('/artist/jamendo', musicControllers.jamendoArtistsController);

app.post('/api/add', upload.any(), localMusic.addMusic);

app.listen(PORT, (req, res) => {
    console.log(`Server is running on ${PORT}`);
});