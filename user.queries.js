import { db } from "./database.js";
export function getUserDTObydiscordId(id) {
  return new Promise((resolve, reject) => {
  var sql = "select * from users where discord_id = ?";
  var params = [id];
  var data;
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.log(err);
      reject(err); // Reject the promise with the error
  } else {
      resolve(rows); // Resolve the promise with the result rows
  }})})}
