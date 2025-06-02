const jwt = require("jsonwebtoken");
const model = require("../Models/UserModels");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async(req , res , next) =>{
let token; 
if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
{
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token , process.env.JWTOKEN);
        req.user = await model.findById(decode.id).select('-password');
        next();
    }
    catch(err){
        console.log(err)
        res.status(401);
        throw new Error('Not authorized ,no token')
    }
}
if(!token){
    res.status(401);
    throw new Error('Not authorized , no token ');
}
})
module.exports = {protect};