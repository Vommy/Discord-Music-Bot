import { Client, Collection, GatewayIntentBits } from "discord.js";

/**
 * Adds commands collections for command handler code.
 */
class MySuperClient extends Client {
  public commands: Collection<string, any>;

  constructor() {
    // SUPER IMPORTANT: Add "GuildVoiceStates" intents to update voice states.
    super({
      intents: [GatewayIntentBits.Guilds, "GuildVoiceStates"],
    });
    this.commands = new Collection();
  }
}

export default MySuperClient;
