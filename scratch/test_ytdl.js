import youtubedl from 'youtube-dl-exec';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        const url = `https://www.youtube.com/watch?v=${id}`;
        console.log('Testing URL:', url);
        
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        });
        
        console.log('Title:', output.title);
        const audioFormat = output.formats.filter(f => f.vcodec === 'none').sort((a, b) => b.abr - a.abr)[0];
        console.log('Stream URL found:', !!audioFormat.url);
        console.log('Stream URL:', audioFormat.url);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
