const verifyUser=async(req,res,next)=>{
  if(req.session.user){
    req.user = req.session.user._id
    next();
    
  }
  else{
    // res.json({message: "please login"})
    res.redirect('/login')
  }
    
}

module.exports= verifyUser