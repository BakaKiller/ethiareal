const Discord = require('discord.js');
const client = new Discord.Client();
const jsonfile = require('jsonfile');
const fs = require('fs');
const request = require('request');

let config = require('./settings.js');
let help;
let message;
let messageparts;

let prefix = config.prefix;
let gifs;
let alertnsfw = "Ce chan n'est pas nsfw ! Vous ne voulez quand même pas invoquer de telles choses à la vue de tous ? :open_mouth:";
let search;
let cansearch;
let searcharray;
let forbiddenkeywords = [
    'loli',
    'lolicon',
    'shota',
    'shotacon',
    'underage',
    'child',
    'children',
    'rape',
    'pedo',
    'pedophilia',
    'zoophilia',
    'bestiality',
    'vore'
];


// EVENTS **************************************************************************************************************

config.on('ready', function() {
    //get gifs list
    request.get(config.jsonaddress + '/gifs.json', function(error, response, body) {
        if (!error && response.statusCode === 200) {
            gifs = JSON.parse(body);
        }
    });

    // get help
    request.get(config.jsonaddress + '/help.json', function(error, response, body) {
        if (!error && response.statusCode === 200) {
            let helpjson = JSON.parse(body);
            let localhelp = '';
            for (let key in helpjson) {
                if (!helpjson.hasOwnProperty(key)) {
                    continue;
                }
                localhelp += '`' + key + '`    ' + helpjson[key] + "\n";
            }
            help = config.helpintro + localhelp + config.helpoutro;
            help = help.replace('{{prefix}}', config.prefix);
        }
    });

    // add guild member add and remove functions
    if (config.welcomechan) {
        client.on('guildMemberAdd', function (member) {
            member.guild.channels.get(config.welcomechan).send('Bienvenue à l\'Académie Ethiareal <@' + member.id + '> !');
        });

        client.on('guildMemberRemove', function (member) {
            member.guild.channels.get(config.welcomechan).send('Au revoir, en espérant te revoir un jour, ' + member.user.tag + '...');
        });
    }

    client.login(config.token);
});

client.on('ready', function () {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageDelete', function(msg) {
    if (msg.author.id === "130453221331173386") {
        msg.channel.send('<@' + msg.author.id + '> a écrit mais n\'a pas assumé :\n```\n' + msg.content + '\n```')
    }
});

client.on('message', msg => {
    if (msg.guild) {
        if (msg.guild.id === '332988697630736394') {
            msg.guild.members.get('301069123591471114').setNickname(msg.guild.members.get('301069123591471114').nickname.toLowerCase());
        }
    }
    if (msg.content.substr(0, prefix.length) === prefix) {
        if (msg.author.id === "163688614205718528") {
            msg.channel.send('Très bien, ô grande maîtresse, je m\'exécute sur le champs.');
        }
        message = (msg.content.substr(prefix.length)).toLowerCase();
        messageparts = message.split(' ');
        switch (messageparts[0]) {
            case 'ping':
                msg.reply('Pong !');
                break;
            case 'pong':
                msg.reply('Ping !');
                break;
            case 'setprefix':
                if (isadmin(msg.author.id)) {
                    config.prefix = messageparts[1];
                    prefix = config.prefix;
                    msg.reply('Bien reçu ! Maintenant, pour m\'appeler, utilisez le préfixe "' + prefix + '" !');
                } else {
                    msg.reply('Déso pas déso, seuls les admins ont un pouvoir sur moi !');
                }
                break;
            case 'hug':
                let hug;
                if (messageparts[1] !== undefined && messageparts[1].substr(0, 2) === '<@') {
                    hug = '<@!' + msg.author.id + '> a envoyé un câlin à ' + messageparts[1] + ' ! ';
                } else {
                    hug = 'Câlin !';
                }
                msg.channel.send(hug);
                msg.channel.send(getgif('hug'));
                break;
            case 'pat':
            case 'blanked':
            case 'nimunimu':
            case 'slap':
            case 'cry':
            case 'nyan':
            case 'muahaha':
            case 'owo':
            case 'poke':
            case 'kiss':
            case 'lick':
            case 'jojo':
            case 'nibble':
            case 'facepalm':
            case 'clap':
            case 'pout':
            case 'blush':
            case 'smile':
            case 'stare':
            case 'pantsu':
            case 'sparkles':
            case 'highfive':
                msg.channel.send(getgif(messageparts[0]));
                break;
            case 'nsfw':
                msg.channel.send(getnsfwgif(msg.channel, messageparts[0]));
                break;
            case 'gelbooru':
                if (!msg.channel.nsfw && msg.channel.type !== 'dm') {
                    msg.reply(alertnsfw);
                } else {
                    cansearch = true;
                    search = message.substr(messageparts[0].length);
                    searcharray = search.split(' ');
                    for (let i = 0; i < searcharray.length; i++) {
                        if (forbiddenkeywords.includes(searcharray[i])) {
                            msg.channel.send(msg.guild.roles.find("name", "Admin") + ' C\'est mal, non ?\n```\nMessage de ' + msg.author.tag + ':\n' + msg.content + '```');
                            cansearch = false;
                        }
                    }
                    if (cansearch) {
                        getgelbooru(search, msg.channel);
                    }
                }
                break;
            case 'help':
                msg.author.send(help);
                break;
            case 'end':
                msg.channel.send(get_ultimatum());
        }
    }
});


// LIB *****************************************************************************************************************

function isadmin(userid) {
    return (config.adminusers[userid] !== undefined);
}

function get_ultimatum() {
    return 'Hein ? Quoi ? Non, cette fonction n\'existe pas non <<';
}

function getgif(type) {
    return gifs[type][Math.floor(Math.random() * gifs[type].length)];
}

function getnsfwgif(chan, type) {
    if (chan.type !== 'text' || (chan.type === 'text' && chan.nsfw)) {
        return getgif(type);
    } else {
        return alertnsfw;
    }
}

function getgelbooru(search, chan) {
    request.get('https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=' + search, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.length > 0) {
                let images = JSON.parse(body);
                let img = null;
                let id = null;
                let tags = null;
                do {
                    if (images.length < 1) {
                        img = false;
                        break;
                    }
                    id = Math.floor(Math.random() * images.length - 1) + 1;
                    if (id in images) {
                        img = images[id];
                        tags = img.tags.split(' ');
                        if (tags.includes('loli') || tags.includes('child') || tags.includes('children') || tags.includes('underage') || tags.includes('shotacon')) {
                            images.splice(id, 1);
                            img = false;
                        }
                    }
                } while (!img);
                if (!img) {
                    chan.send('Pardonnez-moi, je n\'ai rien trouvé de satisfaisant...');
                } else {
                    img = img.file_url.replace('\\', '');
                    chan.send('http:' + img);
                }
            } else {
                chan.send('Pardonnez-moi, je n\'ai rien trouvé de satisfaisant...');
            }
        }
    });
}