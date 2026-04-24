import youtubedl from 'youtube-dl-exec';

const test = async () => {
    try {
        const id = 'fsiPzT50ZiM';
        const url = `https://www.youtube.com/watch?v=${id}`;
        console.log('Testing URL with ANDROID app mimicry:', url);
        
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            extractorArgs: 'youtube:player_client=android',
            userAgent: 'com.google.android.youtube/17.31.35 (Linux; U; Android 12; en_US; Pixel 6 Build/SD1A.210817.036) gzip',
            addHeader: [
                'X-YouTube-Client-Name:3',
                'X-YouTube-Client-Version:17.31.35'
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
