import axios from "axios";
import "dotenv/config";

var token = `Bot ${process.env.DISCORD_TOKEN}`;
var cookie = "";

export function createChannel(matchId, users) {
  let data = JSON.stringify({
    name: matchId,
    type: 2,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://discord.com/api/v10/guilds/374994550231400448/channels",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      Cookie: cookie,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      createInvite(response.data.id, users);
    })
    .catch((error) => {
      console.log(error);
    });
}
function createInvite(channel_id, users) {
  let data = JSON.stringify({});

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://discord.com/api/v10/channels/" + channel_id + "/invites",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      Cookie: cookie,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      sendMultipleDM(response.data.code, users);
    })
    .catch((error) => {
      console.log(error);
    });
}

function sendDM(invite_code, user) {
  if (!invite_code) {
    invite_code = "not_defined";
  }
  let data = JSON.stringify({
    content: "https://discord.gg/" + invite_code,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://discord.com/api/v10/channels/" + user + "/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      Cookie: cookie,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}

function sendMultipleDM(code, users) {
  for (let user in users) {
    console.log(users[user], code);
    createDM(code, users[user]);
  }
}

function createDM(code, user) {
  let data = JSON.stringify({
    recipient_id: user,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://discord.com/api/v10/users/@me/channels",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      Cookie: cookie,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      sendDM(code, response.data.id);
    })
    .catch((error) => {
      console.log(error);
    });
}
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

  const output = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riot_id.split("#")[0]}/${riot_id.split("#")[1]}`,
  {
    headers:{
      'X-Riot-Token': process.env.RIOT_TOKEN
    },
  });
  return output.data.puuid;
}
export async function isInMatch(puuid){
try{
  const output = await axios.get(`https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
  {
    headers: { 
      'X-Riot-Token': process.env.RIOT_TOKEN
    }
  });
return output;
}
catch{
  console.log("mofo is not in game skull emoji");
}
  
}