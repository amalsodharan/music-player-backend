import YTMusic from 'ytmusic-api';
import youtubedl from 'youtube-dl-exec';

// Singleton – initialise once, reuse across requests
let ytmusic = null;

async function getClient() {
    if (!ytmusic) {
        ytmusic = new YTMusic();
        await ytmusic.initialize();
    }
    return ytmusic;
}

// ─── Search (songs, videos, albums, artists, playlists) ─────────────────────
const search = async (req, res) => {
    try {
        const { query, filter } = req.query;
        if (!query) {
            return res.status(400).json({ status: 'Failed', message: 'query parameter is required' });
        }

        const client = await getClient();
        let results;

        switch (filter) {
            case 'songs':
                results = await client.searchSongs(query);
                break;
            case 'videos':
                results = await client.searchVideos(query);
                break;
            case 'albums':
                results = await client.searchAlbums(query);
                break;
            case 'artists':
                results = await client.searchArtists(query);
                break;
            case 'playlists':
                results = await client.searchPlaylists(query);
                break;
            default:
                results = await client.search(query);
                break;
        }

        res.status(200).json({ status: 'Success', count: results.length, data: results });
    } catch (error) {
        console.error('ViTune search error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Search failed: ${error.message}` });
    }
};

// ─── Search Suggestions ──────────────────────────────────────────────────────
const getSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ status: 'Failed', message: 'query parameter is required' });
        }

        const client = await getClient();
        const suggestions = await client.getSearchSuggestions(query);

        res.status(200).json({ status: 'Success', data: suggestions });
    } catch (error) {
        console.error('ViTune suggestions error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Suggestions failed: ${error.message}` });
    }
};

// ─── Song / Track Details ────────────────────────────────────────────────────
const getSong = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Song/video id is required' });
        }

        const client = await getClient();
        const song = await client.getSong(id);

        res.status(200).json({ status: 'Success', data: song });
    } catch (error) {
        console.error('ViTune getSong error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to fetch song: ${error.message}` });
    }
};

// ─── Artist Details ──────────────────────────────────────────────────────────
const getArtist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Artist id is required' });
        }

        const client = await getClient();
        const artist = await client.getArtist(id);

        res.status(200).json({ status: 'Success', data: artist });
    } catch (error) {
        console.error('ViTune getArtist error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to fetch artist: ${error.message}` });
    }
};

// ─── Album Details ───────────────────────────────────────────────────────────
const getAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Album id is required' });
        }

        const client = await getClient();
        const album = await client.getAlbum(id);

        res.status(200).json({ status: 'Success', data: album });
    } catch (error) {
        console.error('ViTune getAlbum error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to fetch album: ${error.message}` });
    }
};

// ─── Playlist Details ────────────────────────────────────────────────────────
const getPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Playlist id is required' });
        }

        const client = await getClient();
        const playlist = await client.getPlaylist(id);

        res.status(200).json({ status: 'Success', data: playlist });
    } catch (error) {
        console.error('ViTune getPlaylist error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to fetch playlist: ${error.message}` });
    }
};

// ─── Lyrics ──────────────────────────────────────────────────────────────────
const getLyrics = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Video id is required' });
        }

        const client = await getClient();
        const lyrics = await client.getLyrics(id);

        res.status(200).json({ status: 'Success', data: lyrics });
    } catch (error) {
        console.error('ViTune getLyrics error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to fetch lyrics: ${error.message}` });
    }
};

// ─── Get Stream URL (returns a direct audio URL for the frontend player) ─────
const getStreamUrl = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Video id is required' });
        }

        const url = `https://www.youtube.com/watch?v=${id}`;
        
        // Use youtube-dl-exec to get info
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            extractorArgs: 'youtube:player_client=tvhtml5',
            addHeader: [
                'referer:https://www.youtube.com/',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });

        // Find best audio-only format
        const audioFormat = output.formats
            .filter(f => f.vcodec === 'none')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

        if (!audioFormat || !audioFormat.url) {
            throw new Error('No audio format found');
        }

        res.status(200).json({
            status: 'Success',
            data: {
                videoId: id,
                title: output.title,
                author: output.uploader,
                duration: output.duration,
                thumbnail: output.thumbnail,
                audioUrl: audioFormat.url,
                mimeType: audioFormat.ext === 'webm' ? 'audio/webm' : 'audio/mpeg',
                expiresIn: 3600
            }
        });
    } catch (error) {
        console.error('ViTune getStreamUrl error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to get stream URL: ${error.message}` });
    }
};

// ─── Stream (proxies audio through the backend — use for CORS-safe playback) ─
const stream = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Video id is required' });
        }

        const url = `https://www.youtube.com/watch?v=${id}`;
        
        // Set headers for audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');

        // Use youtube-dl-exec to stream directly
        const subprocess = youtubedl.exec(url, {
            output: '-',
            format: 'bestaudio',
            noCheckCertificates: true,
            noWarnings: true,
            extractorArgs: 'youtube:player_client=tvhtml5',
            addHeader: [
                'referer:https://www.youtube.com/',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });

        subprocess.stdout.pipe(res);

        subprocess.on('error', (err) => {
            console.error('Stream error:', err.message);
            if (!res.headersSent) {
                res.status(500).json({ status: 'Failed', message: 'Stream error' });
            }
        });

        // Ensure process is killed if request is aborted
        req.on('close', () => {
            subprocess.kill();
        });

    } catch (error) {
        console.error('ViTune stream error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Failed to stream: ${error.message}` });
    }
};

export default {
    search,
    getSuggestions,
    getSong,
    getArtist,
    getAlbum,
    getPlaylist,
    getLyrics,
    getStreamUrl,
    stream
};
