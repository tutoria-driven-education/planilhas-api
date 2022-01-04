import NodeMailer from 'nodemailer';
import mailTemplate from '../templates/mail.js';

export default function sendStudentMail(studentName, studentEmail, sheetId) {
	const mail = NodeMailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	const template = mailTemplate(studentName, sheetId);
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: studentEmail,
		subject: `Olá ${studentName}! Sua planilha individual de presença está pronta`,
		html: template,
	};

	// eslint-disable-next-line no-unused-vars
	return mail.sendMail(mailOptions, (error, _info) => {
		if (error) {
			// eslint-disable-next-line no-console
			console.log('Error sending email: ', error);
		} else {
			// eslint-disable-next-line no-console
			console.log(`Email sended to student ${studentName}`);
		}
	});
}
