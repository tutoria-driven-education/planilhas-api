import NodeMailer from "nodemailer";

export default function sendStudentMail(studentName, studentEmail, sheetId) {
    const mail = NodeMailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: studentEmail,
        subject: `Olá ${studentName}! Sua planilha individual de presença está pronta`,
        html: `
        <h1> Olá ${studentName}</h1>

        <span>Sua planilha pode ser vista <a href="https://docs.google.com/spreadsheets/d/${sheetId}/">aqui</a></span>
        `
    }

    return mail.sendMail(mailOptions, (error, _info)=>{
        if (error) {
        console.log('Error sending email: ', error);
        } else {
        console.log(`Email sended to student ${studentName}`);
        }
    });
}