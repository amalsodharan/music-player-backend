import axios from 'axios';

const test = async () => {
    try {
        console.log('Fetching active piped instances...');
        const response = await axios.get('https://piped-instances.kavin.rocks/');
        // Filter by uptime > 95% and get the api_url
        const instances = response.data
            .filter(i => i.uptime_24h > 95 && i.api_url)
            .map(i => i.api_url);
        
        console.log(`Found ${instances.length} active API instances.`);
        
        const id = 'BjL7AuPsmEk';
        for (const base of instances) {
            try {
                console.log(`Testing instance: ${base}`);
                const streamResponse = await axios.get(`${base}/streams/${id}`, { timeout: 3000 });
                const data = streamResponse.data;
                if (data.audioStreams && data.audioStreams.length > 0) {
                    console.log(`Success with ${base}!`);
                    console.log('Title:', data.title);
                    console.log('Audio URL:', data.audioStreams[0].url);
                    return; // Stop at first success
                }
            } catch (error) {
                console.log(`Failed with ${base}: ${error.message}`);
            }
        }
        console.log('All instances failed');
    } catch (error) {
        console.error('Failed to get instances:', error.message);
    }
};

test();
