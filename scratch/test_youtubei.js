import { Innertube } from 'youtubei.js';

const test = async () => {
    try {
        const youtube = await Innertube.create();
        const id = 'fsiPzT50ZiM';
        console.log('Testing ID:', id);
        
        const info = await youtube.music.getInfo(id);
        console.log('Title:', info.basic_info.title);
        
        const format = info.chooseFormat({ type: 'audio', quality: 'best' });
        
        if (format) {
            console.log('Format has URL:', !!format.url);
            console.log('Format has Cipher:', !!format.signature_cipher);
            
            const url = format.decipher(youtube.session.player);
            console.log('Stream URL:', url);
        } else {
            console.log('No audio format found');
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
