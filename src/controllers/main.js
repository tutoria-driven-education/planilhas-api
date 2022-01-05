import * as mainService from '../services/main.js';
import extractIdByUrl from '../utils/index.js';

export async function execute(req, res) {
	const {
		linkSpreadsheetStudents,
		linkSpreadsheetTemplate,
		amountStudents,
		className,
		token,
	} = req.body;

	const idSpreadsheetStudents = extractIdByUrl(linkSpreadsheetStudents);
	const idSpreadsheetTemplate = extractIdByUrl(linkSpreadsheetTemplate);

	await mainService.execute(
		idSpreadsheetStudents,
		idSpreadsheetTemplate,
		amountStudents,
		className,
		token,
	);

	return res.sendStatus(200);
}
