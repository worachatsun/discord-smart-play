module.exports = {
    name: 'skip',
    description: 'Skip!',
    execute(msg, args, queue, serverQueue) {
        if (!msg.member.voiceChannel) return msg.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue) return msg.channel.send('There is no song that I could skip!');
        serverQueue.connection.dispatcher.end();
    }
  };
  