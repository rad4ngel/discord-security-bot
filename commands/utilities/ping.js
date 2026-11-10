const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.setDescriptionLocalizations({
			'es-ES': 'Responde con Pong!',
		}),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};