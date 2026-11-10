const {
	SlashCommandBuilder,
	AttachmentBuilder,
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

const fs = require('fs');
const { createCaptchaSync } = require('captcha-canvas');

const { captchaTime } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('captchagen')
		.setNameLocalizations({
			'es-ES': 'gencaptcha',
		})
		.setDescription('Generate a captcha for autentication')
		.setDescriptionLocalizations({
			'es-ES': 'Genera un captcha para autenticarte',
		}),
	async execute(interaction) {
		const confirm_regen = {
			'es-ES': 'Regenerar captcha',
		};
		const cancel_regen = {
			'es-ES': 'Se acabo el tiempo, se cancelo la regeneracion del captcha',
		};
		const already = {
			'es-ES': 'Ya estas haciendo un captcha, si quieres generar otro pulsa el boton de abajo',
		};
		const generating = {
			'es-ES': 'Generando Captcha...',
		};
		const use_command = {
			'es-ES': 'Usa el comando **/resolvercaptcha** para verificarte',
		};
		async function gen_and_send() {
			if (interaction.client.captchas.has(interaction.user.id)) {
				const current_captcha = interaction.client.captchas.get(interaction.user.id);
				clearTimeout(current_captcha.timeout);
			}
			// Generate a 300x100 captcha
			const { image, text } = createCaptchaSync(300, 100);
			fs.writeFileSync('captcha.png', image);
			console.log('Captcha text:', text);
			const captcha_image = new AttachmentBuilder('./captcha.png', { name: 'captcha.png' });
			const captcha_timeout = setTimeout(() => {
				interaction.client.captchas.clear(interaction.user.id);
			}, captchaTime * 1000);
			interaction.client.captchas.set(interaction.user.id, { 'text': text, 'timeout': captcha_timeout });
			await interaction.editReply({
				content: use_command[interaction.locale] ?? 'Use the command **/solvecaptcha** to verify',
				files: [captcha_image],
				components: [],
				flags: MessageFlags.Ephemeral,
			});
		}
		if (interaction.client.captchas.has(interaction.user.id)) {
			const confirm = new ButtonBuilder().setCustomId('confirm').setLabel(confirm_regen[interaction.locale] ?? 'Regenerate captcha').setStyle(ButtonStyle.Primary);
			const row = new ActionRowBuilder().addComponents(confirm);
			const response = await interaction.reply({
				content: already[interaction.locale] ?? 'Already doing a captcha, if you want to generate a new one press the button below',
				components: [row],
				flags: MessageFlags.Ephemeral,
				withResponse: true,
			});
			const collectorFilter = (i) => i.user.id === interaction.user.id;

			try {
				const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
				if (confirmation.customId === 'confirm') {
					gen_and_send();
				}
			} catch {
				await interaction.editReply({ content: cancel_regen[interaction.locale] ?? 'Time out, canceled captcha regen', components: [], flags: MessageFlags.Ephemeral });
			}
		} else {
			await interaction.reply({
				content: generating[interaction.locale] ?? 'Generating captcha...',
				flags: MessageFlags.Ephemeral,
			});
			gen_and_send();
		}
	},
};