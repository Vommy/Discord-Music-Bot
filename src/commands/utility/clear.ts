import { useQueue } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the song queue."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      if (interaction.guild.id) {
        const queue = useQueue(interaction.guild.id);
        if (queue) queue.tracks.clear();
        await interaction.reply(`Song Queue Cleared!`);
      }
    }
  },
};
