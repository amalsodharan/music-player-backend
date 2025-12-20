import axios from 'axios';
import dotenv from 'dotenv';
import initDb from '../db.js';
import { QueryTypes } from 'sequelize';

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
            limit: 200,
            audioformat: 'mp32',
            order: 'popularity_total',
            include: 'musicinfo'
        };
    }else {
        params = {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            limit: 200,
            audioformat: 'mp32',
            order: 'popularity_total',
            include: 'musicinfo'
        };
    }
    console.log(params);

    try {
        const response = await axios.get(url, { params });
        const results = response.data.results;

        const formatted = results.map((track, index) => ({
            index: index + 1,
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

const jamendoArtistsController = async (req, res) => {
    const url = 'https://api.jamendo.com/v3.0/artists';
    const params = {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        order: 'popularity_month',
        limit: 50,
        imagesize: 500
    };

    try {
        const response = await axios.get(url, { params });
        const results = response.data.results;

        const formatted = results.filter(artist => artist.image && artist.image.trim() !== '').map(artist => ({
            id: artist.id,
            name: artist.name,
            image: artist.image,
            joindate: artist.joindate,
            shareurl: artist.shareurl
        }));
        console.log(formatted);

        res.json(formatted);
    } catch (error) {
        console.error('Jamendo API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch artists from Jamendo' });
    }
};

const storeJamedoController = async (req, res) => {
    const { Music } = await initDb();

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
            limit: 200,
            audioformat: 'mp32',
            order: 'popularity_total',
            include: 'musicinfo'
        };
    }else {
        params = {
            client_id: JAMENDO_CLIENT_ID,
            format: 'json',
            limit: 200,
            audioformat: 'mp32',
            order: 'artist_name',
            include: 'musicinfo'
        };
    }
    console.log(params);

    try {
        const response = await axios.get(url, { params });
        const results = response.data.results;

        const formatted = results.map((track, index) => ({
            index: index + 1,
            music_id: track.id,
            name: track.name,
            artist: track.artist_name,
            album: track.album_name,
            audio: track.audio,
            duration: track.duration,
            image: track.album_image,
            is_deleted: false
        }));

        formatted.forEach(async element => {
            const musicFetch = await Music.findOne({ where: { music_id : element.music_id } });
            if(!musicFetch){
                const musicCreate = await Music.create(element);
                if(musicCreate) console.log(`${element.music_id} created`);
            }else{
                console.log(`${element.music_id} already exists`);
            }
        });

        res.json(formatted);
    } catch (error) {
        console.error('Jamendo API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch tracks from Jamendo' });
    }
};

const getLocalMusic = async (req, res) => {
    try {
        const { Music, Op } = await initDb();
        let limit = parseInt(req.query.lt) || 50;
        const search = req.query.search || '';
        let whereClause;
        if(search){
            limit = 10;
            whereClause = {
                is_deleted: false,
                name: {
                    [Op.like] : `%${search}%`
                }
            }
        }else{
            whereClause = { is_deleted: false };
        }
        const fetchMusic = await Music.findAll({ where: whereClause, limit: limit });

        if(fetchMusic.length === 0) res.message({ status: 'Success', message: 'No Record found' });

        res.status(200).json({
            status: 'Success', 
            message: `Total ${fetchMusic.length} records fetched`, 
            data: fetchMusic 
        });
    } catch (error) {
        console.error('Error fetching local music', error.message);
        res.status(500).json({ error: 'Failed to fetch local data' });
    }
};

const getArtistData = async (req, res) => {
    try {
        const { Music, Op } = await initDb();
        const search = req.query.search || "";

        const whereCondition = search ? { artist: { [Op.like]: `%${search}%` } } : {};

        const tracks = await Music.findAll({
            where: whereCondition,
            order: [["artist", "DESC"]],
            raw: true
        });

        if (!tracks.length) {
            return res.json({ status: "Failed", message: "No artists found" });
        }

        const artistMap = {};

        for (const track of tracks) {
            if (!artistMap[track.artist]) {
                artistMap[track.artist] = {
                    artist: track.artist,
                    count: 0,
                    tracks: []
                };
            }
            artistMap[track.artist].count++;
            artistMap[track.artist].tracks.push(track);
        }

        const result = Object.values(artistMap).filter(a => a.count > 1);

        return res.status(200).json({
            status: "Success",
            data: result
        });
    } catch (error) {
        console.error('Temp script error:', error.message);
        res.status(500).json({ status: 'Failed', message: 'Temp script failed' });
    }
}

export default { musicController, jamendoSearchController, jamendoArtistsController, storeJamedoController, getLocalMusic, getArtistData };