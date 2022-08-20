const { SlashCommandBuilder, underscore, bold } = require('discord.js')
const { SCRIM_CHANNEL } = require('../../utils/staticVars')
const scrimsSchema = require('../../models/scrimQueue')

module.exports = {
    data: new SlashCommandBuilder().setName('scrims').setDescription('Base command for scrims queue')
        .addSubcommand(subcommand => subcommand.setName('join').setDescription('Joins the queue for scrims'))
        .addSubcommand(subcommand => subcommand.setName('leave').setDescription('Leaves the queue for scrims'))
        .addSubcommand(subcommand => subcommand.setName('create').setDescription('Creates a new queue'))
        .addSubcommand(subcommand => subcommand.setName('destroy').setDescription('Clears the queue'))
        .addSubcommand(subcommand => 
            subcommand.setName('add').setDescription('Adds the member to the queue')
                .addUserOption(option => option.setName('target').setDescription('The person to add to the scrims queue').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove').setDescription('Removes the member from the queue')
                .addUserOption(option => option.setName('target').setDescription('The person to remove from the scrims queue').setRequired(false))
        )
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply()
        const doc = await scrimsSchema.findOne()
        switch (interaction.options.getSubcommand()) {
            case 'join':
                if (!doc) {
                    interaction.editReply({ content: 'There is no current queue', ephemeral: true })
                    break
                }

                interaction.guild.channels.fetch(SCRIM_CHANNEL).then(channel => {
                    channel.messages.fetch(doc.message).then(message => {
                        if (message.mentions.users.has(interaction.user)) {
                            interaction.editReply({ content: `You're already in the queue`, ephemeral: true })
                            return
                        }

                        const newMessage = `${message.content}\n${interaction.user}`
                        message.edit(newMessage)
                    })
                })
                interaction.editReply({ content: 'Added you to the queue', ephemeral: true })
                break
            case 'leave':
                if (!doc) {
                    interaction.editReply({ content: 'There is no current queue', ephemeral: true })
                    break
                }

                interaction.guild.channels.fetch(SCRIM_CHANNEL).then(channel => {
                    channel.messages.fetch(doc.message).then(message => {
                        if (!message.mentions.users.has(interaction.user)) {
                            interaction.editReply({ content: `You're not in the queue`, ephemeral: true })
                            return
                        }

                        const newMessage = message.content.replace(`${interaction.user}`, '')
                        message.edit(newMessage)
                    })
                })
                interaction.editReply({ content: `Removed you from the queue`, ephemeral: true })
                break
            case 'create':
                if (doc) {
                    interaction.editReply('There is already a queue active. Please use the destroy command to clear all queues')
                    break
                }

                interaction.guild.channels.fetch(SCRIM_CHANNEL).then(channel => {
                    channel.send(bold(underscore('Current Queue'))).then(message => {
                        message.pin()
                        new scrimsSchema({ message: message.id }).save()
                    })
                })
                interaction.editReply({ content: `Created a queue in ${channel}`, ephemeral: true })
                break
            case 'destroy':
                if (!doc) {
                    interaction.editReply(`There aren't any queues active`)
                    break
                }

                interaction.guild.channels.fetch(SCRIM_CHANNEL).then(async (channel) => {
                    const { message } = await channel.messages.fetch(doc.message)
                    message.delete()
                    scrimsSchema.deleteMany()
                })
                interaction.editReply({ content: `Deleted the queue`, ephemeral: true })
                break
            case 'add':
                if (!doc) {
                    interaction.editReply({ content: 'There is no current queue', ephemeral: true })
                    break
                }

                const toAdd = interaction.options.getUser('target')

                interaction.guild.channels.fetch(SCRIM_CHANNEL).then(channel => {
                    channel.messages.fetch(doc.message).then(message => {
                        if (message.mentions.users.has(toAdd)) {
                            interaction.editReply({ content: `That person is already in the queue`, ephemeral: true })
                            return
                        }

                        const newMessage = `${message.content}\n${toAdd}`
                        message.edit(newMessage)
                    })
                })
                interaction.editReply({ content: `Added ${toAdd} to the queue`, ephemeral: true })
                break
            case 'remove':
                if (!doc) {
                    interaction.editReply({ content: 'There is no current queue', ephemeral: true })
                    break
                }

                let toRemove = interaction.options.getUser('target')

                interaction.guild.channels.fetch(SCRIM_CHANNEL).then(channel => {
                    channel.messages.fetch(doc.message).then(message => {
                        if (toRemove !== null && !message.mentions.users.has(toRemove)) {
                            interaction.editReply({ content: `That person isn't in the queue`, ephemeral: true })
                            return
                        }

                        if (!toRemove)
                            toRemove = message.mentions.users.first()

                        const newMessage = message.content.replace(`${toRemove}`, '')
                        message.edit(newMessage)
                    })
                })
                interaction.editReply({ content: `Removed ${toRemove} from queue`, ephemeral: true })
                break
            default:
                break
        }
    }
}