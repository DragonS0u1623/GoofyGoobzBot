const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require('discord.js')
const { loadCommands, loadEvents, loadSlashCommands } = require('./utils/utils')
const mongo = require('./utils/mongo')
const { config } = require('dotenv')
config()

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
], partials = [
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember
]

const client = new Client({ 
    intents, 
    partials, 
    presence: {
        status: 'online',
        activities: [
            { name: 'the Goofy Goobz', type: ActivityType.Watching }
        ]
    }
})
client.commands = new Collection()
client.events = new Collection()

loadCommands(client).then(() => loadEvents(client).then(() => loadSlashCommands()))

mongo().then(() => console.log('Connected to MongoDB'))

client.login(process.env.TOKEN)