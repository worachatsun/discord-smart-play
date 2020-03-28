const ytdl = require('ytdl-core');
const youtube = require('../../../services/youtube')
const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);

module.exports = {
    name: 'play',
    description: 'play!',
    async execute(msg, args, queue, serverQueue) {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send('You need to be in a voice channel to play music!');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return msg.channel.send('I need the permissions to join and speak in your voice channel!');
        }

        let songInfo

        if (args[0].match(regex)) {
            songInfo = await ytdl.getInfo(args[0]);
        } else {
            const res = youtube.serachVideoByTitle(args[0])
            const { items }  = await res.then(res => res.data);
            songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${items[0].id.videoId}`)
        }

        const song = {
            title: songInfo.title,
            url: songInfo.video_url,
        };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            };

            queue.set(msg.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                play(msg.guild, queueContruct.songs[0], queue);
            } catch (err) {
                console.log(err);
                queue.delete(msg.guild.id);
                return msg.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            console.log(serverQueue.songs);
            return msg.channel.send(`${song.title} has been added to the queue!`);
        }
    }
};

function play(guild, song, queue) {
    console.log(queue)
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', async () => {
			console.log('Music ended!');
			await serverQueue.songs.shift();
			play(guild, serverQueue.songs[0], queue);
		})
		.on('error', error => {
			console.error('Error message: ', error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}