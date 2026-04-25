import { Innertube, UniversalCache } from 'youtubei.js';
import Jinter from 'jintr';

const test = async () => {
    try {
        const youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            fetch: (input, init) => fetch(input, init)
        });
        
        // Mock the JS evaluator with Jinter
        youtube.session.context.client.clientName = 'WEB';
        youtube.session.context.client.clientVersion = '2.20230622.01.00';
        
        const id = 'BjL7AuPsmEk'; // The ID that failed earlier
        console.log('Testing youtubei.js with Jinter for ID:', id);
        
        const info = await youtube.getInfo(id, 'WEB');
        console.log('Title:', info.basic_info.title);
        
        const format = info.chooseFormat({ type: 'audio', quality: 'best' });
        
        if (format) {
            youtube.session.js_evaluator = (code) => {
                const jinter = new Jinter(code);
                return jinter.evaluate();
            };
            const url = await format.decipher(youtube.session.player);
            console.log('Stream URL found (deciphered):', !!url);
            console.log('URL Starts with:', url.substring(0, 30));
        } else {
            console.log('No audio format found');
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
