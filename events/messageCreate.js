const { Events } = require('discord.js');

const { honeypotChannelID } = require('../config.json');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.id == message.client.user.id) {
			return;
		}
		if (message.channelId == honeypotChannelID) {
			if (message.member.bannable) {
				message.member.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: 'Honeypot' })
  				.then(console.log)
  				.catch(console.error);
			}
		}
	},
};