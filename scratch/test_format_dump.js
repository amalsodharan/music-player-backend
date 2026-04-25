import { Innertube, UniversalCache } from 'youtubei.js';

const test = async () => {
    try {
        const youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true
        });
        
        const id = 'BjL7AuPsmEk'; 
        console.log('Testing youtubei.js format dump for ID:', id);
        
        const info = await youtube.getInfo(id, 'WEB');
        
        const format = info.chooseFormat({ type: 'audio', quality: 'best' });
        
        console.log('Format object:', JSON.stringify({
            hasUrl: !!format?.url,
            hasCipher: !!format?.signature_cipher,
            hasSignature: !!format?.signature,
            mime: format?.mime_type,
            bitrate: format?.bitrate,
            cipher: format?.signature_cipher
        }, null, 2));
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
