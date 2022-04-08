export interface ISendMailForStudent {
  studentName: string;
  studentEmail: string;
  sheetId: string;
}
export interface IGetTemplateEmailForStudent{
  studentName: string,
  spreadId: string,
  emailCoor ?: ,
  usernameSlack = "@Dudu"
}