import "dotenv/config";
import express from "express";
import { db } from "./database.js";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
} from "./utils.js";
import {
  createChannel,
  getDiscordUser,
  getDiscordUserTokens,
  getRiotPUUID,
  getUserConnections,
  isInMatch,
} from "./requests.js";
import path from "path";

import { getUserDTObydiscordId } from "./user.queries.js";
import { addOrUpdateUserCommand } from "./user.commands.js";
import { getShuffledOptions, getResult } from "./game.js";
// Create an express app
const __dirname = import.meta.dirname;
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
})
app.get("/api/auth/discord/redirect", async (req, res) => {
  const { code } = req.query;

  if (code) {
    const discord_tokens = await getDiscordUserTokens(code);
    const access_token = discord_tokens.access_token;
    const connections = await getUserConnections(access_token);
    const discord_user = await getDiscordUser(access_token);
    const riot_id = connections.find((x) => x.type === "riotgames").name;
    const riot_puuid = await getRiotPUUID(riot_id);

    addOrUpdateUserCommand({
      discord_access_token: access_token,
      discord_refresh_token: discord_tokens.refresh_token,
      riot_id: riot_id,
      riot_puuid: riot_puuid,
      discord_id: discord_user.id,
    });
    console.log(riot_puuid);
  }
});

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === "test") {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: "hello world " + getRandomEmoji(),
        },
      });
    }
    // "challenge" command
    if (name === "challenge" && id) {
      const userId = req.body.member.user.id;
      // User's object choice
      const objectName = req.body.data.options[0].value;

      // Create active game using message ID as the game ID

      activeGames[id] = {
        id: userId,
        objectName,
      };

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `Rock papers scissors challenge from <@${userId}>`,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Append the game ID to use later on
                  custom_id: `accept_button_${req.body.id}`,
                  label: "Accept",
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }
    if (name === "check" && id) {
      const userId = req.body.member.user.id;
      var message = await checkUserInMatch(userId);
      
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: message,
        },
      });
    }
  }
});
app.get("/check", async function(req, res){
  await checkUserInMatch("161075627800264704");
});
app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

export async function checkUserInMatch(userId){
  var userDTO; 
  await getUserDTObydiscordId(userId)
  .then(rows => {
    userDTO = rows[0];
  });
  var message;
  if (userDTO.riot_puuid != null) {
    let game_data = await isInMatch(userDTO.riot_puuid);
    if (game_data) {
      createChannel(game_data.gameId, [userId]);
      message = "Game Found! Invite sent";
    } else {
      message = "Error. Not in game";
    }
  } else {
    message =
      "Please authenticate yourself using this oauth2 link: " +
      "https://discord.com/oauth2/authorize?client_id=1127271354547318956&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fdiscord%2Fredirect&scope=connections";
  }

  return message;
}