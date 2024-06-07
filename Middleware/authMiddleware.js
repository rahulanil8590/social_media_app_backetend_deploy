import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  console.log(authHeader , "authheader");
  if (!authHeader || !authHeader?.startsWith("Bearer")) {
    next("Authentication== failed");
  }


  const token = authHeader?.split(" ")[1]
      console.log(token , "token == - = - =");
  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY , (err , res) =>{
      if(err){
        return "token expired"
      }
      if(res){
        return res
      }
    });
   
    if(userToken === "token expired"){
      req.body.user = "token expired"
    }else{
      req.body.user = {
        userId: userToken.userId,
      };
    }
    next();
  } catch (error) {
    console.log(error);
    next("Authentication failed");
  }
};

export default userAuth;