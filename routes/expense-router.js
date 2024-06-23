const express = require('express');
const router =  express.Router();
const Expense = require('../models/expense-model');
const User = require('../models/user-model');
const Agenda = require('agenda');
const mongoConnectionString = 'mongodb://127.0.0.1/Eden';

const agenda = new Agenda({db: {address: mongoConnectionString}});

let expense = 'none';

router.post('/', async (req, res) => {
    console.log(req.body);

    let user_paid = req.body.userPaid;
    let userPaid = await User.findOne({Username: user_paid});
    if (!userPaid) {
        throw new Error('User not found');
    }

    let usersOwe = [];
    console.log(req.body.userPay);

    if (req.body.return_prices.type === "evenly"){
        for (let user of req.body.userPay){
            let currObj = {};
            let currUser = await User.findOne({Username: user});
            currObj.user = currUser._id;
            currObj.amount = req.body.return_prices.per_person;
            if (userPaid._id.toString() === currUser._id.toString()){
                currObj.paid = true;
            }
            usersOwe.push(currObj);
            console.log(currObj);
        }
    } else {
        for (let user of req.body.userPay){
            let currObj = {};
            let currUser = await User.findOne({Username: user});
            currObj.user = currUser._id;
            currObj.amount = req.body.return_prices.custom_price[user];
            if (userPaid._id.toString() === currUser._id.toString()){
                currObj.paid = true;
            }
            usersOwe.push(currObj);
            console.log(currObj);
        }
    }

    console.log("hi");
    // console.log(userPaid._id);
    // console.log(usersOwe);


    if (req.body.return_prices.type === "evenly"){
        console.log("hi");
        console.log(req.body.return_prices.recur);
        if (req.body.return_prices.recur){
            console.log("bye");
            expense = new Expense({
                amount: req.body.amount,
                category: req.body.category,
                description: req.body.description,
                date: req.body.date,
                userPaid: userPaid._id,
                usersOwe: usersOwe,
                recur: {interval: req.body.return_prices.recur.interval, nextDueDate: req.body.return_prices.recur.nextDueDate}
           }); 
           console.log("hi");
           await expense.save();
           const interval = convert(req.body.return_prices.recur.interval)
           
           console.log(interval);
           console.log('id' + expense._id)

           await agenda.every(interval, 'create recur'+expense._id, { expenseId: expense._id });
            
        } else {
            expense = new Expense({
                amount: req.body.amount,
                description: req.body.description,
                category: req.body.category,
                date: req.body.date,
                userPaid: userPaid._id,
                usersOwe: usersOwe
           }); 
           await expense.save();
        }
    } else {
        if (req.body.return_prices.recur){
            expense = new Expense({
                amount: req.body.amount,
                description: req.body.description,
                category: req.body.category,
                date: req.body.date,
                userPaid: userPaid._id,
                usersOwe: usersOwe,
                recur: {interval: req.body.return_prices.recur.interval, nextDueDate: req.body.return_prices.recur.nextDueDate}
           }); 
           const interval = convert(req.body.return_prices.recur.interval); 
           await expense.save();
           await agenda.every(interval, 'create recur'+expense._id, { expenseId: expense._id.toString() });

        } else {
            expense = new Expense({
                amount: req.body.amount,
                description: req.body.description,
                category: req.body.category,
                date: req.body.date,
                usersOwe: usersOwe,
                userPaid: userPaid._id
           }); 
           await expense.save();
        }
    }

    const date = new Date(req.body.date);
    const month = date.getMonth();

    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let currMonth = months[month];

    for (let user of req.body.userPay){
    // Check if the month already exists in the user's MonthlyExpenses
    let currUser = await User.findOne({Username: user});
    const monthExists = currUser.MonthlyExpenses.some(me => me.month === currMonth);
    
    if (monthExists) {
        // If the month already exists, add the expense to the expenses array for that month
        await User.updateOne(
            { _id: currUser._id, 'MonthlyExpenses.month': currMonth },
            { $push: { 'MonthlyExpenses.$.expenses': expense._id } }
        );
    } else {
        // If the month doesn't exist, add a new month to the MonthlyExpenses array and add the expense to the expenses array for that month
        await User.updateOne(
            { _id: currUser._id },
            { $push: { MonthlyExpenses: { month: currMonth, expenses: [expense._id] } } }
        );
    }
    }

});

router.post('/curr-expenses', async (req, res) => {

    let date = new Date();
    let month = date.getMonth();
    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let currMonth = months[month];

    console.log(currMonth);

    let currUser = await User.findOne({Username: req.session.userId}).populate('MonthlyExpenses.expenses');

    let currExpenses = null
    for (let key in currUser.MonthlyExpenses){
        
        if (currUser.MonthlyExpenses[key].month === currMonth){
            currExpenses = currUser.MonthlyExpenses[key].expenses;
        }
    }

    console.log(currExpenses);

    if (currExpenses && currExpenses.length > 0){

        let arr = [];
        for (let expense of currExpenses){
            await expense.populate('userPaid');
            await expense.populate('usersOwe');
           
           let userOwe = currUser.Username;
           let userPaid = expense.userPaid.Username;
           let date = expense.date;
           let category = expense.category;
           let description = expense.description;

           if (userPaid === userOwe){
               userPaid = 'you';
           }

           let amount = null;
           let status = null;
           for (let curr of expense.usersOwe){
               if (curr.user._id.equals(currUser._id)){
                   amount = curr.amount;
                   status = curr.paid;
               }
           } 

           arr.push({userOwe, userPaid, date, category, description, amount, status});

        }
        res.json(arr);
    } else {
        res.json({response: 'Looks a little empty...'});
    }


});

agenda.define('create recur'+expense._id, async job => {
    // Logic to send a reminder
    let { expenseId } = job.attrs.data;

    let expense = await Expense.findOne({_id: expenseId});

    console.log('in create recur ' + expense + ' create');

    expense.date = new Date().toISOString().split('T')[0];

    for (let object of expense.usersOwe){
        object.paid = false;
    }

    let date = new Date(expense.date);

    switch (expense.recur.interval) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'bi-weekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'annually':
            date.setYear(date.getFullYear() + 1);
            break;
    }

    expense.recur.nextDueDate = date.toString();

    await expense.save();

  });

(async function() { // IIFE to give us async context
    await agenda.start();
})();

function convert(interval){
    let str = '';
    switch (interval) {
        case 'daily':
            str = '1 day';
            break;
        case 'weekly':
            str = '1 week';
            break;
        case 'bi-weekly':
            str = '2 weeks';
            break;
        case 'monthly':
            str = '1 month';
            break;
        case 'annually':
            str = '1 year';
            break;
    }
    return str;
}


module.exports = router;