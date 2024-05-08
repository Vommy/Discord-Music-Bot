const { SlashCommandBuilder } = require("@discordjs/builders");
import { GuildQueue } from "discord-player";
const { useQueue } = require("discord-player");

import {
  ChatInputCommandInteraction,
  SlashCommandIntegerOption,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription(
      "Repeats the current track or playlist. Can also toggle autoplay to play related songs."
    )
    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("repeat_mode")
        .setDescription(`The type of repeat mode to use.`)
        .setRequired(true)
        .addChoices(
          {
            name: "off",
            value: 0,
          },
          {
            name: "track",
            value: 1,
          },

          {
            name: "queue",
            value: 2,
          },
          {
            name: "autoplay",
            value: 3,
          }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    let mode: number | null = 0;
    mode = interaction.options.getInteger("repeat_mode");

    await interaction.deferReply();

    if (mode != null) {
      if (mode >= 0 && mode <= 3) {
        if (interaction.guild) {
          const queue: GuildQueue = useQueue(interaction.guild.id);
          if (
            queue &&
            queue.dispatcher?.audioResource !== null &&
            queue.dispatcher?.audioResource !== undefined
          ) {
            console.log(mode);
            queue.setRepeatMode(mode);
            switch (mode) {
              case 0:
                await interaction.followUp(`**Repeat mode turned off.**`);
                break;
              case 1:
                await interaction.followUp(
                  `**Repeating Song**:\n> \`${queue.currentTrack?.title} by ${queue.currentTrack?.author}\``
                );
                break;
              case 2:
                await interaction.followUp(`**Repeating Queue.**`);
                break;
              case 3:
                await interaction.followUp(`**Autoplay Enabled.**`);
                break;
            }
          } else {
            await interaction.followUp(
              `**No queue or songs to repeat.**\n> \`Please play a song first using /play.\``
            );
          }
        }
      } else {
        await interaction.followUp(
          `**Invalid option**:\n> \`Please select one of the repeat mode options available.\``
        );
      }
    } else {
      await interaction.followUp(`**No repeat mode selected.**`);
    }
  },
};
