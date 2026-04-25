import axios from 'axios';

const testJioSaavnFallback = async () => {
    try {
        const title = 'Tum Hi Ho Arijit Singh';
        console.log('Searching JioSaavn for:', title);
        
        const response = await axios.get('https://jiosaavn-api-v3.vercel.app/search/songs', {
            params: { query: title, limit: 1 }
        });
        
        const results = response.data?.data?.results;
        if (results && results.length > 0) {
            const song = results[0];
            const bestUrl = song.downloadUrl[song.downloadUrl.length - 1].link;
            console.log('Found fallback song:', song.name);
            console.log('Fallback URL:', bestUrl);
        } else {
            console.log('No fallback found on JioSaavn');
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

testJioSaavnFallback();
