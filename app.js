const express = require("express");
const bodyParser = require("body-parser");
const lodash = require("lodash");

//Setting up the server and ejs
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//Setting up the Project DB
const mongoose = require("mongoose");
const { type } = require("os");
let db = "";
async function main(){
    try{
        db = mongoose.connect("mongodb://127.0.0.1:27017/moneyDB", {useNewUrlParser: true});
        console.log("successfully connected to the database");
    } catch(err) {
        console.log(err);
    }
}
main();
const subSchema = new mongoose.Schema({
    amount: String,
    operation: String,
    user: String
});
const transaction_schema = new mongoose.Schema({
    flag: String,
    db_total_money_send: String,
    db_total_money_receive: String,
    db_current_money_send: String,
    db_current_money_receive: String,
    transactions: [subSchema]
});

const Transaction = mongoose.model("transactions",transaction_schema);


//Getting request for home page
app.get("/", function(req, res){
    Transaction.findOne({flag: "true"}).then(async (doc) => {
        res.render("home", {
            transactions: doc.transactions,
            home_total_money_send: doc.db_total_money_send,
            home_total_money_receive: doc.db_total_money_receive,
            home_current_money_send: doc.db_current_money_send,
            home_current_money_receive: doc.db_current_money_receive
        });
    });
});


//handling post request
app.post("/send", function(req, res){
    const new_transaction = {
        amount: req.body.amount,
        operation: "Send",
        user: "to " + req.body.sendto
    };
    Transaction.findOne({flag: "true"}).then(async (doc) => {
        var old_transactions = doc.transactions;
        var old_current_money_receive = Number(doc.db_current_money_receive) + Number(req.body.amount);
        var old_total_money_send = Number(doc. db_total_money_send) + Number(req.body.amount);
        old_transactions.push(new_transaction);
        const filter = { flag: "true" };
        const update = { 
            transactions: old_transactions,
            db_current_money_receive: String(old_current_money_receive),
            db_total_money_send: String(old_total_money_send)
        };
        await Transaction.updateOne(filter, update);
    });
    res.redirect("/");
});


app.post("/receive", function(req, res){
    const new_transaction = {
        amount: req.body.amount,
        operation: "Received",
        user: "from " + req.body.receiveFrom
    };
    Transaction.findOne({flag: "true"}).then(async (doc) => {
        var old_transactions = doc.transactions;
        var old_current_money_send = Number(doc.db_current_money_send) + Number(req.body.amount);
        var old_total_money_receive = Number(doc.db_total_money_receive) + Number(req.body.amount);
        old_transactions.push(new_transaction);
        const filter = { flag: "true" };
        const update = { 
            transactions: old_transactions,
            db_current_money_send: String(old_current_money_send),
            db_total_money_receive: String(old_total_money_receive)
        };
        await Transaction.updateOne(filter, update);
    });
    res.redirect("/");
});



//Listening to the port 3000
app.listen(3000, function(){
    console.log("Server started on port 3000");
});

