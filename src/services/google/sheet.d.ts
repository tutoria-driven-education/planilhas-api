export interface IGetStudentsParams {
  id: string;
  amountStudents: number;
}
export interface IWriteSpreadSheet {
  id: string;
  studentName: string;
  studentEmail: string;
}

export interface IStudent {
  email: string;
  name: string;
}
