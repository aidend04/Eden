const express = require('express');
const router =  express.Router();
const Expense = require('../models/expense-model');
const User = require('../models/user-model');
const Agenda = require('agenda');
const mongoConnectionString = 'mongodb://127.0.0.1/Eden';

const agenda = new Agenda({db: {address: mongoConnectionString}});

let expense = 'none';

router.post('/', async (req, res) => {

    let user_paid = req.body.userPaid;
    let userPaid = await User.findOne({Username: user_paid});
    if (!userPaid) {
        throw new Error('User not found');
    }

    let usersOwe = [];


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

        }
    }



    for (let user of usersOwe){
        console.log(user);
        let curr = await User.findById(user.user);
        console.log(curr)
        let cat = req.body.category;
        const date = new Date();
        const month = date.getMonth();
    
        let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
        let currMonth = months[month];

        let cats = curr.ByCat[currMonth];

        if (cats && cats[cat] !== undefined) {
            curr.ByCat[currMonth][cat] += Number(user.amount);
        } else {
            curr.ByCat[currMonth] = {
                'Dining Out': 0,
                'Groceries': 0,
                'Subscriptions': 0,
                'Rent': 0,
                'Utilities': 0,
                'Amazon': 0,
                'Misc': 0
            };
            // Now add the amount to the correct category
            curr.ByCat[currMonth][cat] = Number(user.amount);
        }

        curr.MonthlyAvg[currMonth] += Number(user.amount);

        await curr.save();

    }


    if (req.body.return_prices.type === "evenly"){

        if (req.body.return_prices.recur){

            expense = new Expense({
                amount: req.body.amount,
                category: req.body.category,
                description: req.body.description,
                date: req.body.date,
                dateAdded: new Date(),
                userPaid: userPaid._id,
                usersOwe: usersOwe,
                recur: {interval: req.body.return_prices.recur.interval, nextDueDate: req.body.return_prices.recur.nextDueDate}
           }); 

           await expense.save();
           const interval = convert(req.body.return_prices.recur.interval)
           

           await agenda.every(interval, 'create recur'+expense._id, { expenseId: expense._id });
            
        } else {
            expense = new Expense({
                amount: req.body.amount,
                description: req.body.description,
                category: req.body.category,
                date: req.body.date,
                dateAdded: new Date(),
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
                dateAdded: new Date(),
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
                dateAdded: new Date(),
                usersOwe: usersOwe,
                userPaid: userPaid._id
           }); 
           await expense.save();
        }
    }

    const date = new Date();
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


    let currUser = await User.findOne({Username: req.session.userId}).populate('MonthlyExpenses.expenses');

    let currExpenses = null
    for (let key in currUser.MonthlyExpenses){
        
        if (currUser.MonthlyExpenses[key].month === currMonth){
            currExpenses = currUser.MonthlyExpenses[key].expenses;
        }
    }


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
           let recur = expense.recur;
           let id = expense._id.toString();
            

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

           arr.push({userOwe, userPaid, date, category, description, amount, status, recur, id});

        }
        res.json(arr);
    } else {
        res.json({response: 'Looks a little empty...'});
    }


});

router.post('/find-specific', async (req, res) => {

    let expense = await Expense.findOne({_id: req.body.id}).populate('userPaid')
    .populate('usersOwe')
    .populate({
        path: 'usersOwe.user', // Specify the path to the nested documents
    });
    let currUser = req.session.userId;

    let user = false;

    if (currUser === expense.userPaid.Username){
        user = true;
    }

    let owe = [];

    let total = 0;

    for (let user of expense.usersOwe){
        
        let username = user.user.Username;
        let paid = user.paid;
        let amount = user.amount;

        total += amount;

        let currObj = {};
        currObj.username = username;
        currObj.paid = paid;
        currObj.amount = amount;

        owe.push(currObj);
    }

    

    res.json({user, owe, total});

})

router.delete('/delete', async (req, res) => {
    
    let currUser = await User.findOne({Username: req.session.userId}).populate('Group');
    let currGroup = await currUser.Group.populate('Members');

    let expense = await Expense.findById(req.body.id);

    let month = expense.dateAdded.getMonth();

    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let currMonth = months[month];

    let members = currGroup.Members;

    let currKey = null;

    let currExpenses = null

    for (let element of members) {
        await element.populate('MonthlyExpenses.expenses');

        for (let key in element.MonthlyExpenses){
            
            if (currUser.MonthlyExpenses[key].month === currMonth){
                currExpenses = currUser.MonthlyExpenses[key].expenses;
                currKey = key;
            }
        }
        

        
        let deleteExp = await Expense.findById(req.body.id);

        console.log(deleteExp);



        let cat = deleteExp.category;

        
        let usersOwing = deleteExp.usersOwe;
        console.log(usersOwing);

        for (let user of usersOwing){
            
            let curr = await User.findById(user.user);

            curr.ByCat[currMonth][cat] -= Number(user.amount);
            curr.MonthlyAvg[currMonth] -= Number(user.amount);

            await curr.save();

        }

        currExpenses = currExpenses.filter(expense => !expense._id.equals(req.body.id));

        element.MonthlyExpenses[currKey].expenses = currExpenses;
        
        await element.save(); // Save the updated element

    }

    agenda.now('remove recur job', { expenseId: req.body.id });
    res.json('done');
});

router.post('/pay', async (req, res) => {
    let expense = await Expense.findById(req.body.id).populate('usersOwe.user');
    let currUser = await User.findOne({Username: req.session.userId});

    for (let User of expense.usersOwe){
        if (User.user._id.equals(currUser._id)){
            User.paid = true;
        }

    }

    await expense.save();

    res.json('paid');
})

agenda.define('create recur'+expense._id, async job => {
    // Logic to send a reminder
    let { expenseId } = job.attrs.data;

    let expense = await Expense.findOne({_id: expenseId});

    expense.date = new Date().toISOString().split('T')[0];

    let cat = expense.category;

    let month = new Date().getMonth();
    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let currMonth = months[month];

    for (let object of expense.usersOwe){
        if (!object.user.equals(expense.userPaid))
            object.paid = false;
        
        let curr = await User.findById(object.user);

        curr.ByCat[currMonth][cat] += Number(object.amount);
        curr.MonthlyAvg[currMonth] += Number(object.amount);

        await curr.save();

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

  agenda.define('remove recur job', async job => {
    // Extract the expenseId from the job's data
    const { expenseId } = job.attrs.data;

    // Use the expenseId to build the name of the job you want to cancel
    const jobName = 'create recur' + expenseId;

    // Cancel the job with the matching name
    await agenda.cancel({ name: jobName });

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