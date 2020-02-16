module.exports = {
    name: 'stop',
    description: 'Stop!',
    execute(msg, args, queue, serverQueue) {
        if (!msg.member.voiceChannel) return msg.channel.send('You have to be in a voice channel to stop the music!');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
  };
  