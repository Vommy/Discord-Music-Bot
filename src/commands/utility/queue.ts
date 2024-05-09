import { GuildQueue, Player, Playlist, Track } from "discord-player";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
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
      const member = await interaction.guild?.members.fetch(
        interaction.user.id
      );
      if (member) {
        const channel = member.voice.channel;

        await interaction.deferReply();
        if (queue) {
          const searchResult = await player.search(audio, {
            requestedBy: interaction.user,
          });
          let song: Track;
          song = searchResult.tracks[0];
          if (searchResult.playlist && channel && song.playlist) {
            queue.tracks.add(searchResult.playlist.tracks);
            let songEmbed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle(`${searchResult.playlist.title}`)
              .setURL(`${searchResult.playlist.url}`)
              .setAuthor({
                name: `${"Playlist by: " + searchResult.playlist.author.name}`,
                url: `${searchResult.playlist.url}`,
              })
              .setDescription(`${searchResult.playlist.description}`)
              .setThumbnail(`${searchResult.playlist.thumbnail}`);

            await interaction.followUp({
              content: `**${"Playlist queued"}**:\n> \`${
                song.playlist.title
              } by ${song.playlist.author.name}\``,
              embeds: [songEmbed],
            });
          } else {
            //BUG: /queue works even if there is no song after a song has been played.
            if (queue.dispatcher?.audioResource) {
              if (queue.size < queue.getCapacity()) {
                queue.insertTrack(song, queue.getSize());
                console.log(`Songs queued: Queue size is now ${queue.size}`);
                await interaction.followUp(
                  `**${"Song queued"}**:\n> \`${song.title} by ${song.author}\``
                );
              } else {
                await interaction.followUp(
                  `**Queue is currently full with ${queue.size} tracks.**\n> Please wait for more room in the song queue, then try again. `
                );
              }
            } else
              await interaction.followUp(
                `**There are no active songs.**\n> Please play a song first, using \`/play\`.`
              );
          }
        } else
          await interaction.followUp(
            `**There are no active songs.**\n> Please play a song first, using \`/play\`.`
          );
      }
    }
  },
};
