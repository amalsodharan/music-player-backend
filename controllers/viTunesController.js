import YTMusic from 'ytmusic-api';
import { Innertube, UniversalCache } from 'youtubei.js';
import axios from 'axios';
import youtubedl from 'youtube-dl-exec';

// ─── Piped Instances (Fallback for blacklisted IPs like Render) ──────────────
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.victr.me',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.moomoo.me',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.astartes.nl'
];

async function getPipedStream(videoId) {
    for (const base of PIPED_INSTANCES) {
        try {
            const response = await axios.get(`${base}/streams/${videoId}`, { timeout: 4000 });
            if (response.data && response.data.audioStreams && response.data.audioStreams.length > 0) {
                // Find the best audio stream
                const bestAudio = response.data.audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
                return {
                    url: bestAudio.url,
                    title: response.data.title,
                    uploader: response.data.uploader,
                    duration: response.data.duration,
                    thumbnail: response.data.thumbnailUrl,
                    mimeType: bestAudio.mimeType
                };
            }
        } catch (error) {
            console.error(`Piped instance ${base} failed:`, error.message);
        }
    }
    return null;
}

async function getYtdlStream(videoId) {
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            extractorArgs: 'youtube:player_client=ios,android_vr',
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        });
        
        const audioFormat = output.formats
            .filter(f => f.vcodec === 'none' && f.url)
            .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

        if (audioFormat) {
            return {
                url: audioFormat.url,
                title: output.title,
                uploader: output.uploader,
                duration: output.duration,
                thumbnail: output.thumbnail,
                mimeType: audioFormat.acodec ? `audio/${audioFormat.ext}` : 'audio/mpeg'
            };
        }
    } catch (error) {
        console.error('yt-dlp fallback failed:', error.message);
    }
    return null;
}

// Singleton – initialise once, reuse across requests
let ytmusic = null;
let youtube = null;

const getYouTube = async () => {
    if (!youtube) {
        youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            cookie: process.env.YOUTUBE_COOKIE || ''
        });
    }
    return youtube;
};

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

        try {
            const yt = await getYouTube();
            // Use the TV client as it's the most reliable on cloud IPs
            const info = await yt.getInfo(id, 'TVHTML5');
            
            const format = info.chooseFormat({ type: 'audio', quality: 'best' });
            
            if (format) {
                let audioUrl = format.url;
                
                // If there's a cipher but no URL, we might need to decipher
                if (!audioUrl && format.signature_cipher) {
                    try {
                        await format.decipher(yt.session.player);
                        audioUrl = format.url;
                    } catch (decipherError) {
                        console.warn('Deciphering failed:', decipherError.message);
                    }
                }

                if (audioUrl) {
                    return res.status(200).json({
                        status: 'Success',
                        data: {
                            videoId: id,
                            title: info.basic_info.title,
                            author: info.basic_info.author,
                            duration: info.basic_info.duration,
                            thumbnail: info.basic_info.thumbnail?.[0]?.url,
                            audioUrl: audioUrl,
                            mimeType: format.mime_type,
                            expiresIn: 3600
                        }
                    });
                } else {
                    console.warn('No direct audio URL found in YouTubei format.');
                }
            }
        } catch (error) {
            console.warn('Primary YouTubei fetch failed, trying Piped fallback...', error.message);
        }

        // FALLBACK 1: Try Piped Instances
        const pipedData = await getPipedStream(id);
        if (pipedData) {
            return res.status(200).json({
                status: 'Success',
                source: 'piped',
                data: {
                    videoId: id,
                    title: pipedData.title,
                    author: pipedData.uploader,
                    duration: pipedData.duration,
                    thumbnail: pipedData.thumbnail,
                    audioUrl: pipedData.url,
                    mimeType: pipedData.mimeType,
                    expiresIn: 3600
                }
            });
        }

        // FALLBACK 2: Try yt-dlp (youtube-dl-exec) - ONLY LOCALLY
        if (process.env.NODE_ENV !== 'production') {
            console.log('Trying yt-dlp fallback for:', id);
            const ytdlData = await getYtdlStream(id);
            if (ytdlData) {
                return res.status(200).json({
                    status: 'Success',
                    source: 'ytdl',
                    data: {
                        videoId: id,
                        title: ytdlData.title,
                        author: ytdlData.uploader,
                        duration: ytdlData.duration,
                        thumbnail: ytdlData.thumbnail,
                        audioUrl: ytdlData.url,
                        mimeType: ytdlData.mimeType,
                        expiresIn: 3600
                    }
                });
            }
        }

        // FALLBACK 3: Try JioSaavn (Last resort for Vercel)
        try {
            const client = await getClient();
            const songInfo = await client.getSong(id).catch(() => null);
            const query = songInfo ? `${songInfo.title} ${songInfo.artist}` : id;
            
            console.log('Trying Saavn fallback for:', query);
            const saavnSearch = await axios.get(`https://saavn.dev/api/search/songs`, {
                params: { query, limit: 1 }
            });
            
            if (saavnSearch.data && saavnSearch.data.data && saavnSearch.data.data.results.length > 0) {
                const bestMatch = saavnSearch.data.data.results[0];
                const saavnStreamResponse = await axios.get(`https://saavn.dev/api/songs/${bestMatch.id}`);
                const saavnStreamData = saavnStreamResponse.data.data[0];
                
                if (saavnStreamData && saavnStreamData.downloadUrl) {
                    const audioUrl = saavnStreamData.downloadUrl[saavnStreamData.downloadUrl.length - 1].link;
                    return res.status(200).json({
                        status: 'Success',
                        source: 'saavn',
                        data: {
                            videoId: id,
                            title: saavnStreamData.name,
                            author: saavnStreamData.artists.primary.map(a => a.name).join(', '),
                            duration: saavnStreamData.duration,
                            thumbnail: saavnStreamData.image[saavnStreamData.image.length - 1].link,
                            audioUrl: audioUrl,
                            mimeType: 'audio/mp4',
                            expiresIn: 3600
                        }
                    });
                }
            }
        } catch (saavnError) {
            console.error('Saavn fallback failed:', saavnError.message);
        }

        res.status(500).json({ status: 'Failed', message: 'Failed to get stream URL from all sources' });
    } catch (error) {
        console.error('ViTune getStreamUrl error:', error.message);
        res.status(500).json({ status: 'Failed', message: `Critical error: ${error.message}` });
    }
};

// ─── Stream (proxies audio through the backend — use for CORS-safe playback) ─
const stream = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 'Failed', message: 'Video id is required' });
        }

        try {
            const yt = await getYouTube();
            const info = await yt.getInfo(id, 'TVHTML5');
            const format = info.chooseFormat({ type: 'audio', quality: 'best' });

            if (format) {
                const stream = await info.download({
                    type: 'audio',
                    quality: 'best',
                    client: 'TVHTML5'
                });

                res.setHeader('Content-Type', format.mime_type || 'audio/mpeg');
                res.setHeader('Accept-Ranges', 'bytes');

                // Convert web stream to node stream if necessary
                const reader = stream.getReader();
                const pump = async () => {
                    const { done, value } = await reader.read();
                    if (done) {
                        res.end();
                        return;
                    }
                    res.write(value);
                    await pump();
                };
                await pump();
                return;
            }
        } catch (error) {
            console.warn('Direct YouTubei stream failed, trying Piped fallback...', error.message);
        }

        // FALLBACK 1: Stream via Piped
        const pipedData = await getPipedStream(id);
        if (pipedData && pipedData.url) {
            try {
                const response = await axios.get(pipedData.url, { responseType: 'stream' });
                res.setHeader('Content-Type', pipedData.mimeType || 'audio/mpeg');
                response.data.pipe(res);
                return;
            } catch (pipedStreamError) {
                console.warn('Piped stream connection failed:', pipedStreamError.message);
            }
        }

        // FALLBACK 2: Stream via yt-dlp - ONLY LOCALLY
        if (process.env.NODE_ENV !== 'production') {
            try {
                console.log('Trying yt-dlp stream fallback for:', id);
                const ytdlData = await getYtdlStream(id);
                if (ytdlData && ytdlData.url) {
                    const response = await axios.get(ytdlData.url, { 
                        responseType: 'stream',
                        headers: {
                            'User-Agent': 'googlebot',
                            'Referer': 'https://www.youtube.com/'
                        }
                    });
                    res.setHeader('Content-Type', ytdlData.mimeType || 'audio/mpeg');
                    response.data.pipe(res);
                    return;
                }
            } catch (ytdlStreamError) {
                console.error('yt-dlp stream fallback failed:', ytdlStreamError.message);
            }
        }

        // FALLBACK 3: Stream via Saavn (Last resort for Vercel)
        try {
            const client = await getClient();
            const songInfo = await client.getSong(id).catch(() => null);
            const query = songInfo ? `${songInfo.title} ${songInfo.artist}` : id;
            
            console.log('Trying Saavn stream fallback for:', query);
            const saavnSearch = await axios.get(`https://saavn.dev/api/search/songs`, {
                params: { query, limit: 1 }
            });
            
            if (saavnSearch.data && saavnSearch.data.data && saavnSearch.data.data.results.length > 0) {
                const bestMatch = saavnSearch.data.data.results[0];
                const saavnStreamResponse = await axios.get(`https://saavn.dev/api/songs/${bestMatch.id}`);
                const saavnStreamData = saavnStreamResponse.data.data[0];
                
                if (saavnStreamData && saavnStreamData.downloadUrl) {
                    const audioUrl = saavnStreamData.downloadUrl[saavnStreamData.downloadUrl.length - 1].link;
                    const streamResponse = await axios.get(audioUrl, { responseType: 'stream' });
                    res.setHeader('Content-Type', 'audio/mp4');
                    streamResponse.data.pipe(res);
                    return;
                }
            }
        } catch (saavnStreamError) {
            console.error('Saavn stream fallback failed:', saavnStreamError.message);
        }

        res.status(500).json({ status: 'Failed', message: 'Failed to stream from all sources' });

    } catch (error) {
        console.error('ViTune stream error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ status: 'Failed', message: `Failed to stream: ${error.message}` });
        }
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
