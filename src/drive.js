import { createReadStream } from "fs";
import { google } from "googleapis";

export async function uploadFile(auth,fileNameInDrive,path) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name: fileNameInDrive,
    mimeType: "application/vnd.google-apps.spreadsheet",
  };
  const media = {
    body: createReadStream(path),
    mimeType: "application/vnd.ms-excel",
  };

  try {
    const request = await Promise.resolve(drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    }));

    return request.data.id
  } catch (error) {
    console.log(error)
    
  }
  

  
}