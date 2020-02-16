module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(msg, args, queue, serverQueue) {
    msg.reply('pong');
    msg.channel.send('pong');
  }
};
