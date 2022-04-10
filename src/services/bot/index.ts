// import { Sheet } from "./../google/sheet";
// import { Credentials } from "google-auth-library";
// import { authorize } from "../google/auth";

// interface IGetStudentsUnderNinetyPercent {
//   idSpreadsheet: string;
//   token: Credentials;
//   endpoint: string;
// }
// export async function getStudentsUnderNinetyPercent({
//   idSpreadsheet,
//   token,
//   endpoint,
// }: IGetStudentsUnderNinetyPercent) {
//   const auth = await authorize(token);
//   console.info("Success on authenticate!");

//   const amountStudentsRange = parseInt(endpoint) + 11;
//   const ranges = {
//     startColumnIndex: 0,
//     endColumnIndex: 6,
//     startRowIndex: 11,
//     endRowIndex: amountStudentsRange,
//   };

//   const sheetTitle = "Dashboard";
//   // const sheet = await initSpreadsheet(auth, idSpreadsheet, sheetTitle, ranges);
//   const sheet = new Sheet(auth);

//   const studentsInfo = await getStudentsInfoWithAttendancePercentage(
//     sheet,
//     endpoint
//   );
//   console.info("Loading students with success!");

//   return studentsInfo;
// }
