import NodeMailer from "nodemailer";
import mailTemplate from "../templates/mail.js"

export default function sendStudentMail(studentName, studentEmail, sheetId) {
    const mail = NodeMailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const template = mailTemplate(studentName, sheetId)
    var mailOptions = {
        from: "celso@respondeai.com.br",
        to: studentEmail,
        subject: `Olá ${studentName}! Sua planilha individual de presença está pronta`,
        html: template
    }

    return mail.sendMail(mailOptions, (error, _info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log(`Email sended to student ${studentName}`);
        }
    });
}