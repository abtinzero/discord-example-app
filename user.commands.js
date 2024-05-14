import {db} from "./database.js"
export function addOrUpdateUserCommand(cmd) {
  var sql =
    "INSERT INTO users (discord_id, discord_access_token, discord_refresh_token, riot_id, riot_puuid) VALUES (?,?,?,?,?)";
  var params = [
    cmd.discord_id,
    cmd.discord_access_token,
    cmd.discord_refresh_token,
    cmd.riot_id,
    cmd.riot_puuid,
  ];
  db.run(sql, params, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
  });
}
