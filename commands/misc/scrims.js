const { SlashCommandBuilder, underscore, bold } = require('discord.js')
const scrimsSchema = require('../../models/scrimQueue')
const { checkOwner } = require('../../utils/utils')

module.exports = {
    data: new SlashCommandBuilder().setName('scrims').setDescription('Base command for scrims queue')
        .addSubcommand(subcommand => subcommand.setName('join').setDescription('Joins the queue for scrims'))
        .addSubcommand(subcommand => subcommand.setName('leave').setDescription('Leaves the queue for scrims'))
        .addSubcommand(subcommand => subcommand.setName('create').setDescription('Creates a new queue')
            .addChannelOption(option => option.setName('channel').setDescription('The channel you want to create the queue in').setRequired(true))
        )
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
        await interaction.deferReply({ ephemeral: true })
        const doc = await scrimsSchema.findOne()
        let channel
        switch (interaction.options.getSubcommand()) {
            case 'join':
                if (!doc) {
                    interaction.editReply('There is no current queue')
                    break
                }

                channel = interaction.guild.channels.resolve(doc.channel)

                channel.messages.fetch(doc.message).then(message => {
                    const { users } = message.mentions
                    if (users.has(interaction.user.id)) {
                        interaction.editReply(`You're already in the queue`)
                        return
                    }

                    const newMessage = `${message.content}\n${interaction.user}`
                    message.edit(newMessage)
                })
                interaction.editReply('Added you to the queue')
                break
            case 'leave':
                if (!doc) {
                    interaction.editReply('There is no current queue')
                    break
                }

                channel = interaction.guild.channels.resolve(doc.channel)

                channel.messages.fetch(doc.message).then(message => {
                    const { users } = message.mentions
                    if (!users.has(interaction.user.id)) {
                        interaction.editReply(`You're not in the queue`)
                        return
                    }

                    const newMessage = message.content.replace(`<@${interaction.user.id}>`, '')
                    message.edit(newMessage)
                })
                interaction.editReply(`Removed you from the queue`)
                break
            case 'create':
                if (!checkOwner(interaction)) {
                    interaction.editReply('Only Bob is allowed to use this command')
                    return
                }
                if (doc) {
                    interaction.editReply('There is already a queue active. Please use the destroy command to clear all queues')
                    break
                }

                channel = interaction.options.getChannel('channel', true) 

                const ch = interaction.guild.channels.resolve(channel.id)
                ch.send(bold(underscore('Current Queue'))).then(async (message) => {
                    try {
                        await message.pin()
                    } catch (e) {}
                    new scrimsSchema({ channel: channel.id, message: message.id }).save()
                })
                interaction.editReply(`Created a queue in ${channel}`)
                break
            case 'destroy':
                if (!checkOwner(interaction)) {
                    interaction.editReply('Only Bob is allowed to use this command')
                    return
                }
                if (!doc) {
                    interaction.editReply(`There aren't any queues active`)
                    break
                }

                channel = interaction.guild.channels.resolve(doc.channel)

                channel.messages.fetch(doc.message).then(async (message) => {
                    await message.delete()
                    await scrimsSchema.deleteMany()
                })
                interaction.editReply(`Deleted the queue`)
                break
            case 'add':
                if (!doc) {
                    interaction.editReply('There is no current queue')
                    break
                }

                const toAdd = interaction.options.getUser('target')

                channel = interaction.guild.channels.resolve(doc.channel)

                channel.messages.fetch(doc.message).then(message => {
                    const { users } = message.mentions
                    if (users.has(toAdd.id)) {
                        interaction.editReply(`That person is already in the queue`)
                        return
                    }

                    const newMessage = `${message.content}\n${toAdd}`
                    message.edit(newMessage)
                })
                interaction.editReply(`Added ${toAdd} to the queue`)
                break
            case 'remove':
                if (!doc) {
                    interaction.editReply('There is no current queue')
                    break
                }

                let toRemove = interaction.options.getUser('target')

                channel = interaction.guild.channels.resolve(doc.channel)
                channel.messages.fetch(doc.message).then(message => {
                    const { users } = message.mentions
                    if (toRemove !== null && !users.has(toRemove.id)) {
                        interaction.editReply(`That person isn't in the queue`)
                        return
                    }

                    if (!toRemove)
                        toRemove = message.mentions.users.first()

                    const newMessage = message.content.replace(`<@${toRemove.id}>`, '')
                    message.edit(newMessage)
                })
                interaction.editReply(`Removed ${toRemove} from queue`)
                break
            default:
                break
        }
    }
}