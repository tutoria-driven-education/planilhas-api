import fs from 'fs'
import {google} from 'googleapis'
import { authorize } from './auth.js';

function uploadFile(auth){
  const drive = google.drive({version: 'v3', auth});

  const fileMetadata = {
    'name': 'template_leo.xlsx'
  };
  const media = {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: fs.createReadStream('template.xlsx')
  };

  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, (err, file)=> {
    if (err) {
      console.error(err);
    } else {
      console.log('File Id: ', file.id);
    }
  });
}

async function main(){
  const auth = await authorize()
  uploadFile(auth)
}

main()