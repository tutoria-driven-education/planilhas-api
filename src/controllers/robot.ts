import { Request, Response } from "express";
import * as mainService from "../services/robot";
import { extractIdByUrl } from "../utils/index";

export async function generateSpreadsheets(req: Request, res: Response) {
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
    token
  );

  return res.sendStatus(200);
}

export async function updateSheet(req: Request, res: Response) {
  const {
    folderLinkSpreadsheet,
    linkSpreadsheetTemplate,
    spreadsheetPageName,
    isProtected,
    token,
  } = req.body;

  const folderId = extractIdByUrl(folderLinkSpreadsheet);
  const idSpreadsheetTemplate = extractIdByUrl(linkSpreadsheetTemplate);

  const result = await mainService.executeUpdate(
    folderId,
    idSpreadsheetTemplate,
    spreadsheetPageName,
    isProtected,
    token
  );

  if (result === null) {
    return res.sendStatus(400);
  }

  return res.sendStatus(200);
}

export async function getStudentsUnderNinetyPercent(req, res) {
  const { linkSpreadsheetStudents, token, endpoint } = req.body;

  try {
    const studentsInfo = await mainService.getStudentsUnderNinetyPercent(
      extractIdByUrl(linkSpreadsheetStudents),
      token,
      endpoint
    );
    res.send(studentsInfo);
  } catch (error) {
    console.error(error);

    if (error.message.includes("READ_ERROR"))
      return res.status(404).send(error.message);

    res.sendStatus(500);
  }
}
