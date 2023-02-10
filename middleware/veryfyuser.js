const verifyUser=async(req,res,next)=>{
  if(req.session.user){
    req.user = req.session.user
    next();

  }else{
    res.json({message: "please login"})
  }
  
}

module.exports= verifyUser