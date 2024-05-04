import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import MySuperClient from "../../classes/MySuperClient";

/**
 * Connects the bot to a voice channel that the user is connected to.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription(
      "Disconnects the music bot from a voice channel, if it is connected."
    ),
  async execute(
    client: MySuperClient,
    interaction: ChatInputCommandInteraction
  ) {
    let message: string | undefined = undefined;
    try {
      if (interaction.guildId) {
        const conn = getVoiceConnection(interaction.guildId);
        if (conn) {
          conn?.destroy();
          message = "Disconnected!";
        } else {
          message = "?";
        }
      }
    } catch {}

    await interaction.reply({ content: message, ephemeral: true });
  },
};
