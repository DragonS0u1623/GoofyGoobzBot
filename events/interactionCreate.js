module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            console.log('Interaction is button')
        }

        if (!interaction.isChatInputCommand()) return

        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) return

        try {
            await command.execute(interaction)
        } catch (err) {
            console.error(err)
        }
    }
}