import { Innertube, UniversalCache } from 'youtubei.js';

const test = async () => {
    try {
        const youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            cookie: 'test=123'
        });
        
        console.log('Cookie set successfully');
    } catch (error) {
        console.error('Failed:', error.message);
    }
};

test();
