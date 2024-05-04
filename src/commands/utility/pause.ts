const { SlashCommandBuilder } = require("@discordjs/builders");
import { GuildQueue, Player } from "discord-player";
const { useQueue } = require("discord-player");

import {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the current audio."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      const queue: GuildQueue = useQueue(interaction.guild.id);
      queue.node.setPaused(!queue.node.isPaused());
      if (queue.node.isPaused())
        await interaction.reply(`Paused playback of : ${queue.currentTrack}`);
      else
        await interaction.reply(`Resumed playback of : ${queue.currentTrack}`);
    }
  },
};
