const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { verifyRoleID } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('captchasolve')
		.setNameLocalizations({
			'es-ES': 'resolvercaptcha',
		})
		.setDescription('Solve the captcha to authenticate')
		.setDescriptionLocalizations({
			'es-ES': 'Responde el captcha para autenticarte',
		})
		.addStringOption((option) =>
			option
				.setName('answer')
				.setDescription('See the image')
				.setNameLocalizations({
					'es-ES': 'respuesta',
				})
				.setDescriptionLocalizations({
					'es-ES': 'Mira la imagen',
				})
				.setRequired(true)),
	async execute(interaction) {
		const verifying = {
			'es-ES': 'Verificando respuesta...',
		};
		const verified = {
			'es-ES': 'Verificado, ya puedes cambiar de canal',
		};
		const wrong = {
			'es-ES': 'Respuesta incorrecta, intenta de nuevo',
		};
		const not_init = {
			'es-ES': 'Primero usa el comando */gencaptcha*',
		};
		await interaction.reply({
			content: verifying[interaction.locale] ?? 'Verifying answer...',
			flags: MessageFlags.Ephemeral,
		});
		if (interaction.client.captchas.has(interaction.user.id)) {
			const answer = interaction.options.getString('answer');
			if (interaction.client.captchas.get(interaction.user.id).text == answer) {
				clearTimeout(interaction.client.captchas.get(interaction.user.id).timeout);
				interaction.client.captchas.delete(interaction.user.id);
				interaction.member.roles.add(verifyRoleID);
				interaction.editReply({
					content: verified[interaction.locale] ?? 'Verified, you can switch channel',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.editReply({
					content: wrong[interaction.locale] ?? 'Wrong answer, try again',
					flags: MessageFlags.Ephemeral,
				});
			}
		} else {
			await interaction.editReply({
				content: not_init[interaction.locale] ?? 'First use the */captchagen* command',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};