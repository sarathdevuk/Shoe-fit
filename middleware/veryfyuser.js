const User = require("../model/userModel");

const verifyUser=async(req,res,next)=>{
  
  if(req.session.user){
    const user =await User.findOne({_id:req.session.user._id, ban:false}, {password:0})
    console.log("user",user);
    if(user){
      req.user=user._id
      next();  
    }else{
      req.session.user=null;
      res.redirect('/login')
    }

  }
  // else{
  //   // res.json({message: "please login"})
  //   res.redirect('/login')
  // }
    
}

module.exports= verifyUser