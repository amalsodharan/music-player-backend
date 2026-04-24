import axios from 'axios';

// Community maintained stable JioSaavn API
const BASE_URL = 'https://saavn.dev/api';

const search = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ status: 'Failed', message: 'Query is required' });

        const response = await axios.get(`${BASE_URL}/search/songs`, {
            params: { query, limit: 20 }
        });

        const results = response.data.data.results.map(song => ({
            type: 'SONG',
            videoId: song.id, // Using JioSaavn ID as videoId for compatibility
            name: song.name,
            artist: {
                name: song.artists.primary.map(a => a.name).join(', '),
                artistId: song.artists.primary[0]?.id
            },
            album: {
                name: song.album.name,
                albumId: song.album.id
            },
            duration: parseInt(song.duration),
            thumbnails: song.image.map(img => ({
                url: img.link,
                width: parseInt(img.quality.split('x')[0]),
                height: parseInt(img.quality.split('x')[1])
            })),
            downloadUrl: song.downloadUrl // This is the gold mine
        }));

        res.status(200).json({ status: 'Success', count: results.length, data: results });
    } catch (error) {
        console.error('Saavn search error:', error.message);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};

const getStreamUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${BASE_URL}/songs/${id}`);
        const song = response.data.data[0];

        if (!song) return res.status(404).json({ status: 'Failed', message: 'Song not found' });

        // JioSaavn provides multiple qualities, usually the last one is 320kbps
        const bestUrl = song.downloadUrl[song.downloadUrl.length - 1].link;

        res.status(200).json({
            status: 'Success',
            data: {
                videoId: id,
                title: song.name,
                author: song.artists.primary.map(a => a.name).join(', '),
                duration: song.duration,
                thumbnail: song.image[song.image.length - 1].link,
                audioUrl: bestUrl,
                mimeType: 'audio/mp4'
            }
        });
    } catch (error) {
        console.error('Saavn getStreamUrl error:', error.message);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};

export default {
    search,
    getStreamUrl
};
