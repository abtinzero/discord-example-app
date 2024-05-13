import { db } from "./database.js";
export function getUserDTObydiscordId(id) {
  var sql = "select * from user where discord_id = ?";
  var params = [id];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
}
