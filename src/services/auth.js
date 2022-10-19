import * as fs from "fs/promises";
import { google } from "googleapis";

async function getOauth() {
  let credentials;
  try {
    credentials = JSON.parse(await fs.readFile("credentials.json"));
  } catch (err) {
    console.log("Error in reading credentials", err?.message);
  }
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    process.env.NODE_ENV === "development" ? redirect_uris[0] : redirect_uris[1]
  );

  return oAuth2Client;
}

export async function getLinkToken() {
  const SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://spreadsheets.google.com/feeds",
  ];
  const oAuth = await getOauth();
  const authUrl = oAuth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  return authUrl;
}

export async function getTokenGoogle(code) {
  const oAuth = await getOauth();
  try {
    const request = await oAuth.getToken(code);
    return request.tokens;
  } catch (err) {
    console.log("Error in search token", err?.message);
  }
}

export async function authorize(token) {
  const oAuth = await getOauth();

  oAuth.setCredentials(token);

  return oAuth;
}
