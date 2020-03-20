const mongoose = require("mongoose");
const schema = mongoose.Schema;

const answerSchema = new mongoose.Schema({
    statement : {
      type : String,
      trim : true,
      required : true
    },
    given_for_question : {
        type : schema.Types.ObjectId,
        ref : "questions",
        required : true
    },
    given_by_user : {
        type : schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    likes : [{
      type : schema.Types.ObjectId,
      ref : "users",
    }],
    dislikes : [{
      type : schema.Types.ObjectId,
      ref : "users",
    }]
});

const answerSchema = mongoose.model("answers", answerSchema);
module.exports = answerSchema;