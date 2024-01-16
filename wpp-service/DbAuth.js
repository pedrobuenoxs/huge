import {
  WAProto as proto,
  initAuthCreds,
  BufferJSON,
} from "@whiskeysockets/baileys";
import fs from "fs/promises";

import query from "../database/dbpromise.js";

export default async function useSQLAuthState(sessionID, saveOnlyCreds) {
  const localFolder = "folder";
  const localFile = "file.json";
  if (saveOnlyCreds) await fs.mkdir(localFolder, { recursive: true });

  async function writeData(data, key) {
    const dataString = JSON.stringify(data, BufferJSON.replacer);
    if (saveOnlyCreds && key !== "creds") {
      console.log("Saving locally", key, "to", localFile(key));
      await fs.writeFile(localFile(key), dataString);
      return;
    }

    await insertOrUpdateAuthKey(sessionID, key, dataString);
    return;
  }

  async function readData(key) {
    try {
      let rawData;

      if (saveOnlyCreds && key != "creds") {
        console.log("Reading locally", key, "from", localFile(key));
        rawData = await fs.readFile(localFile(key), { encoding: "utf-8" });
        console.log("rawData", rawData);
      } else {
        rawData = await getAuthKey(sessionID, key);
      }

      const parsedData = JSON.parse(
        JSON.stringify(rawData),
        BufferJSON.reviver
      );
      return parsedData;
    } catch (error) {
      console.log("❌", error.message);
      return null;
    }
  }

  async function removeData(key) {
    try {
      if (saveOnlyCreds && key != "creds") {
        // caso saveOnlyCreds = true, ele deleta a key localmente (exceto a creds.json)
        console.log("Deleting locally", key, "from", localFile(key));
        await fs.unlink(localFile(key));
      } else {
        await deleteAuthKey(sessionID, key);
      }
    } catch (error) {}
  }

  let creds = await readData("creds");
  if (!creds) {
    creds = initAuthCreds();
    await writeData(creds, "creds");
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => {
      return writeData(creds, "creds");
    },
  };
}

async function insertOrUpdateAuthKey(botId, keyId, keyJson) {
  // Verifica se o registro já existe na tabela
  const selectQuery = `SELECT id FROM auth_wpp WHERE bot_id = ? AND key_id = ?`;
  const rows = await query(selectQuery, [botId, keyId]);

  // Se o registro já existe, faz um update
  if (rows.length > 0) {
    const updateQuery = `UPDATE auth_wpp SET key_json = ?, updated_at = NOW() WHERE id = ?`;
    await query(updateQuery, [keyJson, rows[0].id]);
    //console.log('Registro atualizado na tabela auth_wpp');
  } else {
    // Se o registro não existe, faz um insert
    const insertQuery = `INSERT INTO auth_wpp (bot_id, key_id, key_json) VALUES (?, ?, ?)`;
    await query(insertQuery, [botId, keyId, keyJson]);
    //console.log('Registro inserido na tabela auth_wpp');
  }
}
// Função que busca um registro na tabela auth_wpp
async function getAuthKey(botId, keyId) {
  // Faz a consulta na tabela auth_wpp
  const query_str = `SELECT key_json FROM auth_wpp WHERE bot_id = ? AND key_id = ?`;
  const rows = await query(query_str, [botId, keyId]);
  // Retorna o conteúdo do key_json ou null, caso não tenha encontrado nenhum registro
  return rows.length > 0 ? rows[0].key_json : null;
}
// Função que deleta um registro da tabela auth_wpp
async function deleteAuthKey(botId, keyId) {
  // Faz a exclusão na tabela auth_wpp
  const query_str = `DELETE FROM auth_wpp WHERE bot_id = ? AND key_id = ?`;
  await query(query_str, [botId, keyId]);
}
