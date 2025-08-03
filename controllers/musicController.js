import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

const musicController = async (req, res) => {
    const input = req.body;
    const artist = input.name;
    if(!artist) throw new Error("Artist name is required");
    const url = 'https://ws.audioscrobbler.com/2.0/';
    const params = {
        method: 'artist.search',
        artist,
        api_key: LASTFM_API_KEY,
        format: 'json'
    };

    try {
        const response = await axios.get(url, { params });
        const results = response.data.results.artistmatches.artist;
        res.json(results);
    } catch (error) {
        console.error('Error fetching artist:', error.message);
        res.status(500).json({ error: 'Failed to fetch artist data' });
    }
}

const jamendoSearchController = async (req, res) => {
    const input = req.body;
    console.log(input);
    let artist, params;
    if(input){
        artist = input.name;
    }
    const url = 'https://api.jamendo.com/v3.0/tracks';
    if (artist) {
        params = {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            name: artist,
            limit: 5,
            audioformat: 'mp32',
            order: 'popularity_total',
            include: 'musicinfo'
        };
    }else {
        params = {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            limit: 5,
            audioformat: 'mp32',
            order: 'popularity_total',
            include: 'musicinfo'
        };
    }
    console.log(params);

    try {
        const response = await axios.get(url, { params });
        const results = response.data.results;

        const formatted = results.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artist_name,
            album: track.album_name,
            audio: track.audio,
            duration: track.duration,
            image: track.album_image
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Jamendo API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch tracks from Jamendo' });
    }
};


export default { musicController, jamendoSearchController };