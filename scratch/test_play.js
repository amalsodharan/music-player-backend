import play from 'play-dl';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        const url = `https://www.youtube.com/watch?v=${id}`;
        console.log('Testing URL:', url);
        const info = await play.video_info(url);
        console.log('Title:', info.video_details.title);
        const stream = await play.stream(url, { quality: 2 });
        console.log('Stream URL found:', !!stream.url);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
