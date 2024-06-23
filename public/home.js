window.addEventListener('load', function(event) {
    fetch('/home', {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        let selector = this.document.getElementById("userPaid");

        let customText = this.document.getElementById("custom-text");


        for (let i = 0; i < data.length; i++){
            let option = document.createElement("option");
            option.text = data[i].name;
            selector.appendChild(option)
        }

        let scrollableDiv = document.createElement('div');
        scrollableDiv.id = "scroll-div"
        scrollableDiv.style.overflowY = 'auto'; // Enable vertical scrolling
        scrollableDiv.style.maxHeight = '200px';
        scrollableDiv.style.maxWidth = '250px';

        customText.appendChild(scrollableDiv);

        if (data.length > 0){
            let option = document.createElement("input");
            option.type = "checkbox";
            option.value = "save";
            option.id = "confirm-save";
            option.checked = false;
            option.style.marginRight = "5px"; // Add a margin to the right of the checkbox
        
            let checkboxes = this.document.getElementById("userPay");
            for (let i = 0; i < data.length; i++){
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = data[i].name;
                checkbox.id = "id" + i;
            
                let label = document.createElement('label');
                label.htmlFor = "id" + i;
                label.appendChild(this.document.createTextNode(data[i].name));
            
                let checkboxWrapper = document.createElement("div");
                checkboxWrapper.appendChild(checkbox);
                checkboxWrapper.appendChild(label);
            
                checkboxes.appendChild(checkboxWrapper);
            
                // Add event listener to checkbox
                checkbox.addEventListener('change', function() {
                    let scrollableDiv = document.getElementById('scroll-div');
                    let inputId = this.value + '-input';
            
                    if (this.checked) {
                        // Checkbox is checked, add input to scrollableDiv
                        let label = document.createElement("label");
                        label.htmlFor = inputId;
                        label.textContent = this.value + ':';
            
                        let input = document.createElement('input');
                        input.type = 'number';
                        input.min = 0;
                        input.step = 0.01;
                        input.required = true;
                        input.id = inputId;
                        input.style.width = '40%';
                        input.style.color = 'black';
                        input.className = 'input-field';
                        let value = 0;
                        value = value.toFixed(2);
                        input.defaultValue = value;
            
                        scrollableDiv.appendChild(label);
                        scrollableDiv.appendChild(input);
                    } else {
                        // Checkbox is unchecked, remove input from scrollableDiv
                        let input = document.getElementById(inputId);
                        let label = document.querySelector(`label[for="${inputId}"]`);
                        console.log(label);
                        if (label) scrollableDiv.removeChild(label);
                        if (input) scrollableDiv.removeChild(input);
 
                    }
                });
            }

            let amountRemaining = document.getElementById("amount").value;

            let label = document.createElement("label");
            label.htmlFor = "confirm-save";
            label.appendChild(document.createTextNode("save"));
        
            let wrapper = document.createElement("div");
            wrapper.id = "confirm-save-wrapper"
            wrapper.style.display = "flex"; // Create a flex container
            wrapper.style.justifyContent = "center";
            wrapper.style.alignItems = "center";
            wrapper.appendChild(option);
            wrapper.appendChild(label);
        
            customText.appendChild(wrapper);

            let wrap = document.getElementById("confirm-save-wrapper");
            wrap.style.display = "none";
            let checkbox = document.getElementById('confirm-save');
            checkbox.classList.add('hidden'); // Add the hidden class
            checkbox.checked = false;

            document.getElementById('confirm-save').addEventListener('click', function(event){
                let checkboxWrapper = document.getElementById('userPay');

                // Get the selected users
                let selectedUsers = checkboxWrapper.querySelectorAll('input[type="checkbox"]:checked');
                console.log(selectedUsers);
            
                // If there are no selected users, prevent the checkbox from being checked
                if (selectedUsers.length === 0) {
                    event.preventDefault();
                }

                let saved = document.getElementById("confirm-save").checked;
                console.log(saved);
                if (saved){
                    document.getElementById('amountRemaining').textContent = "Amount remaining: $0.00";

                    let inputs = document.getElementById('scroll-div').querySelectorAll('.input-field');
                    inputs.forEach(input => {
                        input.disabled = true;
                    });

                } else {
                    let inputs = document.getElementById('scroll-div').querySelectorAll('.input-field');
                    inputs.forEach(input => {
                        input.disabled = false;
                    });
                }
            });
                        
        }

    })
    .catch(error => console.error('Error:', error));
});

fetch('/expense/curr-expenses', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
    }
})
.then(response => response.json())
.then(data => {

    let all = [];
    let paid = [];
    let unpaid = [];
    let recurring = [];

    let expenseAdd = document.getElementById('expense-add');
    if (data.response === 'Looks a little empty...'){
        console.log('hello')
        expenseAdd.textContent = 'Looks a little empty...';
    } else {
        for (let expense of data){
            let expenseDiv = createExpenseElement(expense.userOwe, expense.description, expense.category, expense.date, expense.userPaid, expense.status, expense.amount);

            all.push(expenseDiv);

            if (expense.status){
                paid.push(expenseDiv);
            } else {
                unpaid.push(expenseDiv);
            }

            if (expenseAdd.textContent === 'Looks a little empty...'){
                expenseAdd.textContent = ''; // Clear the text
            }
            expenseAdd.appendChild(expenseDiv);
        }

    }
    })
    .catch(error => {
        console.log(error);
    });

document.querySelector('form').addEventListener('submit', function(event) {
    let amount = Number(document.getElementById('amount').value);
    let category = document.getElementById('category').value;
    let date = document.getElementById('date').value;
    let userPaid = document.getElementById('userPaid').value;
    let userPayCheckboxes = document.querySelectorAll('#userPay input[type="checkbox"]:checked');
    let description = document.getElementById("description").value;

    // Create an array of the values of the checked checkboxes

    let userPay = Array.from(userPayCheckboxes).map(checkbox => checkbox.value);

    
    // Check if all fields are completed
    let missingFields = [];

    if (!amount) missingFields.push('amount');
    if (!description) missingFields.push('description');
    if (!category) missingFields.push('category');
    if (!date) missingFields.push('date');
    if (!userPaid) missingFields.push('userPaid');
    if (userPay.length === 0) missingFields.push('Users Owing');
    if (document.getElementById('evenly').style.color !== "rgba(0, 0, 0, 0.89)" && document.getElementById('custom').style.color !== "rgba(0, 0, 0, 0.89)"){
        missingFields.push("Split Type");
    }
    if (document.getElementById('recurring').checked){
        if (!(document.getElementById('recur_options').value)){
            missingFields.push("Recurring Option");
        }
    }
    
    console.log(missingFields);


    if (missingFields.length > 0) {
        event.preventDefault();
        // Assuming 'missingFieldRegion' is the ID of the element where you want to display the missing fields
        let missingFieldRegion = document.getElementById('missing-field');
        missingFieldRegion.style.display = 'block'; // Unhide the missing field region
        missingFieldRegion.textContent = `Please complete the following fields: ${missingFields.join(', ')}`;
        missingFieldRegion.style.color = 'red';
        return;
    }

    let per_person = 0;
    let return_prices = {};

    let evenly = document.getElementById('evenly').style.color;
    let custom = document.getElementById('custom').style.color;
    let currSelect = (evenly === "rgba(0, 0, 0, 0.89)" ? "evenly" : "custom");

    console.log(currSelect);

    if (currSelect === "evenly"){
        if (!userPay.includes(userPaid)) {
            userPay.unshift(userPaid);
        }
        return_prices.type = "evenly";
        per_person = ((Math.ceil(amount / userPayCheckboxes.length) * 100) / 100).toFixed(2);
        return_prices.per_person = per_person;
        if (document.getElementById('recur_options').value){
            return_prices.recur = {
                interval: document.getElementById('recur_options').value,
                nextDueDate: calculateDate(date, document.getElementById('recur_options').value)
            }
        }
    }

    if (currSelect === "custom"){
        return_prices.custom_price = {};
        return_prices.type = "custom";
        for (let user of userPay){
            console.log(user);
            let value = Number(document.getElementById(`${user}-input`).value);
            return_prices.custom_price[user] = value;
        }
        if (document.getElementById('recur_options').value){
            return_prices.recur = {
                interval: document.getElementById('recur_options').value,
                nextDueDate: calculateDate(date, document.getElementById('recur_options').value)
            }
        }
    }

    fetch('/expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({amount: amount, category: category, date: date, userPaid: userPaid, userPay: userPay, return_prices: return_prices, description: description})
    })
    .then(response => response.json())
    .catch(error => {
        console.log(error);
    })
});

let app = document.getElementById('app');
let hour = new Date().getHours();

if (hour < 6 || hour >= 18)
{
    // Night time
    app.classList.add('dark');
    app.classList.add('text-white');
} else
{
    // Day time
    app.classList.add('light');
    app.classList.add('text-black');
}

let monthElement = document.getElementById('month');
let monthAbbreviations = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let currentMonth = new Date().getMonth();
monthElement.textContent = monthAbbreviations[currentMonth];

document.getElementById('menu-btn').addEventListener('click', function ()
{
    this.classList.toggle('open');
    let menu = document.getElementById('menu-ctr');
    menu.classList.toggle('show');
});
document.getElementById('add-btn').addEventListener('click', function() {
    this.classList.toggle('open-expense');
    let popup = document.getElementById('expense-form');
    popup.classList.toggle('show');
    popup.reset();
    document.getElementById('missing-field').style.display = 'none';
});

document.getElementById('evenly').addEventListener('mouseenter', function() {
    let users = document.querySelectorAll('.checkbox-grid input[type="checkbox"]');
    let selectedUsers = Array.prototype.slice.call(users).filter(x => x.checked);
    let count = selectedUsers.length + 1;
    let amountValue = document.getElementById('amount').value;
    let userPaid = document.getElementById("userPaid").value;

    selectedUsers.forEach(user => {
        if (user.value == userPaid) {
            count--;
        }
    });

    if (amountValue == "" && count < 1) {
        document.getElementById('evenly-text').textContent = "Please enter amount and select users";
    } else if (amountValue == "") {
        document.getElementById('evenly-text').textContent = "Please enter amount";
    } else if (count < 1) {
        document.getElementById('evenly-text').textContent = "Please select users";
    } else {
        let perPersonAmount = Math.ceil((amountValue / count) * 100) / 100;
        document.getElementById('evenly-text').textContent = `Amount: ${amountValue} / ${count} = $${perPersonAmount.toFixed(2)} per person`;
    }
});

let finalAmount = 'a';

document.getElementById('custom').addEventListener('mouseenter', function(event){
    let scrollDiv = document.getElementsByClassName("form-content")[0];
    scrollDiv.scrollLeft = scrollDiv.scrollWidth;
    event.stopPropagation();
    let tooltip = this.querySelector('.tooltip');
    document.getElementById('custom').style.color = "rgba(0, 0, 0, 0.89)";

        // If the tooltip is already visible, return early
    if (tooltip.style.visibility === 'visible') {
        return;
    }
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';// Show the overlay
    document.getElementById('overlay').style.display = 'block';
    let amountTotal = Number(document.getElementById('amount').value);
    let amountRemaining = 0;

    if (finalAmount === 'a'){
        amountRemaining = amountTotal;
    } else {
        amountRemaining = finalAmount;
    }

    document.getElementById("amountTotal").textContent = `Amount Total: $${amountTotal.toFixed(2)}`;
    document.getElementById("amountRemaining").textContent = `Amount Remaning: $${amountRemaining.toFixed(2)}`;
    document.getElementById("expense-form").querySelectorAll('input').forEach(function(input){
        input.disabled = true;
    });
    document.getElementById("expense-form").querySelectorAll('select').forEach(function(select){
        select.disabled = true;
    });
    document.getElementById("custom").querySelectorAll('input').forEach(function(input){
        input.disabled = false;
    })

    // Get all the checkboxes in the userPay section
    let userCheckboxes = document.querySelectorAll('#userPay input[type="checkbox"]');

    // Count the number of checked checkboxes
    let checkedCount = Array.from(userCheckboxes).reduce((count, checkbox) => {
        return count + (checkbox.checked ? 1 : 0);
    }, 0);

    // Get the save button
    let saveButton = document.getElementById('confirm-save-wrapper');
    let checkbox = document.getElementById('confirm-save');

    // If no checkboxes are checked, hide the save button
    if (amountRemaining === 0 && checkedCount > 0 && checkbox != null){
                let wrap = document.getElementById("confirm-save-wrapper");
                wrap.style.display = "flex";
                let checkbox = document.getElementById('confirm-save');
                checkbox.disabled = false;
                checkbox.classList.remove('hidden'); // Add the hidden class
            } else {
                if (checkbox != null){
                    let wrap = document.getElementById("confirm-save-wrapper");
                    wrap.style.display = "none";
                    let checkbox = document.getElementById('confirm-save');
                    checkbox.disabled = true;
                    checkbox.classList.add('hidden'); // Add the hidden class
                }
            }

    let previousValues = new Map();
    // Add an input event listener to each input field
    document.querySelectorAll('.input-field').forEach(function(inputField) {
        previousValues.set(inputField, Number(inputField.value));
        
        let checkedCount = Array.from(userCheckboxes).reduce((count, checkbox) => {
            return count + (checkbox.checked ? 1 : 0);
            }, 0);

        let count = 0;
        
        inputField.addEventListener('input', function() {

            let checkedCount = Array.from(userCheckboxes).reduce((count, checkbox) => {
                return count + (checkbox.checked ? 1 : 0);
            }, 0);
            let newValue = Number(this.value);
            let previousValue = previousValues.get(inputField);

            // Subtract the previous value of the input field from amountRemaining
            
            amountRemaining += previousValue;

            // Add the new value of the input field to amountRemaining
            amountRemaining -= newValue;

            // Update the text content of the #amountRemaining element
            if (amountRemaining < 0){
                document.getElementById("amountRemaining").textContent = "This split adds up incorrectly";
                document.getElementById("amountRemaining").style.color = "red";
            } else {
                document.getElementById("amountRemaining").style.color = "white";
                document.getElementById("amountRemaining").textContent = `Amount Remaining: $${amountRemaining.toFixed(2)}`;    
            }
            
            let checkbox = document.getElementById('confirm-save');

            if (amountRemaining === 0 && checkedCount > 0 && checkbox != null){
                let wrap = document.getElementById("confirm-save-wrapper");
                wrap.style.display = "flex";
                let checkbox = document.getElementById('confirm-save');
                checkbox.classList.remove('hidden'); // Add the hidden class
                checkbox.disabled = false;
            } else {
                if (checkbox != null){
                    let wrap = document.getElementById("confirm-save-wrapper");
                    wrap.style.display = "none";
                    let checkbox = document.getElementById('confirm-save');
                    checkbox.classList.add('hidden'); // Add the hidden class
                    checkbox.disabled = true;
                }
            }
            // Update the previous value
            previousValues.set(inputField, newValue);
            finalAmount = amountRemaining;
        });
    });
});

let clickedEven = false;
let clickedOdd = true;

document.querySelector('.close-btn').addEventListener('click', function(event) {
    event.stopPropagation();    
    let tooltip = this.closest('.tooltip');
    document.getElementById('custom').style.color =  "rgb(190, 186, 186)";
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    document.getElementById('overlay').style.display = 'none'; // Hide the overlay
    document.getElementById("expense-form").querySelectorAll('input').forEach(function(input){
        input.disabled = false;
    });
    document.getElementById("expense-form").querySelectorAll('select').forEach(function(select){
        select.disabled = false;
    });

    let confirm = document.getElementById('confirm-save');

    if (confirm != null){
        if (document.getElementById('confirm-save').checked){
            if (document.getElementById('evenly').style.color === "rgba(0, 0, 0, 0.89)"){
                document.getElementById('evenly').style.color = "rgb(190, 186, 186)";
            }
            document.getElementById('custom').style.color = "rgba(0, 0, 0, 0.89)";
            clickedEven = false;
            clickedOdd = true;
        }
    }


    if (clickedEven)
        document.getElementById('evenly').style.color = "rgba(0, 0, 0, 0.89)";
    else
        document.getElementById('evenly').style.color = "rgb(190, 186, 186)";

});

document.getElementById('custom').addEventListener('mouseover', function(event) {
    event.stopPropagation(event);
    let confirm = document.getElementById('confirm-save');
    if (confirm != null){
        let checked = document.getElementById('confirm-save').checked;
        if (checked != null)
            if (checked){
                let inputs = document.getElementById('scroll-div').querySelectorAll('.input-field');
                inputs.forEach(input => {
                    input.disabled = true;
                });
            }
    }

    if (clickedEven)
        document.getElementById('evenly').style.color = "rgb(190, 186, 186)"
});

document.getElementById('evenly').addEventListener('click', function(){

    if (document.getElementById('custom').style.color === "rgba(0, 0, 0, 0.89)"){
        document.getElementById('custom').style.color = "rgb(190, 186, 186)";
    }
    document.getElementById('evenly').style.color = "rgba(0, 0, 0, 0.89)"
    if (document.getElementById('confirm-save') != null)
        document.getElementById('confirm-save').checked = false;
        clickedEven = true;
        clickedOdd = false;
});

document.getElementById('evenly').addEventListener('mouseover', function() {
    document.getElementById('evenly').style.color = "rgba(0, 0, 0, 0.89)";
    document.getElementById('custom').style.color = "rgb(190, 186, 186)"
});

document.getElementById('evenly').addEventListener('mouseout', function() {
    let checkboxWrapper = document.getElementById('userPay');

    // Get the selected users
    let selectedUsers = checkboxWrapper.querySelectorAll('input[type="checkbox"]:checked');

    let clickedOdd = document.getElementById('confirm-save').checked;

    console.log(selectedUsers);
    if (!clickedEven)
        document.getElementById('evenly').style.color = "rgb(190, 186, 186)";

    
    if (clickedOdd && selectedUsers.length > 0)
        document.getElementById('custom').style.color = "rgba(0, 0, 0, 0.89)"
});

let dateInput = document.getElementById('date');
// Assuming this code is added to your existing JavaScript

// Step 2: Toggle visibility based on the "recurring" checkbox
document.getElementById('recurring').addEventListener('click', function(){
    let selector = document.getElementById('recur_options');

    if (document.getElementById('recurring').checked){
        selector.classList.remove('hidden');
        
        let today = new Date().toISOString().split('T')[0];
        dateInput.value = today; 
        dateInput.disabled = true;

         // Show the note when recurring is checked
    } else {
        selector.classList.add('hidden');

        dateInput.disabled = false;
        // Hide the note when recurring is not checked
    }
});

console.log("Width: " + window.innerWidth + ", Height: " + window.innerHeight);

function createExpenseElement(userOwe, description, category, date, userPaid, status, amount) {
    let expenseElement = document.createElement('div');
    expenseElement.className = 'expense-item';

    let topDiv = document.createElement('div');
    topDiv.className = 'top';

    let categoryElement = document.createElement('div');
    categoryElement.className = 'category';
    categoryElement.textContent = category;
    topDiv.appendChild(categoryElement);

    let dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = date;
    topDiv.appendChild(dateElement);

    expenseElement.appendChild(topDiv);

    let middleDiv = document.createElement('div');
    middleDiv.className = 'middle';

    let descriptionElement = document.createElement('div');
    descriptionElement.className = 'description';
    descriptionElement.textContent = description;
    middleDiv.appendChild(descriptionElement);

    let circleElement = document.createElement('div');
    circleElement.className = 'circle';
    middleDiv.appendChild(circleElement);

    let amountElement = document.createElement('div');
    amountElement.className = 'amount';
    amountElement.textContent = '$' + amount.toFixed(2);
    middleDiv.appendChild(amountElement);

    expenseElement.appendChild(middleDiv);

    let bottomDiv = document.createElement('div');
    bottomDiv.className = 'bottom';

    let userElement = document.createElement('div');
    userElement.className = 'user';
    userElement.textContent = 'Paid by: ' + userPaid;
    bottomDiv.appendChild(userElement);

    let statusElement = document.createElement('div');
    statusElement.className = 'status';
    statusElement.textContent = 'Status: ';

    let statusText = document.createElement('span');
    statusText.id = 'status-text';
    statusText.textContent = status ? 'paid' : 'un-paid';
    statusText.className = status ? 'paid' : 'not-paid';
    statusElement.appendChild(statusText);

    bottomDiv.appendChild(statusElement);

    expenseElement.appendChild(bottomDiv);

    return expenseElement;
}

function calculateDate(date, interval){

    date = new Date(date);
    console.log(interval, date);
    switch (interval) {
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
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;;
    
}



