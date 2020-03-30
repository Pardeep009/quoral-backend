exports.signupValidator = (req, res, next) => {
  // name is not null and between 4-20 characters
  
  // if(req.body.username.includes(".")) {          // temporary
  //   return res.status(401).json({
  //       error : "Username cannot have ."
  //   })
  // }

  // req.check("username").notEmpty().withMessage("Username cannot be empty")  //.matches(/\w+[^.]\w+/).withMessage("Username cannot have dot")
  // email is not null, valid and normalized
  // req
  //   .check("email").notEmpty().withMessage("Email cannot be empty")
  //   // .matches(
  //   //   /([A-Za-z0-9]+)+@gmail[.]com\b/
  //   // )
  //   .isEmail().withMessage("Provide valid Email")
  //   .isLength({
  //     min: 4,
  //     max: 2000
  //   });
  // check for password
  checkUsername(req);
  checkEmail(req);
  checkPassword(req);
  // req.check("password").notEmpty().withMessage("Password cannot be empty")
  //   .isLength({ min: 6 })
  //   .withMessage("Password must have minimum length of 6!")
  //   .matches(/[A-Z]/)
  //   .withMessage("Password must have atleast one Upper Case Letter!")
  //   .matches(/[a-z]/)
  //   .withMessage("Password must have atleast one Lower Case Letter!")
  //   .matches(/\d/)
  //   .withMessage("Password must contain a Number!")

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  // proceed to next middleware
  next();
};

exports.passwordValidator = (req,res,next) => {
  checkPassword(req)
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  // proceed to next middleware
  next();
}

function checkPassword(req) {
  req.check("password").notEmpty().withMessage("Password cannot be empty")
    .isLength({ min: 6 })
    .withMessage("Password must have minimum length of 6!")
    .matches(/[A-Z]/)
    .withMessage("Password must have atleast one Upper Case Letter!")
    .matches(/[a-z]/)
    .withMessage("Password must have atleast one Lower Case Letter!")
    .matches(/\d/)
    .withMessage("Password must contain a Number!")
}

function checkUsername(req) {
  if(req.body.username.includes(".")) {          // temporary
    return res.status(401).json({
        error : "Username cannot have ."
    })
  }
  req.check("username").notEmpty().withMessage("Username cannot be empty")
}

function checkEmail(req) {
  req.check("email").notEmpty().withMessage("Email cannot be empty")
    .isEmail().withMessage("Provide valid Email")
    // .isLength({
    //   min: 4,
    //   max: 2000
    // });
}

