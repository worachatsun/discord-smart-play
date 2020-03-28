const {google} = require('googleapis')
const youtubeV3 = google.youtube( { version: 'v3', auth: process.env.YOUTUBE_API_KEY } );

const serachVideoByTitle = title => youtubeV3.search.list({
    part: 'snippet',
    type: 'video',
    q: title,
    maxResults: 1,
})

export {
    serachVideoByTitle
}