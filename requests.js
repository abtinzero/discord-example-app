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
