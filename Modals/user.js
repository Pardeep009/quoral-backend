const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;              // can be any integer
const schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username : {
      type: String,
      trim: true,
      required : true
    },
    email : {
      type: String,
      trim: true,
      required: true
    },
    profile_image : {
      type : String,
    },
    hashed_password : {
      type : String,
      required : true,
    },
    account_verified : {
      type : Boolean,
      default : false,
    },
    verify_token : {
      type : String,
    },
    reset_password_token : {
      type : String,
    },
    user_questions : [{
        type: schema.Types.ObjectId,
        ref: "questions",
        default: []
    }],
    user_answers : [{
        type: schema.Types.ObjectId,
        ref: "answers",
        default: []
    }],
    followers : [{
        type: schema.Types.ObjectId,
        ref: "users",
        default: []
    }]
});

userSchema.methods.encryptPassword = function(myPlaintextPassword,callback) {
    bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {
      callback(hash);
    });
}

userSchema.methods.authenticate = function(myPlaintextPassword, hashed_password, callback) {
    bcrypt.compare(myPlaintextPassword, hashed_password).then(function(result) {
        callback(result);
    });
}

const user = mongoose.model("users", userSchema);
module.exports = user;