import axios from 'axios';

const test = async () => {
    try {
        const response = await axios.get('https://saavn.me/search/songs', {
            params: { query: 'Tum Hi Ho', limit: 1 }
        });
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('saavn.me failed:', error.message);
    }
};

test();
