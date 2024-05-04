const { SlashCommandBuilder } = require("@discordjs/builders");
import { Player } from "discord-player";
const { useMainPlayer, useQueue } = require("discord-player");

import {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

/**
 * Connects the bot to a voice channel that the user is connected to.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays music.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("audio_url")
        .setDescription("The URL of the audio resource.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // FIX: NEED TO CHECK IF THERE IS AN EXISTING QUEUE.
    const player: Player = useMainPlayer();
    await player.extractors.loadDefault();
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (member) {
      const channel = member.voice.channel;
      if (!channel) {
        return interaction.reply({
          content: `You are not connected to a voice channel.`,
          ephemeral: true,
        });
      }
      const audio = interaction.options.getString("audio_url");
      if (audio) {
        await interaction.deferReply();

        const queue = useQueue(interaction.guild?.id);

        try {
          const { track } = await player.play(channel, audio, {
            nodeOptions: {
              // nodeOptions are the options for guild node (aka your queue in simple word)
              metadata: interaction, // we can access this metadata object using queue.metadata later on
            },
          });
          return interaction.followUp(`Now playing: **${track.title}**`);
        } catch (e) {
          // let's return error if something failed
          return interaction.followUp(`Something went wrong: ${e}`);
        }
      }
      return interaction.reply("Error: Could not find song!");
    }
    return interaction.reply("Error: Could not find member!");
  },
};
