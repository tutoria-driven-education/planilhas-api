import { createReadStream } from "fs";
import { google } from "googleapis";
import { delay } from "../utils/index.js";
import { logger } from "../utils/logger.js";

export async function uploadFile(auth, fileNameInDrive, path, folderId) {
  const drive = google.drive({ version: "v3", auth });
  const resource = {
    name: fileNameInDrive,
    mimeType: "application/vnd.google-apps.spreadsheet",
    parents: [folderId],
  };
  const media = {
    body: createReadStream(path),
    mimeType: "application/vnd.ms-excel",
  };

  try {
    const request = await Promise.resolve(
      drive.files.create({
        resource,
        media,
        fields: "id",
      })
    );

    return request.data.id;
  } catch (err) {
    console.log("Upload ", err?.message);
    if (err.code === 500) uploadFile(auth, fileNameInDrive, path, folderId);
  }
}

export async function createFolder(auth, className) {
  const drive = google.drive({ version: "v3", auth });
  let resource = {
    name: className,
    mimeType: "application/vnd.google-apps.folder",
  };

  try {
    const request = await Promise.resolve(
      drive.files.create({
        resource,
        fields: "id",
      })
    );
    return request.data.id;
  } catch (err) {
    console.log("Create folder", err?.message);
  }
}

export async function copyFile(
  auth,
  id,
  folderId,
  nameFile,
  operationsFailed = []
) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = await Promise.resolve(
      drive.files.copy({
        fileId: id,
        requestBody: {
          parents: [folderId],
          name: nameFile,
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
      })
    );
    return request.data.id;
  } catch (error) {
    const operation = operationsFailed.find(
      (op) => op.id === id && op.name == "copy_name"
    );
    if (operation !== undefined) {
      if (operation?.limit >= 5) {
        logger.error(
          `Don't copy file ${nameFile} error: ${error?.message} attempts:${operation.limit}`
        );
        throw new Error("Não foi possivel copiar", nameFile);
      } else {
        operation.limit += 1;
      }
    } else {
      operationsFailed.push({
        id,
        name: "copy_file",
        limit: 0,
        data: {
          folderId,
          nameFile,
        },
      });
    }
    console.log(`TRYING: Tentando copiar novamente o arquivo ${nameFile}`);
    await delay(10000);
    await copyFile(auth, id, folderId, nameFile, operationsFailed);
  }
}

export async function updatePermissionStudentFile(
  auth,
  id,
  operationsFailed = []
) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = Promise.resolve(
      drive.permissions.create({
        fileId: id,
        resource: {
          type: "anyone",
          role: "reader",
        },
        fields: "id",
      })
    );
    return request;
  } catch (error) {
    const operation = operationsFailed.find(
      (op) => op.id === id && op.name == "update_permission"
    );
    if (operation !== undefined) {
      if (operation.limit >= 5) {
        logger.error(
          `Can not update permissions; error: ${error?.message} attempts:${operation.limit}`
        );
        throw new Error("Não foi possivel atualizar permissao");
      } else {
        operation.limit += 1;
      }
    } else {
      operationsFailed.push({
        id,
        limit: 0,
        name: "update_permission",
      });
    }
    console.log("TRYING: Tentando atualizar permissao no arquivo");
    await delay(5000);
    await updatePermissionStudentFile(auth, id, operationsFailed);
  }
}

export async function getIdsInsideFolder(auth, id) {
  const drive = google.drive({ version: "v3", auth });
  try {
    return await Promise.resolve(
      drive.files.list({
        fields: "files(id, name)",
        q: `'${id}' in parents and name contains 'Controle de Presença'`,
      })
    );
  } catch (err) {
    throw new Error("Error getting all id's inside folder", err?.message);
  }
}
