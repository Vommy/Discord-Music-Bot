const { useHistory } = require("discord-player");
import { GuildQueueHistory } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playback")
    .setDescription("Plays the previous song in the queue, if there is one."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
      if (interaction.guild.id) {
        const history: GuildQueueHistory = useHistory(interaction.guild.id);
        if (history) {
          if (history.previousTrack) {
            await interaction.deferReply();

            let previousSong = `\`${history.previousTrack.title} by ${history.previousTrack.author}\``;
            await history.previous();
            return interaction.followUp(
              `**Running it back to the previous song**:\n> ${previousSong}`
            );
          }
          return interaction.reply(`Playback error: No previous song found.`);
        }
        return interaction.reply(
          `**Playback error**: *No song history found.*\n> Please play a song first using \`/play\``
        );
      }
    }
    return interaction.reply(`Error: No Guild Found!`);
  },
};
