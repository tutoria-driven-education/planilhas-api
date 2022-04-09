import NodeMailer from "nodemailer";
import { ISendMailForStudent } from "./index.d";
import getTemplateEmailForStudent from "../../templates/mail";

export default function sendMailForStudent({
  studentName,
  studentEmail,
  sheetId,
  ...rest
}: ISendMailForStudent) {
  const mail = NodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const template = getTemplateEmailForStudent({ studentName, sheetId, ...rest});
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
