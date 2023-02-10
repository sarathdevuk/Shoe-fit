const {constants}=require('../constants')

const errorHandler = (err,req,res,next)=>{
  const statuscode = res.statusCode? res.statusCode : 500;
  console.log(statuscode);

   switch (statuscode) {
    
    case constants.VALIDATION_ERROR:
      res.json({
       title: "validation error",
        message: err.message,
       stackTrace: err.stack,
      });
      break;

      case constants.NOT_FOUND:
        res.json({
          title: "404 error found",
         message: err.message,
          stackTrace: err.stack,
         })
         break;

      case constants.UNAUTHORISED:
        res.json({
          title: "unAuthorizwd",
         message: err.message,
          stackTrace: err.stack,
         })
         break;

      case constants.FOREBIDDEN:
        res.json({
          title: "Forebidden",
         message: err.message,
          stackTrace: err.stack,
         })
         break;

      case constants.SERVER_ERROR:
        res.json({
          title: "Server error",
         message: err.message,
          stackTrace: err.stack,
         })
         break;

        default:
         console.log("no error good to go")
        break;


   }
//  res.json({title:"not found", message: err.message, stackTrace: err.stack})

};


module.exports = errorHandler ;