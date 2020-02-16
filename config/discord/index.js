import types from './types.json';
import botCommands from './commands';

module.exports = client => {
  const queue = new Map();

  Object.keys(botCommands).map(key => {
    client.commands.set(botCommands[key].name, botCommands[key]);
  });

  client.on('ready', () => {
    console.info(`Logged in as ${client.user.tag}!`);
  });

  client.on('message', msg => {
    const serverQueue = queue.get(msg.guild.id);
    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase();
    console.info(`Called command: ${command}`);

    if (!client.commands.has(command)) return;

    try {
      console.log(command)
      client.commands.get(command).execute(msg, args, queue, serverQueue);
    } catch (error) {
      console.error(error);
      msg.reply('there was an error trying to execute that command!');
    }
  });
};
