import { GuildQueue, Player, SearchResult } from "discord-player";
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";

const { useQueue, useMainPlayer } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Queues a song to play.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("audio_url")
        .setDescription("The URL of the audio resource.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    let audio = interaction.options.getString("audio_url");
    if (interaction.guild && audio && audio.length) {
      const player: Player = useMainPlayer();
      const queue: GuildQueue = useQueue(interaction.guild.id);
      const searchResult = await player.search(audio, {
        requestedBy: interaction.user,
      });
      //ADD
      //Need to check if queue has a max size (not full)
      queue.insertTrack(searchResult.tracks[0], queue.getSize()); //Remember queue index starts from 0, not 1
      await interaction.reply(`Queued: **${searchResult.tracks[0].title}**`);
    }
  },
};
