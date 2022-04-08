import mailTemplate from "../templates/mail.js";

export default function sendStudentMail(mail, studentName, studentEmail, sheetId) {
  const template = mailTemplate(studentName, sheetId);
  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: "yann.melo@driven.com.br",
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
