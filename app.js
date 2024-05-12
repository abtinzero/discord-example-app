import "dotenv/config";
import express from "express";
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
import { createChannel } from "./requests.js";
import { getShuffledOptions, getResult } from "./game.js";
import axios from "axios";
// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};
export async function getAccessToken(code){
  const formData = new URLSearchParams({
    client_id: process.env.APP_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code.toString(),
    redirect_uri: 'http://localhost:3000/api/auth/discord/redirect',
  })
  const output = await axios.post('https://discord.com/api/v10/oauth2/token',
  formData, {
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return output.data.access_token;
}
export async function getUserConnections(access_token){
  const output = await axios.get('https://discord.com/api/v10/users/@me/connections',
      {
        headers:{
          'Authorization': `Bearer ${access_token}`
        },
      });
  return output.data;
}
export async function getRiotPUUID(riot_id){

  let config = {
    maxBodyLength: Infinity,
    url: `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riot_id.split("#")[0]}/${riot_id.split("#")[1]}`,
    headers: { 
      'X-Riot-Token': process.env.RIOT_TOKEN
    }
  };
  const output = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riot_id.split("#")[0]}/${riot_id.split("#")[1]}`,
  {
    headers:{
      'X-Riot-Token': process.env.RIOT_TOKEN
    },
  });
  return output.data.puuid;
}
app.get('/api/auth/discord/redirect', async (req, res) =>{
  const {code} = req.query;

  if (code) {
    const access_token = await getAccessToken(code);
    
    const connections = await getUserConnections(access_token);

    const riot_id = connections.find(x=> x.type === "riotgames").name;
    const riot_puuid = await getRiotPUUID(riot_id);
    console.log(riot_puuid);
    

  }
})
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

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
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
      // User's object choice
      //const matchId = req.body.data.options[0].value;

      // Create active game using message ID as the game ID
      /*if (activeGames[id] == null) {
        activeGames[id] = {
          ids: [userId],
          objectName,
        };
      } else {
        activeGames[id].ids.push(userId);
      }*/
      var matchId = 12345;
      createChannel(matchId, [userId]);
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
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
