import { GuildQueue, Track } from "discord-player";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";

const { useQueue } = require("discord-player");

function getPlaylists(queue: GuildQueue) {
  if (!queue || !queue.tracks.size) {
    return null; // Queue is empty or not found
  }

  let tracks = queue.tracks.filter((track) => track.playlist != undefined);

  const uniquePlaylistNames: string[] = [];
  tracks.forEach((track) => {
    if (track.playlist && !uniquePlaylistNames.includes(track.playlist.title)) {
      uniquePlaylistNames.push(track.playlist.title);
    }
  });

  uniquePlaylistNames.sort();

  return uniquePlaylistNames;
}

/**
 * Potential fix: Add the URL of the playlist in the removal comparison so that playlists with the same name will not be deleted.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current track.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("playlist")
        .setDescription("The name of the playlist to skip.")
        .setAutocomplete(true)
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    if (interaction.guild) {
      const queue: GuildQueue = useQueue(interaction.guild.id);
      const choices = getPlaylists(queue);
      if (choices) {
        const filtered = choices.filter((choice) =>
          choice.startsWith(focusedValue)
        );
        await interaction.respond(
          filtered.map((choice) => ({ name: choice, value: choice }))
        );
      } else await interaction.respond([]);
    }
  },
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      const queue: GuildQueue = useQueue(interaction.guild.id);
      await interaction.deferReply();
      if (queue && queue.currentTrack) {
        let song = queue.currentTrack;
        let playlistSkip = interaction.options.getString("playlist");
        let validPlaylist = true;
        let isPartPlaylist = false;
        let skipOn = queue.repeatMode;
        if (skipOn) queue.setRepeatMode(0);
        if (playlistSkip) {
          const playlists = getPlaylists(queue);
          if (playlists?.includes("playlistSkip")) {
            queue.tracks.remove(
              (track) =>
                track.playlist != undefined &&
                track.playlist.title === playlistSkip
            );
            console.log(`Tracks left in the queue: ${queue.tracks.size}`);
            if (song.playlist?.title === playlistSkip) {
              console.log(
                `${song.title} is part of a playlist called ${song.playlist?.title}. Skipping song...`
              );
              queue.node.skip();
              isPartPlaylist = true;
            }
          } else validPlaylist = false;
        } else queue.node.skip();
        if (skipOn && skipOn > 1) queue.setRepeatMode(skipOn);
        let nextSong: Track | undefined;
        if (queue.node.getTrackPosition(song) < queue.size - 1) {
          let nextSongPos = queue.node.getTrackPosition(song) + 1;
          nextSong = queue.tracks.at(nextSongPos);
        }
        if (!validPlaylist) {
          await interaction.followUp(
            `**No playlists were found with the name**:\n> \`${playlistSkip}\``
          );
        } else if (playlistSkip && isPartPlaylist) {
          if (nextSong)
            await interaction.followUp(
              `**${"Playlist Skipped"}**:\n> \`${
                song.playlist?.title
              }\`\n\n**${"Up next"}**:\n> \`${nextSong?.title} by ${
                nextSong?.author
              }\``
            );
          else
            await interaction.followUp(
              `**${"Playlist Skipped"}**:\n > \`${song}\`\n\n**No more songs in the queue.**`
            );
        } else if (playlistSkip && !isPartPlaylist) {
          if (nextSong)
            await interaction.followUp(
              `**${"Playlist skipped"}**:\n> \`${playlistSkip}\`\n\n**${"Up next"}**:\n> \`${
                nextSong.title
              } by ${nextSong.author}\``
            );
          else
            await interaction.followUp(
              `**${"Playlist skipped"}**:\n> \`${playlistSkip}\`\n\n*__This is the final song__*`
            );
        } else {
          if (nextSong)
            await interaction.followUp(
              `**${"Skipped"}**:\n> \`${
                song.title
              }\`\n\n**${"Up next"}**:\n> \`${nextSong?.title} by ${
                nextSong?.author
              }\``
            );
          else
            await interaction.followUp(
              `**${"Skipped"}**:\n > \`${song}\`\n\n**No more songs in the queue.**`
            );
        }
      } else
        await interaction.followUp(
          `**/skip Error**: *There are no songs to skip.*\n> Please play a song first, using \`/play\`.`
        );
    }
  },
};
