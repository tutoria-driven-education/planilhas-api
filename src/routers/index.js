import {Router} from 'express'
import * as authController from '../controllers/auth.js'

const router = Router()

router.get("/test",(req,res)=>{
  console.log("rodando...")
  return res.send("Rodando")
})

router.get("/auth",authController.getLinkToken)
router.post("/auth",authController.getTokenGoogle)
export {router}