import { useQueue } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the songs in the queue."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      if (interaction.guild.id) {
        const queue = useQueue(interaction.guild.id);
        if (queue) {
          queue.tracks.shuffle();
          await interaction.reply(`**Song Queue Shuffled!**`);
        } else
          await interaction.reply(
            `**/shuffle Error**: *There are no songs to shuffle.*\n> Please queue or play some songs, then try again.`
          );
      }
    }
  },
};
