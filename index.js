/* eslint-disable no-console */
const { Client } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const Parser = require('rss-parser');

const {
  token, interval, prefix, owner,
} = require('./config');

const {
  FoxSources, CNNSources, SpaceSources,
} = require('./sources');

const parser = new Parser();
const client = new Client();

const allSources = [FoxSources, CNNSources, SpaceSources];

let doneNews = [];
let channelsRss = ['571007246931066891'];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.users.get(owner).send(`${client.user.username} has restarted`);
});

// Returns a random number based on an array's index
function randIndex(array) {
  return Math.floor((Math.random() * (array.length)));
}

// Returns current date
function today() {
  const date = new Date();
  let dd = date.getDate();
  let mm = date.getMonth() + 1; // January is 0!
  const yyyy = date.getFullYear();
  if (dd < 10) dd = `0${dd}`;
  if (mm < 10) mm = `0${mm}`;
  return `${dd}/${mm}/${yyyy}`;
}

// Gets the right logo for each respective news outlet
function newsOutlet(provider) {
  let setUrl;
  const splicedProvider = provider.split(' ');
  switch (splicedProvider[0]) {
    case 'FOX':
      setUrl = 'https://cdn.discordapp.com/attachments/611471116589989889/616694437975949313/118508.png';
      break;
    case 'Space.com':
      setUrl = 'https://cdn.discordapp.com/attachments/611471116589989889/616744455453802506/4707531.png';
      break;
    case 'CNN.com':
      setUrl = 'https://cdn.discordapp.com/attachments/611471116589989889/616747868358836450/3298.png';
      break;
    default:
      setUrl = client.user.avatarURL();
  }
  return setUrl;
}

async function rssTask(source) {
  // Parses the URL into JSON
  this.feed = await parser.parseURL(source);
  this.titles = [];
  this.links = [];
  this.descriptions = [];
  this.postedAtDates = [];

  // Iterates over items in the Parsed url
  this.feed.items.forEach((item) => {
    this.titles.push(item.title);
    this.links.push(item.link);
    this.descriptions.push(item.contentSnippet);
    // eslint-disable-next-line no-unused-expressions
    item.pubDate ? this.postedAtDates.push(item.pubDate) : this.postedAtDates.push(today());
  });

  // Checks if Content title is posted already; If true, will reiterate again from the beginning
  if (doneNews.includes(this.titles[this.index])) {
    // console.log("Already Posted, Will look for other articles");
    // await redo();
    return;
  }
  // Assigns a value based on the number of items in the parsed rss to be used as the base index
  this.index = await randIndex(this.feed.items);

  /* Reads the articles date and splits the year from the format,if not
        If not 2019, then redo */
  const postedAt = await this.postedAtDates[this.index].split(' ');
  const Outdated = await postedAt[3] < 2019;
  if (Outdated) {
    // await redo();
    return;
  }

  // Creates MessageEmbed object with respective formatting
  this.news = new MessageEmbed()
    .setAuthor(this.feed.title.includes('CNN') ? this.feed.title = 'CNN.com' : this.feed.title, client.user.avatarURL())
    .setThumbnail(newsOutlet(this.feed.title))
    .setColor('#4B0000')
    .addField(this.titles[this.index], `${this.descriptions[this.index] ? this.descriptions[this.index] : 'No descriptions.'}`)
    .addField('Read this story:', this.links[this.index])
    .setFooter(`News-Bot does not represent nor endorse ${this.feed.title.includes('CNN') ? this.feed.title = 'CNN.com' : this.feed.title}. • ${this.postedAtDates[this.index].includes('+0000') ? this.postedAtDates[this.index].replace('+0000', 'GMT') : this.postedAtDates[this.index]}`);

  if (channelsRss.length === 0) {
    console.log('No News channels are currently listed, please assign channels');
    return;
  }
  doneNews.push(this.titles[this.index]);
  console.log(doneNews.length);

  // Sends news to registered channels
  channelsRss.forEach((channelId) => {
    client.channels.get(channelId).send(this.news);
  });
}

// // Function basically do the task again
// const redo = () => {
//   /* Randomly chooses between CNN, FOX, and Space.com
//   (gives equal probabilities for these categories) */
//   initSeed = randIndex(allSources);

//   // Then randomly chooses which rss site to parse
//   newsSeed = allSources[initSeed][randIndex(allSources[initSeed])];

//   rssTask(newsSeed);
//   // console.log("Redone successful!")
// };

setInterval(() => {
  /* Randomly chooses between CNN, FOX, and Space.com
  (gives equal probabilities for these categories) */
  const initSeed = randIndex(allSources);
  // Then randomly chooses which rss site to parse
  const newsSeed = allSources[initSeed][randIndex(allSources[initSeed])];
  rssTask(newsSeed);
  // Resets the array once it reaches assigned threshold
  if (doneNews.length >= 64) doneNews = [];
}, parseInt(interval, 10));

client.on('message', async (message) => {
  const msg = message.content.toLowerCase();
  if (message.channel.type === 'dm') {
    if (message.author.bot) return;
    if (msg === `${prefix}invite`) {
      const invite = new MessageEmbed()
        .setColor('#FFFFFF')
        .setAuthor(`HI ${message.author.username}, I post news and updates!`, client.user.avatarURL())
        .setThumbnail(client.user.avatarURL())
        .addField('If you want to invite me in your guild,\nyou may authorize me with this link:', 'https://discordapp.com/api/oauth2/authorize?client_id=616755334933119002&permissions=2048&scope=bot')
        .addField('If you do, simply ping me for instructions', 'I hope I can help keep you updated with news!')
        .setFooter(`This application is brought to you by ${client.users.get(owner).tag}`);
      message.channel.send(invite);
    }
    return;
  }
  if ((msg === `${prefix}assignnews` && (message.member.hasPermission('MANAGE_CHANNELS')))) {
    if (channelsRss.includes(message.channel.id)) {
      message.channel.send('News will no longer be sent in this channel');
      channelsRss = channelsRss.filter((chan) => chan !== message.channel.id);
    } else {
      channelsRss.push(message.channel.id);
      message.channel.send('News will now be sent in this channel.');
      await client.users.get(owner).send(`Channel ID: \`${message.channel.id}\` added to cache from Guild \`${message.guild.name}\``);
    }
  }
  if (message.content === client.user && message.member.hasPermission('MANAGE_CHANNELS')) {
    const help = new MessageEmbed()
      .setAuthor('News-bot at your service.', client.user.avatarURL())
      .setThumbnail(client.user.avatarURL())
      .setColor('#FFFFFF')
      .addField(`My prefix is: \`${prefix}\``, `${client.user.username} sends news and updates from CNN, \n FOX news, and Space.com every 10 minutes or so`)
      .addField(`To register a channel do, ${prefix}assignnews`, 'Please be informed that you need at least\n"MANAGE MESSAGES" permission to do so')
      .addField(`If you are interested to have ${client.user.username} in your server,`, `Please dm me with ${prefix}invite for details`)
      .setFooter(`This application is brought to you by ${client.users.get(owner).tag}`);

    message.channel.send(help);
  }
});

// Logs in the client
client.login(token);
