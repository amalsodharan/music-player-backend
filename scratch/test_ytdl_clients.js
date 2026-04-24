import youtubedl from 'youtube-dl-exec';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        const url = `https://www.youtube.com/watch?v=${id}`;
        console.log('Testing URL with specific clients:', url);
        
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            // Try to use clients that are less likely to be blocked
            extractorArgs: 'youtube:player_client=ios,android_vr',
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        });
        
        console.log('Title:', output.title);
        const audioFormat = output.formats.filter(f => f.vcodec === 'none').sort((a, b) => b.abr - a.abr)[0];
        console.log('Stream URL found:', !!audioFormat.url);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

test();
