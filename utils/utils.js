const { promisify } = require('util')
const glob = promisify(require('glob'))
const path = require('path')
const { REST } = require('@discordjs/rest')
const { ActivityType, Routes } = require('discord.js')
const { CLIENT_ID, BTHD_ID } = require('./staticVars')

const homePath = path.dirname(require.main?.filename || '')
const commandsPath = path.join(homePath, 'commands')
const eventsPath = path.join(homePath, 'events')

const status = [
    { name: 'the Goofy Goobz', type: ActivityType.Watching },
    { name: '', type: ActivityType.Playing }
]
const commands = []

module.exports = {
    checkBob(interaction) {
        if (interaction.user.id !== BTHD_ID) return false
        return true
    },
    async loadCommands(client) {
        return glob(`${commandsPath.replace(/\\/g, '/')}/**/*.js`).then((commandFiles) => {
			commandFiles.forEach(commandFile => {
				delete require.cache[commandFile]
				const command = require(commandFile)
				client.commands.set(command.data.name, command)
                commands.push(command.data.toJSON())
			})
        })
    },
    async loadEvents(client) {
        return glob(`${eventsPath.replace(/\\/g, '/')}/**/*.js`).then((events) => {
			for (const eventFile of events) {
				delete require.cache[eventFile]
				const event = require(eventFile)
				client.events.set(event.name, event)
				if (event.once)
                    client.once(event.name, (...args) => event.execute(...args))
                else
                    client.on(event.name, (...args) => event.execute(...args))
			}
		})
    },
    async loadSlashCommands() {
		console.log(commands)
		const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)
        try {
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
        } catch (error) {
            console.error(error)
        }
    },
    
}