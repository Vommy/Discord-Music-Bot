import { GuildQueue, Track } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const { EmbedBuilder } = require("discord.js");

const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("peek")
    .setDescription("Check the next track in the queue without skipping."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild && interaction.channel) {
      const queue: GuildQueue = useQueue(interaction.guild.id);
      await interaction.deferReply();
      if (queue && queue.currentTrack) {
        let song = queue.currentTrack;
        if (queue.node.getTrackPosition(song) < queue.size - 1) {
          let nextSongPos = queue.node.getTrackPosition(song) + 1;
          let nextSong = queue.tracks.at(nextSongPos);
          if (nextSong) {
            let songEmbed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle(`${nextSong.title}`)
              .setURL(`${nextSong.url}`)
              .setAuthor({
                name: `${nextSong.author}`,
                url: `${nextSong.url}`,
              })
              .setDescription(`${nextSong.description}`)
              .setThumbnail(`${nextSong.thumbnail}`);
            await interaction.channel.send({ embeds: [songEmbed] });
          }

          await interaction.followUp(
            `**${"Up next"}**:\n> \`${nextSong?.title} by ${nextSong?.author}\``
          );
        } else {
          await interaction.followUp(
            `**This is the final song! No additional songs in the queue.**`
          );
        }
      } else
        await interaction.reply(
          `**/peek Error**: *There are no songs in the queue to peek.*\n> Please play a song first, using \`/play\`.`
        );
    }
  },
};
