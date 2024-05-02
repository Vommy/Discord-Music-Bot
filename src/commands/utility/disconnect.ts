import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  VoiceChannel,
} from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

/**
 * Connects the bot to a voice channel that the user is connected to.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription(
      "Disconnects the music bot from a voice channel, if it is connected."
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guildId) {
      const conn = getVoiceConnection(interaction.guildId);
      conn?.destroy();
    }

    await interaction.reply("Disconnected");
  },
};
