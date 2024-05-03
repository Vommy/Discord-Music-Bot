import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

/**
 * Connects the bot to a voice channel that the user is connected to.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("connect")
    .setDescription(
      "Connects the music bot to a voice channel that the user is in"
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    //Setup the connection
    let message = "Could not connect to the voice channel.";
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (member) {
      if (member.voice.channel) {
        if (interaction.guild?.id && interaction.guild.voiceAdapterCreator) {
          const vcConnection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild?.voiceAdapterCreator,
          });
          message = "Connected to the voice channel!";
        }
      } else {
        message = "Please connect to a voice channel.";
      }
    }
    await interaction.reply(message);
  },
};
