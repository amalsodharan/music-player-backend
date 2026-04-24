import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import musicControllers from './controllers/musicController.js';
import userControllers from './controllers/userController.js';
import localMusic from './controllers/localMusic.js';
import viTunesController from './controllers/viTunesController.js';
import saavnController from './controllers/saavnController.js';
import authenticateToken from './middleware/Auth.js';
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

//live api data
app.get('/search/lastfm', musicControllers.musicController);
app.get('/search/jamendo', musicControllers.jamendoSearchController);
app.get('/artist/jamendo', musicControllers.jamendoArtistsController);

//local db music data
app.post('/add/jamendo', authenticateToken, musicControllers.storeJamedoController);
app.get('/api/getMusic', authenticateToken, musicControllers.getLocalMusic);
app.get('/api/getArtist', authenticateToken, musicControllers.getArtistData);

//user controllers
app.post('/api/createUser', userControllers.createUser);
app.post('/api/login', userControllers.loginUser);
app.get('/api/me', authenticateToken, userControllers.getMe);
app.put('/api/updateUser', authenticateToken, userControllers.updateUser);
app.delete('/api/deleteUser', authenticateToken, userControllers.deleteUser);

//upload local music
app.post('/api/add', upload.any(), localMusic.addMusic);

//viTunes controllers — YouTube Music (Innertube) live API
app.get('/api/viTune/search', viTunesController.search);
app.get('/api/viTune/suggestions', viTunesController.getSuggestions);
app.get('/api/viTune/song/:id', viTunesController.getSong);
app.get('/api/viTune/artist/:id', viTunesController.getArtist);
app.get('/api/viTune/album/:id', viTunesController.getAlbum);
app.get('/api/viTune/playlist/:id', viTunesController.getPlaylist);
app.get('/api/viTune/lyrics/:id', viTunesController.getLyrics);
app.get('/api/viTune/streamUrl/:id', viTunesController.getStreamUrl);
app.get('/api/viTune/stream/:id', viTunesController.stream);

// JioSaavn Controllers — Robust alternative for live streaming
app.get('/api/saavn/search', saavnController.search);
app.get('/api/saavn/streamUrl/:id', saavnController.getStreamUrl);

app.listen(PORT, (req, res) => {
    console.log(`Server is running on ${PORT}`);
});