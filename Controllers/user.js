const User = require("../Modals/user");
const expressJwt = require("express-jwt");
const bcrypt = require("bcrypt");
const saltRounds = 10;              // can be any integer

const {ObjectId} = require("mongodb");

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
    // let newUser = new User();
    //     encryptPassword(obj.password,(hash)=> {
    //     newUser.hashed_password = hash;
    //     newUser.email = obj.email;
    //     newUser.username = obj.username;
    //     newUser.verify_token = obj.verify_token;
    //     newUser.save((error, user) => { 
    //         if(error) {
    //             callback(error,null);
    //         }
    //         else {
    //             callback(null,user);
    //         } 
    //     });
    // });
    encryptPassword(obj.password,(hashed_password) => {
        console.log('encryptPassword callback');
        let { email, username, verify_token, } = obj;
        let user = { email, username, verify_token, hashed_password };
        console.log(user);
        User.create(user,(error,user) => {
            if(error) {
                callback(error,null);
            }
            else {
                callback(null,user);
            }
        })
    })
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
    encryptPassword(obj.password,(new_hashed_password) => {
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

exports.requireSignin = expressJwt({
    secret : process.env.JWT_SECRET,
    userProperty : "auth"
})

function encryptPassword(plaintextPassword,callback) {
    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash)  {
        // if(err) throw err;
        console.log('encryptPassword');
        callback(hash);
      })
}