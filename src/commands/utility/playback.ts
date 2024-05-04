const { useHistory } = require("discord-player");
import { GuildQueueHistory } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playback")
    .setDescription("Plays the previous song in the queue, if there is one."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      if (interaction.guild.id) {
        const history: GuildQueueHistory = useHistory(interaction.guild.id);
        if (history) {
          if (history.previousTrack) {
            await history.previous();
            await interaction.reply(
              `Running it back to the previous song: ${history.previousTrack.title}`
            );
          }
        }
        await interaction.reply(`Playback error: No previous song found.`);
      }
    }
  },
};
