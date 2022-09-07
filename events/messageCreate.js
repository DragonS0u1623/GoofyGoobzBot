const { BUTCHER, BTHD_ID } = require('../utils/staticVars')

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return
        if (message.channel.id === BUTCHER && message.mentions.users.has(BTHD_ID)) await message.pin()
    }
}