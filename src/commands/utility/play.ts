const { SlashCommandBuilder } = require("@discordjs/builders");
import MySuperClient from "../../classes/MySuperClient";

import {
  ChatInputCommandInteraction,
  CommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

/**
 * Connects the bot to a voice channel that the user is connected to.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("maisan")
    .setDescription("Plays music.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("audio_url")
        .setDescription("The URL of the audio resource.")
        .setRequired(true)
    ),
  async execute(
    client: MySuperClient,
    interaction: ChatInputCommandInteraction
  ) {
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (member && interaction.guild?.id) {
      const queue = await client.player.createQueue(interaction.guild?.id);
      if (!queue.connection && member.voice.channel)
        await queue.join(member.voice.channel);
      let url = interaction.options.getString("audio_url");
      if (url) {
        await queue.play(url).catch((err) => {
          console.log(err);
          let id = interaction.guild?.id;
          if (id !== undefined) {
            let guildQueue = client.player.getQueue(id);
            if (!guildQueue) queue.stop();
          }
        });
      }
    } else {
      let message = "Please connect to a voice channel.";
    }
  },
};
