import { createReadStream } from "fs";
import { google } from "googleapis";

export async function uploadFile(auth,fileNameInDrive,path,folderId) {
  const drive = google.drive({ version: "v3", auth });
  const resource = {
    name: fileNameInDrive,
    mimeType: "application/vnd.google-apps.spreadsheet",
    parents: [folderId]
  };
  const media = {
    body: createReadStream(path),
    mimeType: "application/vnd.ms-excel",
  };

  try {
    const request = await Promise.resolve(drive.files.create({
      resource,
      media,
      fields: "id",
    }));

    return request.data.id
  } catch (error) {
    console.log(error)
    if(error.code === 500) uploadFile(auth,fileNameInDrive,path,folderId);
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
    console.log(err);
  }
}

export async function copyFile(auth, id, folderId, nameFile){
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = await Promise.resolve(drive.files.copy({
      fileId:id,
      requestBody:{
        parents:[folderId],
        name:nameFile,
        mimeType: "application/vnd.google-apps.spreadsheet",
      }
    }))
    return request.data.id
  } catch (error) {
    console.log("Error in copy file!", error)
  }
}

export function updatePermitionStudentFile(auth, id) {
  const drive = google.drive({ version: "v3", auth });

  return Promise.resolve(drive.permissions.create({
    fileId:id,
    resource:{
      'type': 'anyone',
      'role': 'reader',
    },
    fields: "id",
  }))
}