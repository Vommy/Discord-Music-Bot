export {};
const dotenv = require("dotenv");
dotenv.config();
const { REST, Routes } = require("discord.js");

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

// for guild-based commands
// Deletes all commands.

rest
  .put(
    Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
    { body: [] }
  )
  .then(() => console.log("Successfully deleted guild command"))
  .catch(console.error);
