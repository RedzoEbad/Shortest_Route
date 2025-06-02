const mongoose = require("mongoose");
const bcrypt =  require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password : {
    type : String,
    required: true,
  },
   role : {
    type : String,
    enum : ["Passenger" , "Rider"],
    required : true,
   } ,
   isAvalible :{
    type : Boolean,
    default : false
   },
   location : {
    type : {
      type : String , 
      default : "Point"
    },
     coordinates: [],
   }
  
} ,{timestamps : true})
UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function(next){
if(!this.isModified('password')) next();
this.password = await bcrypt.hash(this.password , 10);
})

module.exports  =  mongoose.model('User' , UserSchema);