const colors = require('colors/safe')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${colors.yellow(client.user.tag)}`)
    }
}