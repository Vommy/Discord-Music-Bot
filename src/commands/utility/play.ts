const { SlashCommandBuilder } = require("@discordjs/builders");
import { GuildQueue, Player, Playlist, Track } from "discord-player";
const { useMainPlayer, useQueue } = require("discord-player");

import {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

/**
 * Connects the bot to a voice channel that the user is connected to.
 * @fix If an incorrent URL or title is provided where the bot cannot find an appropriate resource,
 * then there will be a conflict with one of the interaction replies with the interaction replies of app.ts.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Plays a track or playlist in a voice channel, or queues the next track if a song is playing."
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("audio_title_uri")
        .setDescription(
          "The name of the song, playlist or URI to either a song or playlist."
        )
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
      let audio: string | Playlist | null =
        interaction.options.getString("audio_title_uri");
      if (audio) {
        await interaction.deferReply();

        const queue: GuildQueue = useQueue(interaction.guild?.id);
        const searchResult = await player.search(audio, {
          requestedBy: interaction.user,
        });

        // Need to check if what is being played is a playlist or a single song.
        if (searchResult.playlist) {
          console.log(
            `/play has found a playlist called ${searchResult.playlist}`
          );
          audio = searchResult.playlist;
        }

        if (!queue || (queue.size <= 1 && !queue.isPlaying)) {
          try {
            const { track } = await player.play(channel, audio, {
              nodeOptions: {
                // nodeOptions are the options for guild node (aka your queue in simple word)
                metadata: interaction, // we can access this metadata object using queue.metadata later on
                leaveOnStop: true, //If player should leave the voice channel after user stops the player
                leaveOnStopCooldown: 240000, //Cooldown in ms
                leaveOnEnd: true, //If player should leave after the whole queue is over
                leaveOnEndCooldown: 240000, //Cooldown in ms
              },
            });
            console.log("Playing audio");
            if (track.playlist)
              return interaction.followUp(
                `**Playlist added!**\n> \`${track.playlist.title} by ${track.playlist.author.name}\`\n**Now playing**:\n> \`${track.title} by ${track.author}\``
              );
            return interaction.followUp(
              `**${"Song added!"}**\n> \`${track.title} by ${track.author}\``
            );
          } catch (e) {
            console.error(`No Audio: ${e}`);
            return interaction
              .followUp({
                content: `**${"Something went wrong."}** We couldn't play your track.\n`,
                ephemeral: true,
              })
              .then(() => {
                interaction.followUp({
                  content: `Please try restarting the bot.`,
                  ephemeral: true,
                });
              });
          }
        } else {
          try {
            if (queue.currentTrack) {
              if (searchResult.playlist)
                //Need to check if the audio being queued is a playlist or a single track.
                return interaction.followUp(
                  `**Playlist detected.**\n> Please queue your playlist using \`\\queue\`. `
                );
              // If it is a playlist, we need to tell the user to use queue instead of play.
              else {
                queue.insertTrack(
                  searchResult.tracks[0],
                  queue.node.getTrackPosition(queue.currentTrack) + 1
                );
                console.log("Play: Player currently playing. Queued song...");
                return interaction.followUp(
                  `**${"Playing next"}**:\n> \`${
                    searchResult.tracks[0].title
                  } by ${searchResult.tracks[0].author}\``
                );
              }
            }
          } catch (e) {
            console.error(`No Audio: ${e}`);
            return interaction
              .followUp({
                content: `**${"/play Error"}**: We couldn't queue your track.\n`,
                ephemeral: true,
              })
              .then(() => {
                interaction.followUp({
                  content: `Try providing a different song/playlist title or url.`,
                  ephemeral: true,
                });
              });
          }
        }
      } else {
        console.log("Can't play track: ");
        return interaction
          .followUp({
            content: `**${"Something went wrong."}** We couldn't find the track you requested.\n`,
            ephemeral: true,
          })
          .then(() => {
            interaction.followUp({
              content: `Please provide a different URL or track title.`,
              ephemeral: true,
            });
          });
      }
    }
    return interaction.followUp("Error: Could not find member!");
  },
};
