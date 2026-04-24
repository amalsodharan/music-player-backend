import youtubedl from 'youtube-dl-exec';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        const url = `https://www.youtube.com/watch?v=${id}`;
        console.log('Testing URL with WEB_EMBEDDED:', url);
        
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            extractorArgs: 'youtube:player_client=web_embedded',
            addHeader: [
                'referer:https://www.youtube.com/embed/',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
