const User = require("../Modals/user");
const expressJwt = require("express-jwt");
require("dotenv").config();

const {ObjectId} = require("mongodb");
const saltRounds = 10;

exports.findUserByEmailOrUsername = (obj,callback) => {
    User.findOne({$or: [
        {email: obj.email},
        {username: obj.username}
    ]},
    (error,user) => {
        if(error) {
            callback(error,null);
        }
        else {
            callback(null,user);
        }
    })
}

exports.addUser = (obj,callback) => {
    let newUser = new User();
        newUser.encryptPassword(obj.password,(hash)=> {
        newUser.hashed_password = hash;
        newUser.email = obj.email;
        newUser.username = obj.username;
        newUser.verify_token = obj.verify_token;
        newUser.save((error, user) => { 
            if(error) {
                callback(error,null);
            }
            else {
                callback(null,user);
            } 
        });
    });
}

exports.verifyUser = (obj,callback) => {
    User.updateOne({$or: [
        {email: obj.email},
        {username: obj.username}
    ]},
    {
        $set : {
            account_verified : true,
        }
    },(error,user) => {
        if(error) {
            callback(error,null);
        }
        else {
            callback(null,user);
        }
    })
}

exports.addResetPasswordToken = (obj,callback) => {
    User.updateOne({$or: [
        {email: obj.email},
        {username: obj.username}
    ]},
    {
        $set : {
            reset_password_token : obj.token,
        }
    },(error,user) => {
        if(error) {
            callback(error,null);
        }
        else {
            callback(null,user);
        }
    })
}

exports.updatePassword = (obj,callback) => {
    encryptPassword(obj.new_password,(new_hashed_password) => {
        User.updateOne({
            username : obj.username
        },{
            $set : {
                hashed_password : new_hashed_password,
                reset_password_token : ''
            }
        },(error,result) => {
            if(error) {
                callback(error,null);
            }
            else {
                callback(null,result);
            }
        })
    })
}

exports.logout = (obj,callback) => {

}

exports.requireSignin = expressJwt({
    secret : process.env.JWT_SECRET,
    userProperty : "auth"
})

function encryptPassword(plaintextPassword,callback) {
    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash)  {
        if(err) throw err;
        callback(hash);
      })
}