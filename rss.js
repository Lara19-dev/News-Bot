// Require Discord.js Library
const Discord = require('discord.js');
const { token } = require('./config');

// Create client object and require RichEmbed
const client = new Discord.Client();
let { RichEmbed } = require('discord.js');

// Require RSS-parser and create object
let Parser = require('rss-parser');
let parser = new Parser();
const FoxSources = ['http://feeds.foxnews.com/foxnews/latest', ' http://feeds.foxnews.com/foxnews/scitech', ' http://feeds.foxnews.com/foxnews/politics', 'http://feeds.foxnews.com/foxnews/health'];
const CNNSources = ['http://rss.cnn.com/rss/edition_space.rss', ' http://rss.cnn.com/rss/edition_technology.rss', 'http://rss.cnn.com/rss/edition_world.rss', 'http://rss.cnn.com/rss/edition.rss', 'http://rss.cnn.com/rss/edition_travel.rss'];
let _channels = '571007246931066891';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


function chooseRandom(array){
    return array[Math.floor((Math.random() * Math.floor(array.length - 1)))];
}

function today(){
        // Date formatting
        let _date = new Date();
        var dd = _date.getDate();
        var mm = _date.getMonth()+1; //January is 0!
        var yyyy = _date.getFullYear();
        if(dd<10) {dd = '0'+dd} 
        if(mm<10) {mm = '0'+mm} 
        return dd + '/' + mm + '/' + yyyy;
}


// FOX News RSS
client.on('message', async message => {
    if(message.content == "!c news"){
    let news = new RichEmbed();
    let feed = await parser.parseURL(`${chooseRandom(FoxSources)}`);
    
    let article_title = [];
    let article_link = [];
    let article_description = [];


    feed.items.forEach(item => {
        article_title.push(item.title);
        article_link.push(item.link);
        article_description.push(item.contentSnippet);
    });

    // Using a randomizer to what news the bot chooses
    let index = await Math.floor((Math.random() * (feed.items.length - 1))); // chooseRandom(article_title);

    // Formatting the Embed
    news.setAuthor(feed.title, client.user.avatarURL)
    news.setThumbnail('https://cdn.discordapp.com/attachments/611471116589989889/616694437975949313/118508.png');
    news.setColor('#4B0000');
    news.addField(article_title[index], `${article_description[index] ? article_description[index] : "No descriptions."}`);    
    news.addField("Read this story:", article_link[index]);
    news.setFooter(`News-Bot does not represent nor endorse ` + feed.title + `. • ${today()}`);    
    client.channels.get(_channels).send(news);    
}
});

// Space.com RSS
client.on('message', async message => {
    if(message.content == "!c space"){
    let news = new RichEmbed();
    let feed = await parser.parseURL(`https://www.space.com/feeds/all`);
    
    let article_title = [];
    let article_link = [];
    let article_description = [];

    feed.items.forEach(item => {
        article_title.push(item.title);
        article_link.push(item.link);
        article_description.push(item.contentSnippet);
    });

    // Using a randomizer to what news the bot chooses
    let index = await Math.floor((Math.random() * (feed.items.length - 1)));

    // Formatting the Embed
    news.setAuthor(feed.title, client.user.avatarURL)
    news.setThumbnail('https://cdn.discordapp.com/attachments/611471116589989889/616744455453802506/4707531.png');
    news.setColor('#4B0000');
    news.addField(article_title[index], `${article_description[index] ? article_description[index] : "No descriptions."}`);    
    news.addField("Read this story:", article_link[index]);
    news.setFooter(`News-Bot does not represent nor endorse ` + feed.title + `. • ${today()}`);
    client.channels.get(_channels).send(news);    
}
});


// CNN
client.on('message', async message => {
    if(message.content == "!c cnn"){
    let news = new RichEmbed();
    let feed = await parser.parseURL(chooseRandom(CNNSources));
    
    let article_title = [];
    let article_link = [];
    let article_description = [];

    feed.items.forEach(item => {
        article_title.push(item.title);
        article_link.push(item.link);     
        article_description.push(item.contentSnippet);   
    });

    // Using a randomizer to what news the bot chooses
    let index = await Math.floor((Math.random() * (feed.items.length - 1))); // chooseRandom(article_title);
    
    // Formatting the Embed
    news.setAuthor(feed.title, client.user.avatarURL)
    news.setThumbnail('https://cdn.discordapp.com/attachments/611471116589989889/616747868358836450/3298.png');
    news.setColor('#4B0000');
    news.addField(article_title[index], `${article_description[index] ? article_description[index] : "No descriptions."}`);
    news.addField("Read this story:", article_link[index]);
    news.setFooter(`News-Bot does not represent nor endorse ` + feed.title + `. • ${today()}`);
    client.channels.get(_channels).send(news);    
}
});

client.login(token);
