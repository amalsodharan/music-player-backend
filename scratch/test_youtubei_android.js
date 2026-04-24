import { Innertube } from 'youtubei.js';

const test = async () => {
    try {
        const youtube = await Innertube.create();
        const id = 'fsiPzT50ZiM';
        console.log('Testing ID with ANDROID client:', id);
        
        // Use standard youtube.getInfo which uses ANDROID by default
        const info = await youtube.getInfo(id);
        
        // Find a format that doesn't require deciphering (if possible)
        const format = info.streaming_data.adaptive_formats.find(f => f.url && f.mime_type.includes('audio'));
        
        if (format) {
            console.log('Stream URL found (no decipher needed):', !!format.url);
            console.log('Stream URL:', format.url);
        } else {
            console.log('No direct URL format found, decipher needed.');
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
