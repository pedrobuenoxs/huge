import con from "./config.js";

function query(sql, arr) {
  return new Promise((resolve, reject) => {
    if (!sql || !arr) {
      return resolve("No sql provided");
    }
    con.query(sql, arr, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });
}

export default query;

// query("DELETE FROM auth_keys ", []).then((result) => {
//   console.log(result);
// });
