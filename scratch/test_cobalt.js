import axios from 'axios';

const test = async () => {
    try {
        const id = 'BjL7AuPsmEk';
        const url = `https://www.youtube.com/watch?v=${id}`;
        
        console.log('Testing Cobalt API for:', url);
        
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            isAudioOnly: true,
            aFormat: 'mp3'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        console.log('Cobalt Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Cobalt API failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

test();
