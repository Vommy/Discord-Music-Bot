import { GuildQueue } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current audio."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      const queue: GuildQueue = useQueue(interaction.guild.id);
      let song = queue.currentTrack;
      queue.node.skip();
      await interaction.reply(`Skipped : **${song}**`);
    }
  },
};
