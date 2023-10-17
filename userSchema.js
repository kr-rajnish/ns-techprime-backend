const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
    id: String,
    email: String,
    password: String,
});

module.exports = mongoose.model("user", userSchema);