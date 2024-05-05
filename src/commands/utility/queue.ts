import { GuildQueue, Player } from "discord-player";
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
    if (interaction.guild && audio) {
      const player: Player = useMainPlayer();
      const queue: GuildQueue = useQueue(interaction.guild.id);
      if (queue) {
        const searchResult = await player.search(audio, {
          requestedBy: interaction.user,
        });
        let song = searchResult.tracks[0];
        if (queue.size < queue.getCapacity()) {
          queue.insertTrack(song, queue.getSize());
          await interaction.reply(
            `**${"Song queued"}**:\n> \`${song.title} by ${song.author}\``
          );
        } else {
          await interaction.reply(
            `**Queue is currently full with ${queue.size} tracks.**\n> Please wait for more room in the song queue, then try again. `
          );
        }
      } else
        await interaction.reply(
          `**${"/queue Error"}**: There are no active songs.\nPlease play a song first, using \`/play\`.`
        );
    }
  },
};
