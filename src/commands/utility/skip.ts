import { GuildQueue } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current track."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      const queue: GuildQueue = useQueue(interaction.guild.id);
      await interaction.deferReply();
      if (queue && queue.currentTrack) {
        let song = queue.currentTrack;
        if (song.playlist?.title)
          console.log(
            `This song is part of a playlist called ${song.playlist?.title}.`
          );
        queue.node.skip();
        if (queue.node.getTrackPosition(song) < queue.size - 1) {
          let nextSongPos = queue.node.getTrackPosition(song) + 1;
          let nextSong = queue.tracks.at(nextSongPos);
          await interaction.followUp(
            `**${"Skipped"}**:\n> \`${song}\`\n\n**${"Now playing"}**:\n> \`${
              nextSong?.title
            } by ${nextSong?.author}\``
          );
        } else {
          await interaction.followUp(
            `**${"Skipped"}**:\n > \`${song}\`\n\n**No more songs in the queue.**`
          );
        }
      } else
        await interaction.reply(
          `**/skip Error**: *There are no songs to skip.*\n> Please play a song first, using \`/play\`.`
        );
    }
  },
};
