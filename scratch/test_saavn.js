import axios from 'axios';

const test = async () => {
    try {
        const query = 'Tum Hi Ho';
        console.log('Testing JioSaavn for query:', query);
        
        // Using a popular public JioSaavn API
        const response = await axios.get(`https://saavn.me/search/songs?query=${query}`);
        const data = response.data;
        
        if (data.status === 'SUCCESS' && data.data.results.length > 0) {
            const song = data.data.results[0];
            console.log('Title:', song.name);
            console.log('Artist:', song.primaryArtists);
            console.log('Stream URL found:', !!song.downloadUrl);
            console.log('Best Stream URL:', song.downloadUrl[song.downloadUrl.length - 1].link);
        } else {
            console.log('No results found');
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
