import * as mainService from '../services/main.js'
import { extractIdByUrl } from '../ultis/index.js'

export async function execute(req,res){
  const {linkSpreadsheetStudents,
    linkSpreadsheetTemplate,
    amountStudents,
    className,
    token}  = req.body
  
  const idSpreadsheetStudents = extractIdByUrl(linkSpreadsheetStudents)
  const idSpreadsheetTemplate = extractIdByUrl(linkSpreadsheetTemplate)

  const request = await mainService.execute(idSpreadsheetStudents,
                                            idSpreadsheetTemplate ,
                                      amountStudents,className,token)

  return res.sendStatus(200) 
} 

