import { drive_v3 } from "googleapis";

export type SchemasFile = drive_v3.Schema$File;

export type Login = {
    email: string;
    password: string;
}

export type Code = {
    code: string;
}

type Installed = {
    client_id: string,
    project_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_secret: string,
    redirect_uris: string[]
}


export type AuthCredentials = {
    installed: Installed
}

export type Args = { concurrency: number }

export type OperationsFailed = {
    id: number | string;
    name: string;
    limit: number;
    data?: {
        folderId: string,
        nameFile: string,
    },
}

export type StudentsInfo = {
    name: string;
    email: string;
}

export type Ranges = {
    startColumnIndex: number;
    endColumnIndex: number;
    startRowIndex: number;
    endRowIndex: number;
}