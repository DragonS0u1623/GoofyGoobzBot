const { SlashCommandBuilder } = require('discord.js')
const skillSchema = require('../../models/skill')
const { checkBob } = require('../../utils/utils')

module.exports = {
    data: new SlashCommandBuilder().setName('skill').setDescription(`View or update a player's perceived loose skill`)
        .addSubcommand(subcommand => subcommand.setName('view').setDescription('Views the current skill value for the given member or yourself')
            .addUserOption(option => option.setName('target').setDescription('The person you want to view the skill value of').setRequired(false)))
        .addSubcommand(subcommand => subcommand.setName('win').setDescription('Adds a win to the target user')
            .addUserOption(option => option.setName('target').setDescription('The person to update the skill of').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('loss').setDescription('Adds a loss to the target user')
            .addUserOption(option => option.setName('target').setDescription('The person to update the skill of').setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply()
        const user = interaction.options.getUser('target') || interaction.user
        const doc = skillSchema.findOne({ memberId: user.id })
        let skill
        switch (interaction.options.getSubcommand()) {
            case 'view':
                if (!doc) {
                    interaction.editReply(`${user} doesn't have a skill rating entered in the database`)
                    return
                }

                interaction.editReply(`${user} has ${doc.wins} wins, ${doc.losses} losses, and a skill rating of ${doc.skill}`)
                break
            case 'win':
                if (!checkBob(interaction)) {
                    interaction.editReply({ content: 'You are not allowed to use this command.', ephemeral: true })
                    return
                }
                if (!doc) {
                    new skillSchema({
                        memberId: user.id,
                        wins: 1,
                        losses: 0,
                        skill: 1
                    }).save()
                    interaction.editReply({ content: `Updated ${user}'s wins. User now has 1 win and 0 losses`, ephemeral: true })
                    return
                }
                const wins = doc.wins + 1
                skill = wins / (wins + doc.losses)
                await skillSchema.findOneAndUpdate({ memberId: user.id }, { wins, skill })
                interaction.editReply({ content: `Updated ${user}'s wins. User now has ${wins} wins and ${doc.losses} losses with a skill rating of ${skill}`, ephemeral: true })
                break
            case 'loss':
                if (!checkBob(interaction)) {
                    interaction.editReply({ content: 'You are not allowed to use this command.', ephemeral: true })
                    return
                }
                if (!doc) {
                    new skillSchema({
                        memberId: user.id,
                        wins: 0,
                        losses: 1,
                        skill: 0
                    }).save()
                    interaction.editReply({ content: `Updated ${user}'s wins. User now has 1 win and 0 losses`, ephemeral: true })
                    return
                }
                const losses = doc.losses + 1
                skill = doc.wins / (doc.wins + losses)
                await skillSchema.findOneAndUpdate({ memberId: user.id }, { losses, skill })
                interaction.editReply({ content: `Updated ${user}'s losses. User now has ${doc.wins} wins and ${losses} losses with a skill rating of ${skill}`, ephemeral: true })
                break
        }
    }
}