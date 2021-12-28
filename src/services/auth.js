import * as fs from 'fs/promises'
import readline from 'readline'
import {google} from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/drive','https://spreadsheets.google.com/feeds'];
const TOKEN_PATH = 'token.json';

export async function authorize() {
  let credentials
  let token;
  try {
    credentials =  JSON.parse(await fs.readFile('credentials.json'));
  } catch (error) {
    console.log("Error in reading credentials", error)
  }

  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  try {
    token =  JSON.parse(await fs.readFile(TOKEN_PATH))
            
  } catch (error) {
    console.log("Gerando token")
    token = getAccessToken(oAuth2Client);
    
  }
  oAuth2Client.setCredentials(token);
  return oAuth2Client
}


export function getAccessToken(oAuth2Client) {
  let newToken;
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      
      try {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to', TOKEN_PATH);
        newToken = token
      } catch (error) {
        return console.error(err);
      }
      
    });
  });
  return newToken
}