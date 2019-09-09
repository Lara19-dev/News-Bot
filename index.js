const Discord = require('discord.js');
const { RichEmbed } = require("discord.js");
const { token, interval, prefix, owner } = require('./config');


let Parser = require('rss-parser');
let parser = new Parser();

const client = new Discord.Client();

const FoxSources = ['http://feeds.foxnews.com/foxnews/latest', 'http://feeds.foxnews.com/foxnews/scitech', 'http://feeds.foxnews.com/foxnews/politics', 'http://feeds.foxnews.com/foxnews/health'];
const CNNSources = ['http://rss.cnn.com/rss/edition_space.rss', 'http://rss.cnn.com/rss/edition_technology.rss','http://rss.cnn.com/rss/edition_world.rss', 'http://rss.cnn.com/rss/edition.rss', 'http://rss.cnn.com/rss/edition_travel.rss'];
const SpaceSources = ["https://www.space.com/feeds/all"];

let allSources = [FoxSources,CNNSources,SpaceSources];

let initSeed, newsSeed; 
let doneNews = [];
let _channels = [];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.users.get(owner).send(`${client.user.username} has restarted`);
});

// Returns a random number based on an array's index
let randIndex = array => {
    return Math.floor((Math.random() * (array.length)));
}

// Returns current date
let today = () => {
    let _date = new Date();
    let dd = _date.getDate();
    let mm = _date.getMonth()+1; //January is 0!
    let yyyy = _date.getFullYear();
    if(dd<10) {dd = '0'+dd} 
    if(mm<10) {mm = '0'+mm} 
    return dd + '/' + mm + '/' + yyyy;
}

// Gets the right logo for each respective news outlet
let _setThumbnail = provider => {
    let _setUrl;
    let splicedProvider = provider.split(" ");
    switch(splicedProvider[0]){
        case "FOX":
        _setUrl = "https://cdn.discordapp.com/attachments/611471116589989889/616694437975949313/118508.png";
        break;
        case "Space.com":
        _setUrl = "https://cdn.discordapp.com/attachments/611471116589989889/616744455453802506/4707531.png"; 
        break;
        case "CNN.com":
        _setUrl = "https://cdn.discordapp.com/attachments/611471116589989889/616747868358836450/3298.png";
        break;
        default:
        _setUrl = client.user.avatarURL;
    }
    return _setUrl;
}

client.on('message', async message => {
    let msg = message.content.toLowerCase();
    if(message.channel.type == "dm"){
        if(message.author.bot)return
        if(msg == `${prefix}invite`){
            let invite = new RichEmbed()
            .setColor('#FFFFFF')
            .setAuthor(`HI ${message.author.username}, I post news and updates!`, client.user.avatarURL)
            .setThumbnail(client.user.avatarURL)
            .addField("If you want to invite me in your guild,\nyou may authorize me with this link:", "https://discordapp.com/api/oauth2/authorize?client_id=616755334933119002&permissions=2048&scope=bot")
            .addField("If you do, simply ping me for instructions", "I hope I can help keep you updated with news!")
            .setFooter(`This application is brought to you by ${client.users.get(owner).tag}`)
            message.channel.send(invite);
        }else{
        message.channel.send(`Hello there, I am ${client.user.username}. Nice to meet you, ${message.author.username}. \nIf you are interested to use my features for your guild and deliver news, do ${prefix}invite`);
        }
    return;  
    } 
    if((msg == `${prefix }assignnews` && (message.member.hasPermission('MANAGE_CHANNELS')))){
        if(_channels.includes(message.channel.id)){
            message.channel.send("News will no longer be sent in this channel");
                _channels = _channels.filter( _specifiedChannel => {
                    return _specifiedChannel != message.channel.id;
                });
        }else{
            _channels.push(message.channel.id);
            message.channel.send("News will now be sent in this channel.");
            await client.users.get(owner).send(`Channel ID: \`${message.channel.id}\` added to cache from Guild \`${message.guild.name}\``)
        }
    }
    if (message.content == client.user && message.member.hasPermission('MANAGE_CHANNELS')){
        let help = new RichEmbed()
        .setAuthor("News-bot at your service.", client.user.avatarURL)
        .setThumbnail(client.user.avatarURL)
        .setColor("#FFFFFF")
        .addField(`My prefix is: \`${prefix}\``,`${client.user.username} sends news and updates from CNN, \n FOX news, and Space.com every 10 minutes or so`)
        .addField(`To register a channel do, ${prefix}assignnews`, "Please be informed that you need at least\n\"MANAGE MESSAGES\" permission to do so")
        .addField(`If you are interested to have ${client.user.username} in your server,`, `Please dm me with ${prefix}invite for details` )
        .setFooter(`This application is brought to you by ${client.users.get(owner).tag}`)

        message.channel.send(help);
    }
});

let _rss = async (source) => {

    // Parses the URL into JSON
    this.feed = await parser.parseURL(source);
    this.article_title = [];
    this.article_link = [];
    this.article_description= [];
    this.article_postedAt = [];

    // Iterates over items in the Parsed url 
    this.feed.items.forEach(item => {
        this.article_title.push(item.title);
        this.article_link.push(item.link);
        this.article_description.push(item.contentSnippet);
        item.pubDate ? this.article_postedAt.push(item.pubDate) : this.article_postedAt.push(today());
    });
    
    // Checks if Content title is posted already; If true, will reiterate again from the beginning 
    if(doneNews.includes(this.article_title[this.index])) {
        // console.log("Already Posted, Will look for other articles");
        await redo();
        return;
    }    
    // Assigns a value based on the number of items in the parsed rss to be used as the base index
    this.index = await randIndex(this.feed.items);


    // Creates RichEmbed object with respective formatting
    this.news = new RichEmbed()
    .setAuthor(this.feed.title.includes("CNN") ? this.feed.title = "CNN.com" : this.feed.title, client.user.avatarURL)
    .setThumbnail(_setThumbnail(this.feed.title))
    .setColor('#4B0000')
    .addField(this.article_title[this.index], `${this.article_description[this.index] ? this.article_description[this.index] : "No descriptions."}`)
    .addField("Read this story:", this.article_link[this.index])
    .setFooter(`News-Bot does not represent nor endorse ` + `${this.feed.title.includes("CNN") ? this.feed.title = "CNN.com" : this.feed.title}` + `. • ${this.article_postedAt[this.index].includes("+0000") ? this.article_postedAt[this.index].replace("+0000","GMT")   : this.article_postedAt[this.index] }`)  
    
    if(_channels.length == 0) return console.log("No News channels are currently listed, please assign channels");
    doneNews.push(this.article_title[this.index]);
    console.log(doneNews.length);
    
    // Sends news to registered channels
    _channels.forEach(channel_ids => {
        client.channels.get(channel_ids).send(this.news);
    });
}


setInterval(()=>{

    // Randomly chooses between CNN, FOX, and Space.com (gives equal probabilities for these categories)
    initSeed = randIndex(allSources);

    // Then randomly chooses which rss site to parse
    newsSeed = allSources[initSeed][randIndex(allSources[initSeed])];
    
    _rss(newsSeed);
    // Resets the array once it reaches assigned threshold
    if(doneNews.length >= 128){doneNews = []};
},parseInt(interval));

// Function basically do the task again
let redo = () => {
    // Randomly chooses between CNN, FOX, and Space.com (gives equal probabilities for these categories)
    initSeed = randIndex(allSources);

    // Then randomly chooses which rss site to parse
    newsSeed = allSources[initSeed][randIndex(allSources[initSeed])];
        
    _rss(newsSeed);
    // console.log("Redone successful!")
}

// Logs in the client
client.login(token);
