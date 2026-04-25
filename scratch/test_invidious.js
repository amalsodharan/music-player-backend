import axios from 'axios';

const test = async () => {
    try {
        console.log('Fetching active Invidious instances...');
        const response = await axios.get('https://api.invidious.io/instances.json');
        
        const instances = Object.values(response.data)
            .filter(i => i[1] && i[1].api && i[1].uri)
            .map(i => i[1].uri);
            
        console.log(`Found ${instances.length} active API instances.`);
        
        const id = 'BjL7AuPsmEk';
        for (const base of instances) {
            try {
                console.log(`Testing instance: ${base}`);
                const streamResponse = await axios.get(`${base}/api/v1/videos/${id}`, { timeout: 4000 });
                const data = streamResponse.data;
                if (data.formatStreams && data.formatStreams.length > 0) {
                    const audioFormat = data.formatStreams.find(f => f.type.includes('audio/mp4') || f.type.includes('audio/webm'));
                    const url = audioFormat ? audioFormat.url : data.formatStreams[0].url;
                    console.log(`Success with ${base}!`);
                    console.log('Title:', data.title);
                    console.log('Audio URL:', url);
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
