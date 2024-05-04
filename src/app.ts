import { Player } from "discord-player";
import MySuperClient from "./classes/MySuperClient";
import { Embed } from "discord.js";
const { EmbedBuilder } = require("discord.js");

//Dependencies
const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");
dotenv.config();

const client = new MySuperClient();
const player: Player = new Player(client, {
  skipFFmpeg: false,
  ytdlOptions: {
    quality: "highestaudio",
  },
});

//Initializes client commands as a new collection.
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

/**
 * Command handler code.
 * Reads all of the command specified in the command folder.
 * Sets it up as / commands in Discord.
 */
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: String) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    //Filters incomplete commands that don't have a data property or execute property.
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a require "data" or "execute" property.`
      );
    }
  }
}

/**
 * Event handler code.
 * Gets all of the events from the events folder.
 * Registers every event to the client.
 * */
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file: string) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

//Handle all events through the client itself. Much easier to actually interact with.

client.on("ready", () => {
  console.log("Vommy's music bot is ready to rock and roll!");
});

player.events.on("playerStart", (queue, track) => {
  let songEmbed: Embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${track.title}`)
    .setURL(`${track.url}`)
    .setAuthor({
      name: `${track.author}`,
      url: "https://discord.js.org",
    })
    .setDescription(`${track.description}`)
    .setThumbnail(`${track.thumbnail}`)
    .setImage(`${track.thumbnail}`);

  if (songEmbed.image) songEmbed.image.url = track.title;

  queue.metadata.channel.send({ embeds: [songEmbed] });
});

player.events.on("playerSkip", (queue, track) => {
  queue.metadata.channel.send(`Now playing: **${track.title}**`);
});

player.events.on("error", (queue, e) => {
  console.log("Error", e);
});

client.on("error", (e) => {
  console.log("Error: ", e);
});

player.on("debug", console.log);

player.events.on("debug", (queue, message) =>
  console.log(`[DEBUG ${queue.guild.id}] ${message}`)
);

// Better code for interaction handling than having a separate file.

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
