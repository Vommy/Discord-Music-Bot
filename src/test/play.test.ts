import { ChatInputCommandInteraction } from "discord.js";
const assert = require("assert").strict;
import { play } from "../commands/utility/play";

describe("Play", () => {
  const interaction: ChatInputCommandInteraction =
    {} as unknown as ChatInputCommandInteraction;

  it("Should play a song", async () => {
    await play(interaction);
  });
});
