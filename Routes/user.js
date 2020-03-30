const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const validator = require("../Validator/index");
const { sendMail } = require('../Middlewares/nodemailer');

const Usercontroller = require('../Controllers/user');
const Answer = require('./answer');
const Question = require('./question');

router.post('/login',(req,res) => {
    let { usernameORemail, password } = req.body;
    let obj = { password }
    if(usernameORemail.includes(".")) {      // signing in with email
        obj.email = usernameORemail
        obj.username = ''
    }
    else {                                    // signing in with username
        obj.email = ''
        obj.username = usernameORemail
    }
    Usercontroller.findUserByEmailOrUsername(obj,(error,user) => {
        if(error || !user) {
            if(error) {
                return res.status(500).json({
                    error : "Server Error!!!"
                })    
            }
            else {
                let message = "User with that Email does not exist. Please Sign Up";
                if(obj.username !== '') {
                    message = "User with that Username does not exist. Please Sign Up";
                }
                return res.status(401).json({
                    error : message
                }) 
            }
        }
        user.authenticate(password, user.hashed_password , (result) => {
            if(result === false) {
                return res.status(401).json({
                    error: "Incorrect Password"
                });
            }
            else {
                const token = jwt.sign({ username : user.username }, process.env.JWT_SECRET);
                    res.cookie("t", token, {
                        expires : new Date(Date.now() + 900000)
                }); 
                const { _id, email, username, account_verified } = user;
                return res.status(200).json({ token, user: { _id, email, username, account_verified } });
            }
        })
    })
})

router.post('/addUser',validator.signupValidator,(req,res) => {
    let { email, password, username } = req.body;
    let obj = { email, password, username };
    Usercontroller.findUserByEmailOrUsername(obj,(err,user) => {
        if(err || user) {
            console.log(err);
            if(err) {
                return res.status(500).json({
                    error : err
                })    
            }
            else {
                if(user.username == obj.username) {
                    return res.status(401).json({
                        error : "Username is already taken"
                    })
                }
                else if(user.email == obj.email) {
                    return res.status(401).json({
                        error : "Email is already registered"
                    })
                }
            }
        }
        else {
            const token = jwt.sign({ username : obj.username }, process.env.JWT_SECRET).split('.')[2];
            const link = `${process.env.HOSTNAME}`+"/verify?username="+obj.username+"&token="+token;
            const mailOptions = {
                from: `${process.env.YOUR_GMAIL_USERNAME}`,
                to: obj.email,
                subject: 'Welcome To Quoral',
                html : '<p>Click <a href="'+link+'">here</a> to activate your account</p>'
            };
            sendMail(mailOptions,(error,info) => {
                if(error) {
                    return res.status(500).json({
                        error : err
                    })
                }
                else {
                    obj.verify_token = token;
                    Usercontroller.addUser(obj,(err,user) => {
                        console.log(user);
                        if(err) {
                            return res.status(500).json({
                                error : err
                            })    
                        }
                        else {
                            const token = jwt.sign({ username : user.username }, process.env.JWT_SECRET);
                                res.cookie("t", token, {
                                    expires: new Date(Date.now() + 900000)
                            });
                            const { _id, email, username, account_verified } = user;
                                return res.status(200).json({ token, user: { _id, email, username, account_verified } });
                        }
                    })
                }
            })
        }
    })
})

router.post('/verifyUser',(req,res) => {
    let { token, username } = req.body;
    let obj = { token, username };
    obj.email = '';
    Usercontroller.findUserByEmailOrUsername(obj,(error,user) => {
        if(error) {
            return res.status(500).json({
                error : err
            })
        }
        else if(!user) {
            return res.status(400).json({
                error : 'Wrong username provided,no such user found'
            }) 
        }
        else {
            if(user.verify_token != obj.token) {
                return res.status(400).json({
                    error : 'Wrong token provided'
                })  
            }
            else if(user.account_verified === true) {
                return res.status(400).json({
                    error : 'Account already verified'
                })
            }
            else {
                Usercontroller.verifyUser(obj,(error,user) => {
                    if(error) {
                        return res.status(500).json({
                            error : err
                        })
                    }
                    else {
                        return res.status(200).json({
                            message : 'Account Verified'
                        })
                    }
                })
            }
        }
    })
})

router.post('/sendResetLink',(req,res) => {
    let { email } = req.body;
    let obj = { email };
    obj.username = '';
    Usercontroller.findUserByEmailOrUsername(obj,(error,user) => {
        if(error) {
            return res.status(500).json({
                error : err
            })
        }
        else if(!user) {
            return res.status(401).json({
                error : "Email is Not Registered.Please Signup"
            })
        }
        else {
            const token = jwt.sign({ email : obj.email }, process.env.JWT_SECRET).split('.')[2];
            obj.token = token;
            const link = `${process.env.HOSTNAME}`+"/reset-password?email="+obj.email+"&token="+token;
            const mailOptions = {
                from: `${process.env.YOUR_GMAIL_USERNAME}`,
                to: obj.email,
                subject: 'Reset Password',
                html : '<p>Click here <a href="'+link+'">here</a> to change your password</p>'
            };
            sendMail(mailOptions,(error,info) => {
                if(error) {
                    return res.status(500).json({
                        error : err
                    })
                }
                else {
                    Usercontroller.addResetPasswordToken(obj,(error,result) => {
                        if(error) {
                            return res.status(500).json({
                                error : err
                            })
                        }
                        else {
                            return res.status(200).json({
                                message : 'Link has been sent to your email'
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/resetPassword',validator.passwordValidator,(req,res) => {
    const { email, password, token } = req.body;
    const obj = { email, password, token }
    obj.username = '';
    Usercontroller.findUserByEmailOrUsername(obj,(error,user) => {
        if(error)
        {
            return res.status(500).json({
                error : err
            })
        }
        else if(!user) {
            return res.status(400).json({
                error : "Something went wrong"
            })
        }
        else if(user.reset_password_token !== obj.token) {
            return res.status(400).json({
                error : "Invalid Request"
            })
        }
        else {
            obj.username = user.username
            Usercontroller.updatePassword(obj,(error,result) => {
                if(error)
                {
                    return res.status(500).json({
                        error : err
                    })
                }
                else {
                    return res.status(200).json({
                        message : "Password Changed Sucessfully."
                    })
                }
            })
        }
    })
})

router.get('/logout',(req,res) => {
    res.clearCookie("t");
    return res.json({ message: "Signout success" });
})

module.exports = router;