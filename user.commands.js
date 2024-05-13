export function addOrUpdateUserCommand(cmd) {
  var sql =
    "INSERT INTO user (discord_user, discord_access_token, discord_refresh_token, riot_id, riot_puuid) VALUES (?,?,?,?,?)";
  var params = [
    cmd.discord_user,
    cmd.discord_access_token,
    cmd.discord_refresh_token,
    cmd.riot_id,
    cmd.riot_puuid,
  ];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
      id: this.lastID,
    });
  });
}
