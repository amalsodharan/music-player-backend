import axios from 'axios';

const instances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.victr.me',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.moomoo.me'
];

const test = async () => {
    const id = 'fsiPzT50ZiM';
    for (const base of instances) {
        try {
            console.log(`Testing instance: ${base}`);
            const response = await axios.get(`${base}/streams/${id}`, { timeout: 5000 });
            const data = response.data;
            if (data.audioStreams && data.audioStreams.length > 0) {
                console.log(`Success with ${base}!`);
                console.log('Title:', data.title);
                console.log('First Audio Stream URL:', data.audioStreams[0].url);
                return;
            }
        } catch (error) {
            console.log(`Failed with ${base}: ${error.message}`);
        }
    }
    console.log('All instances failed');
};

test();
