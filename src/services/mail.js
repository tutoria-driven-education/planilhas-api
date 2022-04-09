import mailTemplate from "../templates/mail.js";
import { delay } from "../utils/index.js";

export default async function sendStudentMail(mail, studentName, studentEmail, sheetId) {
  const template = mailTemplate(studentName, sheetId);
  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: "yann.melo@driven.com.br",
    subject: `Olá ${studentName}! Sua planilha individual de presença está pronta`,
    html: template,
  };

  return mail.sendMail(mailOptions, async function(err, _info) {
    if (err) {
      console.log("Error sending email: ", err?.message);
      await delay(60 * 1000); //1 minute
      return await sendStudentMail(mail, studentName, studentEmail, sheetId);
    } else {
      console.log(`Email sended to student ${studentName}`);
    }
  });
}
