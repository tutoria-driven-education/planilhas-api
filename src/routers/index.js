import {Router} from 'express'
import * as authController from '../controllers/auth.js'
import * as mainController from '../controllers/main.js'
const router = Router()

router.get("/test",(req,res)=>{
  console.log("rodando...")
  return res.send("Rodando")
})

router.get("/auth",authController.getLinkToken)
router.post("/auth",authController.getTokenGoogle)

router.post("/execute",mainController.execute)
export {router}