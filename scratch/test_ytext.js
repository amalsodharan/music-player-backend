import pkg from 'youtube-ext';
const { getInfo } = pkg;

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        console.log('Testing youtube-ext for ID:', id);
        
        const info = await getInfo(id);
        console.log('Title:', info.title);
        
        const audioFormat = info.formats.filter(f => f.hasAudio && !f.hasVideo).sort((a, b) => b.bitrate - a.bitrate)[0];
        console.log('Stream URL found:', !!audioFormat.url);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
