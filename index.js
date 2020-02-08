require('dotenv').config();
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const client = new Discord.Client();
let playlist = [
  // {title:"Foxes In Fiction - Ontario Gothic", type:"local", path:"C:/Users/yacth_Mon/Desktop/Spring Test/test discrod/audio/Foxes In Fiction - Ontario Gothic [mp3clan].mp3", requested_by:"yacth_Mon"},
  // {title:"Blossoms - Charlemagne", type:"youtube", path:"https://www.youtube.com/watch?v=WBtVjjLtEY8", requested_by:"yacth_Mon"},
  // {title:"Husbands - 3am", type:"local", path:"D:/Music/Husbands - 3am [mp3clan].mp3" , requested_by:"yacth_Mon"}
  {
    title: 'Husbands - 3am',
    type: 'local',
    path: 'D:/Music/Jack Stauber - Coffee (extended Fan Edit) [mp3clan].mp3',
    requested_by: 'yacth_Mon'
  }
];
let connection = undefined;
let voiceChannel = undefined;
let channel = undefined;
let dispatcher = undefined;
let playing = false;
let defaultVolume = 0.1;
client.login(process.env.DC_KEY);
// ytdl.getInfo("https://www.youtube.com/watch?v=WBtVjjLtEY8", (err,info)=>{
//   console.log(info.title)
// })
client.on('message', message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;
  // botProcess(message)

  if (message.content === 'เยเฮ๊') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) {
      message.member.voiceChannel
        .join()
        .then(con => {
          // Connection is an instance of VoiceConnection

          message.reply('Henlo Motherfucker !!');
          message.reply(`My default volume is set to ${defaultVolume}`);
          this.connection = con;
          this.voiceChannel = message.member.voiceChannel;
          this.channel = message.channel;
          // this.dispatcher = con.playStream(ytdl("https://www.youtube.com/watch?v=a6_R6x5pbpg", { filter : 'audioonly' , highWaterMark: 1<<25 }), this.streamOptions);
          // console.log("Type of after set " +typeof(this.connection));
        })
        .catch(console.log);
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
  // console.log(this.connection);
  if (this.connection !== undefined) {
    if (message.content.startsWith('#play ')) {
      let query = message.content.split(' ');
      if (query[1]) {
        if (query[1] == 'local') {
          let regrexArg = message.content
            .replace(/[\\]+/g, '/')
            .match(/"(.*?)"/g);
          addLocal(
            regrexArg[0].replace(/['"]+/g, ''),
            regrexArg[1].replace(/['"]+/g, ''),
            message.author
          );
        } else {
          addYouTube(query[1], message.author).then(
            ({ title, requested_by, queue_number }) => {
              this.channel.send(
                `> Added \`${title}\` to queue \`[${queue_number}]\`, requested by \`${requested_by}\``
              );
            }
          );
        }
      }
    } else if (message.content == '#play') {
      this.channel.send('> #play [YouTube Url]');
    }
    if (message.content == '#stop') {
      stop();
    }
    if (message.content == '#pause') {
      pause();
    }
    if (message.content == '#resume') {
      resume();
    }
    if (message.content == '#skip') {
      skip();
    }
    if (message.content == '#playlist') {
      showingPlaylist();
    }
  }
});

let play = () => {
  if (!playing)
    if (playlist.length > 0) {
      let showingType = '';
      console.log(
        `Playing ${playlist[0].type} mode : ${playlist[0].title}, requested by : ${playlist[0].requested_by}`
      );
      switch (playlist[0].type) {
        case 'local':
          this.dispatcher = this.connection.playFile(playlist[0].path);
          // dispatcher.end();
          // dispatcher.pause();
          // dispatcher.resume();
          showingType = '`[Local]`';
          break;
        case 'youtube':
          let stream = ytdl(playlist[0].path, {
            filter: 'audioonly',
            highWaterMark: 1 << 25
          });
          this.dispatcher = this.connection.playStream(
            stream,
            this.streamOptions
          );
          showingType = ':youtube: `[YouTube]`';
          break;
        default:
          this.channel.send(
            `__**Something went wrong ‼**__ for this queue :: \`${playlist[0].title}\`, Type ${playlist[0].type}`
          );
          this.channel.send(`⚠⚠⚠ __**SKIPING**__ ⚠⚠⚠`);
          playlist.shift();
          return play();
      }
      this.playing = true;
      this.dispatcher.setVolume(defaultVolume);
      this.channel.send(
        `▶ __**Now Playing**__ :: \`${playlist[0].title}\`, Type ${showingType}`
      );
      this.dispatcher.on('end', () => {
        console.log('Song end');
        playlist.shift();
        this.playing = false;
        play();
      });
      this.dispatcher.on('error', e => {
        // Catch any errors that may arise
        console.log(e);
      });
    } else {
      console.log('Playlist is empty, stop playing.');
      this.channel.send(`> **Playlist** โล่งแล้วเด้อ`);
    }
};

let addYouTube = (url, requested_by) => {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, (err, info) => {
      if (err) return reject(err);
      if (info.title) {
        playlist.push({
          title: info.title,
          type: 'youtube',
          path: url,
          requested_by: requested_by.username
        });
        // console.log(requested_by);
        playlist.length == 1 ? play() : '';
        return resolve({
          title: info.title,
          requested_by: requested_by.username,
          queue_number: playlist.length
        });
      }
    });
  });
};

let addLocal = (path, title, requested_by) => {
  return new Promise((resolve, reject) => {
    playlist.push({
      title: title,
      type: 'local',
      path: path,
      requested_by: requested_by.username
    });
    // console.log(requested_by);
    playlist.length == 1 ? play() : '';
    return resolve({
      title,
      requested_by: requested_by.username,
      queue_number: playlist.length
    });
  });
};

let pause = () => {
  this.dispatcher.pause();
};

let resume = () => {
  this.dispatcher.resume();
};

let skip = () => {
  this.dispatcher.end();
};

let stop = () => {
  playlist = [];
  this.dispatcher.end();
};

let showingPlaylist = () => {
  if (playlist.length > 0) {
    let listing = '';
    for (let i = 0, l = playlist.length; i < l; i++) {
      listing += `[No.${i + 1}] \`${playlist[i].title}\` on \`${
        playlist[i].type
      }\`, requested by : \`${playlist[i].requested_by}\` ${
        this.playing && i == 0 ? '▶ `[Playing]`' : ''
      }\n`;
    }
    this.channel.send(`__**Playlist**__`);
    this.channel.send(listing);
  } else {
    this.channel.send(`> **Playlist** ว่างจ้าา`);
  }
};

let disconnecting = () => {
  console.log('Exit');
  if (this.connection) this.connection.disconnect();
  process.exit();
};
process.on('exit', disconnecting);
process.on('SIGINT', disconnecting);
