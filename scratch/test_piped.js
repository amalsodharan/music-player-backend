import axios from 'axios';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        console.log('Testing Piped API for ID:', id);
        
        // Piped has many instances, kavin.rocks is the main one
        const response = await axios.get(`https://pipedapi.kavin.rocks/streams/${id}`);
        const data = response.data;
        
        console.log('Title:', data.title);
        console.log('Audio Streams:', data.audioStreams.length);
        if (data.audioStreams.length > 0) {
            console.log('First Audio Stream URL:', data.audioStreams[0].url);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

test();
