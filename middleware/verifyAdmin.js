const verifyAdmin=(req,res,next)=>{
  console.log(req.session)
  if(req.session?.admin){
    console.log("admin in")
    next();
  }
  else{
    console.log("admin out")
    res.redirect('/admin/login')
  }
}

module.exports= verifyAdmin;