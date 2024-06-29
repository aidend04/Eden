const express = require('express');
const router =  express.Router();
const Expense = require('../models/expense-model');
const User = require('../models/user-model');
const Agenda = require('agenda');
const Group = require('../models/group-model');
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
            console.log('this is currObj' + currObj.amount);
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


    let grp = await Group.findOne({Name: req.session.groupId});
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

        console.log("This is cats" + cats);

        if (!curr._id.equals(userPaid._id)){
            console.log('here is id' + userPaid._id);
            console.log(grp);
            console.log(grp.WhoOwe);
            console.log(grp.WhoOwe[userPaid._id][curr._id] += Number(user.amount));
            try{
                grp.markModified('WhoOwe');
                await grp.save();
            } catch (error) {
                console.error();
            }

        }

        if (cats) {
            curr.ByCat[currMonth][cat] += Number(user.amount);
        } else {
            curr.ByCat[currMonth] = {
                'Dining Out': 0,
                'Entertainment': 0,
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

    
    let userTruthy = false;

    let loggedIn = await User.findOne({Username: req.session.userId});

    for (let user of req.body.userPay){
    // Check if the month already exists in the user's MonthlyExpenses
    
    let currUser = await User.findOne({Username: user});
    if (currUser._id.equals(loggedIn._id)){
        userTruthy = true;
    }
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

    if (!userTruthy){
        const monthExists = loggedIn.MonthlyExpenses.some(me => me.month === currMonth);
    
    if (monthExists) {
        // If the month already exists, add the expense to the expenses array for that month
        await User.updateOne(
            { _id: loggedIn._id, 'MonthlyExpenses.month': currMonth },
            { $push: { 'MonthlyExpenses.$.expenses': expense._id } }
        );
    } else {
        // If the month doesn't exist, add a new month to the MonthlyExpenses array and add the expense to the expenses array for that month
        await User.updateOne(
            { _id: loggedIn._id },
            { $push: { MonthlyExpenses: { month: currMonth, expenses: [expense._id] } } }
        );
    }

    }
});

router.post('/curr-expenses', async (req, res) => {

    let date = new Date();
    let month = date.getMonth();
    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let currMonth = req.body.month;
    console.log(req.body.month);


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

        console.log('this is arr' + arr)
        res.json(arr);
    } else {
        res.json({response: 'Looks a little empty...'});
    }


});

router.post('/find-specific', async (req, res) => {
    try {
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
    } catch (error) {
        res.send('not good');
    }


})

router.post('/create-table', async (req, res) => {
    let currUser = await User.findOne({Username: req.session.userId});
    let grp = await Group.findOne({Name: req.session.groupId});

    let whoOwe = grp.WhoOwe;

    let youOwe = [];
    let theyOwe = [];

    for (let user in whoOwe) {
        console.log('this is user' + user);
        if (currUser._id.toString() === user) {
            for (let [key, value] of Object.entries(whoOwe[user])) {
                let user2 = await User.findById(key);
                theyOwe.push([user2.Username, value]);
            }
        } else {
            for (let [key, value] of Object.entries(whoOwe[user])) {
                if (currUser._id.toString() === key) {
                    let user1 = await User.findById(user);
                    youOwe.push([user1.Username, value]);
                }
            }
        }
    }

    console.log({youOwe, theyOwe}, 'This is youOwe and theyOwe');

    // Assuming you want to send this data back to the client
    res.json({youOwe, theyOwe});
});

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

    let grp = await Group.findOne({Name: req.session.groupId});
        
    let deleteExp = await Expense.findById(req.body.id).populate('userPaid');

    console.log(deleteExp);

    let userPaid = deleteExp.userPaid._id;

    let cat = deleteExp.category;

    
    let usersOwing = deleteExp.usersOwe;
    console.log(usersOwing);

    for (let user of usersOwing){
        
        let curr = await User.findById(user.user);
        for (let key in curr.MonthlyExpenses){
            
            if (currUser.MonthlyExpenses[key].month === currMonth){
                currExpenses = currUser.MonthlyExpenses[key].expenses;
                currKey = key;
                break;
            }
        }
    
        
        let subtractionResult = curr.ByCat[currMonth][cat] - Number(user.amount);
        console.log(`Before subtraction: ${curr.ByCat[currMonth][cat]}`);
        curr.ByCat[currMonth][cat] = subtractionResult; // Apply the subtraction
        console.log(`After subtraction: ${curr.ByCat[currMonth][cat]}`);
        console.log(curr.MonthlyAvg[currMonth]);
        curr.MonthlyAvg[currMonth] -= subtractionResult;

        if (!curr._id.equals(userPaid)){
            grp.WhoOwe[userPaid][curr._id] -= Number(user.amount);
        }

        grp.markModified('WhoOwe');
        await grp.save();

        curr.markModified(`ByCat.${currMonth}.${cat}`);
        await curr.save();

        currExpenses = currExpenses.filter(expense => !expense._id.equals(req.body.id));

        curr.MonthlyExpenses[currKey].expenses = currExpenses;
        
        await curr.save();

    }

 // Save the updated element


    agenda.now('remove recur job', { expenseId: req.body.id });
    // You can directly use the ID without fetching the document first
    await Expense.findOneAndDelete({ _id: req.body.id })
    .then(() => console.log('Expense deleted successfully'))
    .catch(err => console.error('Error deleting expense:', err));
    res.json('done');
});

router.post('/pay', async (req, res) => {
    let expense = await Expense.findById(req.body.id).populate('usersOwe.user');
    let currUser = await User.findOne({Username: req.session.userId});
    let grp = await Group.findOne({Name: req.session.groupId});

    for (let User of expense.usersOwe){
        if (User.user._id.equals(currUser._id)){

            if (!User.paid){
                User.paid = true;
                console.log(grp.WhoOwe[expense.userPaid][currUser._id] -= User.amount);
            }

        }

    }

    grp.markModified('WhoOwe');
    await grp.save();
    await expense.save();

    res.json('paid');
})

router.post('/get-data', async (req, res) => {
    let currUser = await User.findOne({Username: req.session.userId});

    let catData = [];
    let monData = [];

    let catDataCurr = currUser.ByCat;
    let monDataCurr = currUser.MonthlyAvg;

    let month = new Date().getMonth();

    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let currMonth = req.body.month;
    console.log(currMonth + 'this is currMonth')

    catDataCurr = catDataCurr[currMonth];

    for (let cat in catDataCurr){
        let arr = [];
        arr.push(cat);
        arr.push(catDataCurr[cat]);
        catData.push(arr);

        if (cat === 'Misc'){
            break;
        }
    }

    console.log(monDataCurr);

    for (let mon in monDataCurr){
        let arr = [];
        arr.push(mon);
        arr.push(monDataCurr[mon]);
        monData.push(arr);

        if (mon === 'DEC'){
            break;
        }
    }

    res.json({catData: catData, monData: monData});

});

agenda.define('create recur'+expense._id, async job => {
    // Logic to send a reminder
    let { expenseId } = job.attrs.data;

    let expense = await Expense.findOne({_id: expenseId});

    expense.date = new Date().toISOString().split('T')[0];

    let cat = expense.category;

    let month = new Date().getMonth();
    let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let currMonth = months[month];
  
    let date = new Date(expense.date);

    let month1 = date.getMonth();
    let month2 = null;
    switch (expense.recur.interval) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            month2 = date.getMonth();
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            month2 = date.getMonth();
            break;
        case 'bi-weekly':
            date.setDate(date.getDate() + 14);
            month2 = date.getMonth();
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            month2 = date.getMonth();
            break;
        case 'annually':
            date.setYear(date.getFullYear() + 1);
            month2 = date.getMonth();
            break;
    }

    
        for (let object of expense.usersOwe){
            if (!object.user.equals(expense.userPaid))
                object.paid = false;
            
            let curr = await User.findById(object.user);
    
            curr.ByCat[currMonth][cat] += Number(object.amount);
            curr.MonthlyAvg[currMonth] += Number(object.amount);

            if (month1 != month2){
                if (curr.MonthlyExpenses.months[month2]) {
                    // If the month already exists, add the expense to the expenses array for that month
                    await User.updateOne(
                        { _id: currUser._id, 'MonthlyExpenses.month': months[month2] },
                        { $push: { 'MonthlyExpenses.$.expenses': expense._id } }
                    );
                } 
            }

            await curr.save();
    
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