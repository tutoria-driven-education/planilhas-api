import mailTemplate from "../templates/mail.js";
import { delay } from "../utils/index.js";

export default async function sendStudentMail(mail: any, studentName: string, studentEmail: string, sheetId: string) {
  const template = mailTemplate(studentName, sheetId);
  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: studentEmail,
    subject: `Olá ${studentName}! Sua planilha individual de presença está pronta`,
    html: template,
  };

  return mail.sendMail(mailOptions, async function(err: Error, _info: string) {
    if (err) {
      console.log("Error sending email: ", err.message);
      await delay(60 * 1000); //1 minute
      await sendStudentMail(mail, studentName, studentEmail, sheetId);
    } else {
      console.log(`Email sended to student ${studentName}`);
    }
  });
}
