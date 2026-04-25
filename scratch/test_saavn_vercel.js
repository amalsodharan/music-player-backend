import axios from 'axios';

const test = async () => {
    try {
        console.log('Testing jiosaavn-api-v3.vercel.app...');
        const response = await axios.get('https://jiosaavn-api-v3.vercel.app/search/songs', {
            params: { query: 'Tum Hi Ho', limit: 1 },
            timeout: 10000
        });
        console.log('Response status:', response.status);
        console.log('Results:', response.data?.data?.results?.length);
        if (response.data?.data?.results?.length > 0) {
            console.log('First result ID:', response.data.data.results[0].id);
        }
    } catch (error) {
        console.error('API failed:', error.message);
    }
};

test();
