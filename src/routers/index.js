import {Router} from 'express'

const router = Router()

router.get("/test",(req,res)=>{
  console.log("rodando...")
  return res.send("Rodando")
})
export {router}