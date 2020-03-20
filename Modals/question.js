const mongoose = require("mongoose");
const schema = mongoose.Schema;

const questionSchema = new mongoose.Schema({
    statement : {
      type : String,
      trim : true,
      required : true
    },
    asked_by : {
        type : schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    answers : [{
        type : schema.Types.ObjectId,
        ref : "answers",
        default : [],
    }],
    tags : [{
        type : String,
        trim : true,
    }]
});

const questionSchema = mongoose.model("questions", questionSchema);
module.exports = questionSchema;