import YTMusic from 'ytmusic-api';

const test = async () => {
    try {
        const ytmusic = new YTMusic();
        await ytmusic.initialize();
        const id = 'fsiPzT50ZiM';
        const song = await ytmusic.getSong(id);
        console.log('Song info:', JSON.stringify(song, null, 2));
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
