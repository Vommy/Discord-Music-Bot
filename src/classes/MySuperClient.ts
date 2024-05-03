import { Player } from "discord-music-player";
import {
  Client,
  Collection,
  GatewayIntentBits,
  VideoQualityMode,
} from "discord.js";

/**
 * Adds commands collections for command handler code.
 */
class MySuperClient extends Client {
  public commands: Collection<string, any>;
  public player: Player;

  constructor() {
    // SUPER IMPORTANT: Add "GuildVoiceStates" intents to update voice states.
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });
    this.commands = new Collection();
    this.player = new Player(this);
  }
}

export default MySuperClient;
