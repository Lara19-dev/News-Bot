require('dotenv-flow').config();

module.exports = {
    token: process.env.TOKEN,
    owner: process.env.OWNER,
    botVersion: process.env.BOTVERSION,
    interval: process.env.INTERVAL,
    prefix: process.env.PREFIX
};
