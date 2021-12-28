import * as authService from '../services/auth.js'

export async function getLinkToken(req,res){
  const link = await authService.getLinkToken();

  return res.send({link})
}

export async function getTokenGoogle(req,res){
  const { code } = req.body  
  const token = await authService.getTokenGoogle(code)
  
  return res.send({token})
}