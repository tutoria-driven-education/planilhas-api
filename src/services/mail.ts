import NodeMailer from "nodemailer";
import mailTemplate from "../templates/mail.js";

export default function sendStudentMail(studentName, studentEmail, sheetId) {
  const mail = NodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const template = mailTemplate(studentName, sheetId);
  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: studentEmail,
    subject: `Olá ${studentName}! Sua planilha individual de presença está pronta`,
    html: template,
  };

  return mail.sendMail(mailOptions, (err, _info) => {
    if (err) {
      console.log("Error sending email: ", err?.message);
    } else {
      console.log(`Email sended to student ${studentName}`);
    }
  });
}
