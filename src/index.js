import {createReadStream} from 'fs'
import {google} from 'googleapis'
import { authorize } from './auth.js';
import {
  GoogleSpreadsheet
} from 'google-spreadsheet'

function uploadFile(auth){
  const drive = google.drive({version: 'v3', auth});
  let idFile;
  const fileMetadata = {
    'name': 'template',
    'mimeType': 'application/vnd.google-apps.spreadsheet'
  };
  const media = {
    body: createReadStream('template.xls'),
    mimeType: 'application/vnd.ms-excel'
  };

  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  }, async (err, file)=> {
    if (err) {
      console.error(err);
      return err
    } else {
      console.log('File Id: ', file.data.id);
      idFile = file.data.id
      await sheet(auth,idFile)
    }
  });

  return idFile
}

async function sheet(auth,id){
  const doc = new GoogleSpreadsheet(id)
  
  doc.useOAuth2Client(auth)

  await doc.loadInfo()
  const sheet = doc.sheetsByTitle["Controle"]
  
  await sheet.loadCells({
    startColumnIndex: 0,
    endColumnIndex: 4,
    startRowIndex: 0,
    endRowIndex: 10,
  })
  
  console.log(sheet.getCell(4,1).value)

}

async function main(){
  const auth = await authorize()
  uploadFile(auth)
}

main()