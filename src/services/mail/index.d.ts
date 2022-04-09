export interface ISendMailForStudent {
  studentName: string;
  studentEmail: string;
  sheetId: string;
  emailCoordinator?: string;
  usernameSlack?: string;
}
export interface IGetTemplateEmailForStudent {
  studentName: string;
  sheetId: string;
  emailCoordinator?: string;
  usernameSlack?: string;
}
