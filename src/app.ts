import MySuperClient from "./classes/MySuperClient";

//Dependencies
const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");

dotenv.config();

const client = new MySuperClient();

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

client.login(process.env.TOKEN);
