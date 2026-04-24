import yt from 'yt-stream';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        console.log('Testing ID:', id);
        const stream = await yt.stream(`https://www.youtube.com/watch?v=${id}`);
        console.log('Stream URL found:', !!stream.url);
        console.log('Stream URL:', stream.url);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
