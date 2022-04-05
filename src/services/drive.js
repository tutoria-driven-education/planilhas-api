import { createReadStream } from "fs";
import { google } from "googleapis";

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

export async function copyFile(auth, id, folderId, nameFile) {
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
  } catch (err) {
    console.log("Error in copy file!", err?.message);
    throw new Error("Error in copy file");
  }
}

export function updatePermitionStudentFile(auth, id) {
  const drive = google.drive({ version: "v3", auth });

  return Promise.resolve(
    drive.permissions.create({
      fileId: id,
      resource: {
        type: "anyone",
        role: "reader",
      },
      fields: "id",
    })
  );
}

export async function getIdsInsideFolder(auth, id) {
  const drive = google.drive({ version: "v3", auth });
  const index = id?.indexOf("?");
  const newId = index > -1 ? id.slice(0, index) : id;
  try {
    return await Promise.resolve(
      drive.files.list({
        fields: "files(id)",
        q: `'${newId}' in parents and name contains 'Controle de Presença'`,
      })
    );
  } catch (err) {
    console.log("Error getting all id's inside folder ", err?.message);
  }
}
