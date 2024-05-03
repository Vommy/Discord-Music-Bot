const { SlashCommandBuilder } = require("@discordjs/builders");
const { createAudioPlayer, createAudioResource } = require("@discordjs/voice");

import {
  getVoiceConnection,
  AudioPlayerStatus,
  AudioPlayerError,
} from "@discordjs/voice";
import { ChatInputCommandInteraction } from "discord.js";

const { join } = require("node:path");

/**
 * Connects the bot to a voice channel that the user is connected to.
 * */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Disconnects the music bot from a voice channel, if it is connected."
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guildId) {
      const conn = getVoiceConnection(interaction.guildId);
      if (conn) {
        console.log("Connection found!");
      }
      try {
        const player = createAudioPlayer();
        conn?.subscribe(player);
        let resource = createAudioResource(
          "C:\\xampp\\htdocs\\Discord-Music-Bot\\src\\commands\\utility\\wow.mp3"
        );
        player.play(resource);

        player.on("error", (error: AudioPlayerError) => {
          console.log(
            "Error playing audio",
            error.message,
            "with track ",
            error.resource.metadata
          );
        });
        player.on("stateChange", (oldState: any, newState: any) => {
          console.log(
            `Player transitioned from ${oldState.status} to ${newState.status}`
          );
        });
      } catch (e) {
        console.log("Error: ", e);
      }
    }
    await interaction.reply("Playing audio...");
  },
};
