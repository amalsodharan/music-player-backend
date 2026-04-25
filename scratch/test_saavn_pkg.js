import saavnapi from 'saavnapi';

const test = async () => {
    try {
        const api = saavnapi.default || saavnapi;
        
        const results = await api.search.searchSongs({ query: 'Tum Hi Ho', limit: 1 });
        
        console.log('Results:', JSON.stringify(results.data.results[0], null, 2));
    } catch (error) {
        console.error('API failed:', error.message);
    }
};

test();
