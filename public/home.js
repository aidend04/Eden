let chartMyBudg;
let dataTableMyBudg;

window.addEventListener('load', function(event) {
    fetch('/home', {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {

        this.fetch('/expense/check-queue', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        .then(data => {
            if (!data.text){
                console.log(data.files);

                let description = data.files[0][0].trim();
                let amount = Number(data.files[0][1].trim());
                let date = null;
                if (data.files[0][2] !== ' No date'){
                    date = (data.files[0][2].trim())
                }
                let category = data.files[0][3].trim();

                console.log(category);

                let btn = this.document.getElementById('add-btn');
                btn.classList.toggle('open-expense');
                let popup = document.getElementById('expense-form');
                let backdrop = document.getElementById('backdrop-exp');

                btn.addEventListener('click', function(){
                    window.location.reload();
                })
                
                popup.classList.toggle('show');
    
            
                backdrop.style.display = 'flex';
                // Assuming amount, category, date, and description are the new values you want to set.
                document.getElementById('amount').value = amount; // Convert amount to a number if necessary
                document.getElementById('category').value = category;
                if (date !== null) {
                    document.getElementById('date').value = date;
                }
                document.getElementById("description").value = description;

                this.fetch('/expense/delete-img', {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

            } if (data.text){
                let btn = this.document.getElementById('add-btn');
                btn.addEventListener('click', function(){
                    window.location.reload();
                })
            }
                
        })
        let month = this.document.getElementById('month');
        let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        let currMonth = new Date().getMonth();
        month.value = months[currMonth];

        (async () => {
            await filter();
            await google.charts.load('current', {'packages':['corechart']});

            // Set a callback to run when the Google Visualization API is loaded
            await google.charts.setOnLoadCallback(drawChart);
            let total = 0;
            fetch('/expense/my-budgetChart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: 
                    JSON.stringify({month: document.getElementById('month').value})
                
            })
            .then(response => response.json())
            .then(data => {
                if (data !== 'not edited'){
                    this.document.getElementById('budgContent').textContent = '';
                    this.document.getElementById('create-budg').textContent = 'edit';
                    drawChart('draw please');
                    console.log('This is my data: ' + data)
                    data.forEach(element => {
                        let cat = element[0];
                        cat = callSwitch(cat);
                        console.log(cat);
                        document.getElementById(cat).value = Number(element[2]);
                        total += element[2]
                        updateChart(cat, Number(element[1]), Number(element[2]))
                        
                    })
                    
                document.getElementById('totalBudg').textContent = `Total: $${total.toFixed(2)}`
                } else {
                    console.log('edited');
                }
            })
            .catch(error => {
                console.log(error)
            })
        })();
        
        

        
        
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
        this.fetch('/expense/create-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        .then(data => {
            createTable(data);
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error('Error:', error));
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

        let users = document.querySelectorAll('.checkbox-grid input[type="checkbox"]');
        let selectedUsers = Array.prototype.slice.call(users).filter(x => x.checked);
        console.log(selectedUsers + 'selected');
        let count = selectedUsers.length + 1;
    
        selectedUsers.forEach(user => {
            if (user.value == userPaid) {
                count--;
            }
        });

        per_person = ((Math.ceil(amount / count) * 100) / 100).toFixed(2);


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

document.getElementById('add-btn').addEventListener('click', function() {
    this.classList.toggle('open-expense');
    let popup = document.getElementById('expense-form');
    let backdrop = document.getElementById('backdrop-exp');
    
    popup.classList.toggle('show');
    popup.reset();
    document.getElementById('missing-field').style.display = 'none';

    if (backdrop.style.display === 'flex')
        backdrop.style.display = 'none'
    else
        backdrop.style.display = 'flex';
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

function createExpenseElement(userOwe, description, category, date, userPaid, status, amount, id) {
    let expenseElement = document.createElement('div');
    expenseElement.className = 'expense-item';
    expenseElement.id = `expense-${id}`;

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
    if (amount === null)
        amount = 0;

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

document.addEventListener('DOMContentLoaded', function() {
    // Create the backdrop and popup elements
    document.querySelectorAll('#expensesDiv select').forEach(selectElement => {
        console.log(selectElement);
        selectElement.addEventListener('change', filter);
    });

    const backdrop = document.createElement('div');
    backdrop.classList.add('popup-backdrop');
    backdrop.id = 'backdrop-expense';
    const popupContent = document.createElement('div');
    popupContent.id = 'popup-expense'
    popupContent.classList.add('popup-content');
    backdrop.appendChild(popupContent);
    document.body.appendChild(backdrop);

    // Function to show the popup

    // Close the popup when the backdrop is clicked
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.style.display = 'none';
        }
    });
 
});

function showPopup(content) {
    let popupContent = document.getElementById('popup-expense');
    let backdrop = document.getElementById('backdrop-expense');
    let details = document.createElement('div');
    details.id = 'detailDiv';
    details.style.height = 'fit-content';
    details.style.width = '400px';

    let id = {id: content.id.substr(8)};

    fetch('/expense/find-specific', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(id)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if (data === 'not good'){
            window.location.reload(true);
            return;
        }

        console.log(data.total);
        if (Array.isArray(data.owe) && data.owe.length > 0) {
            let table = document.createElement('table');
            let headerRow = table.insertRow();
            let headerCell = document.createElement('th'); // Create a <th> element
            headerCell.style.paddingBottom = '10px'; // Adds 10px padding to the bottom of the header cell
            headerCell.colSpan = 3; // Set it to span across all 3 columns
            headerCell.textContent = 'Payment Outlook';
            headerCell.style.textAlign = 'center'; // Center the text
            headerRow.appendChild(headerCell); // Append the <th> to the header row
            table.style.marginLeft = 'auto';
            table.style.marginRight = 'auto';
            table.style.marginTop = '10px'


            table.className += " table-fixed";
            table.style.fontFamily = "'Courier New', Courier, monospace";

            let completed = true;

            data.owe.forEach(user => {
                let row = table.insertRow();
                let usernameCell = row.insertCell();
                usernameCell.className += " cell-min-width"; 
                usernameCell.textContent = user.username;
        
                let amountCell = row.insertCell();
                amountCell.className += " cell-min-width";
                amountCell.textContent = `$${user.amount.toFixed(2)}`;
        
                let statusCell = row.insertCell();
                statusCell.className += " cell-min-width"; 
                statusCell.textContent = user.paid === true ? 'paid' : 'unpaid' ;
                statusCell.style.color = user.paid === true ? 'green' : 'red';
                
                if (!user.paid) completed = false;

                usernameCell.style.textAlign = 'center'; // Center the text in usernameCell
                amountCell.style.textAlign = 'center'; // Center the text in amountCell
                statusCell.style.textAlign = 'center'; // Center the text in statusCell

                
                usernameCell.style.paddingBottom = '5px';
                amountCell.style.paddingBottom = '5px';
                statusCell.style.paddingBottom = '5px';
            });

            let finalRow = table.insertRow();
            let totalCell = finalRow.insertCell();
            totalCell.className += " cell-min-width"; 
            totalCell.textContent = 'Total: ';

            let amountCell = finalRow.insertCell();
            amountCell.className += " cell-min-width"; 
            amountCell.textContent = `$${data.total.toFixed(2)}`;

            let completeCell = finalRow.insertCell();
            completeCell.className += " cell-min-width"; 
            completeCell.textContent = completed === true ? 'complete' : 'incomplete' ;
            completeCell.style.color = completed === true ? 'green' : 'red';

            totalCell.style.textAlign = 'center';
            amountCell.style.textAlign = 'center';
            completeCell.style.textAlign = 'center';
 
            details.appendChild(table);

            let lastRow = table.rows[table.rows.length - 1];

            // Apply border styling to the last cell
            lastRow.style.border = '2px solid black';
        }

        let buttonDiv = document.createElement('div');
        buttonDiv.style.marginTop = '10px';
        buttonDiv.id = 'button-div';

        details.appendChild(buttonDiv);
        if (data.user === true){
            let button = document.createElement('button');
            button.id = `delete-${content.id.substr(8)}`;
            button.textContent = 'DELETE';
            buttonDiv.appendChild(button);
            button.classList.add('interact-button'); 

            console.log()
            button.addEventListener('click', function(){
                fetch( '/expense/delete', {

                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({id: button.id.substring(7), month: document.getElementById('month').value})

                })
                .then(response => response.json())
                .then(data => {
                    console.log('deleted');
                    window.location.reload(true);
                })
            })
        }

        let payButton = document.createElement('button');
        payButton.id = `pay-${content.id}`;
        payButton.textContent = 'PAY';
        payButton.className = 'interact-button';
        payButton.classList.add('interact-button');
        buttonDiv.appendChild(payButton);

        payButton.addEventListener('click', function(){
            fetch( '/expense/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id:  payButton.id.substring(12)})
            })
            .then(response => response.json())
            .then(data => {
                console.log('paid');
                window.location.reload(true);
            })
        })
    });

    popupContent.innerHTML = ''; // Clear previous content
    let clone = content.cloneNode(true);
    clone.style.width = '300px';
    clone.style.height = '250px';
    popupContent.appendChild(clone); // Clone and append the content to the popup
    popupContent.appendChild(details);
    backdrop.style.display = 'flex'; // Show the backdrop (and popup)
}

// Assuming the Google Charts library is loaded
async function filter(){

    fetch('/expense/curr-expenses', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({month: document.getElementById('month').value})
    })
    .then(response => response.json())
    .then(data => {
        
        console.log('I have selected' + document.getElementById('month').value);
        drawChart();

        let all = [];
        let paid = [];
        let unpaid = [];
        let recurring = [];
        let diningOut = [];
        let entertainment = [];
        let groceries = [];
        let subscriptions = [];
        let rent = [];
        let utilities = [];
        let amazon = [];
        let misc = [];
    
        let expenseAdd = document.getElementById('expense-add');
        if (data.response === 'Looks a little empty...'){
            console.log('hello')
            expenseAdd.innerHTML = '';
            expenseAdd.textContent = 'Looks a little empty...';
        } else {
            for (let expense of data){
                let expenseDiv = createExpenseElement(expense.userOwe, expense.description, expense.category, expense.date, expense.userPaid, expense.status, expense.amount, expense.id);
    
                all.push(expenseDiv);
    
                if (expense.status){
                    paid.push(expenseDiv);
                } else {
                    unpaid.push(expenseDiv);
                }
    
                if (expense.recur.interval){
                    recurring.push(expenseDiv);
                }
    
                switch (expense.category){
                    case 'Dining Out':
                        diningOut.push(expenseDiv);
                        break;
                    case 'Entertainment':
                        entertainment.push(expenseDiv);
                        break;
                    case 'Groceries':
                        groceries.push(expenseDiv);
                        break;
                    case 'Subscriptions':
                        subscriptions.push(expenseDiv);
                        break;
                    case 'Rent':
                        rent.push(expenseDiv);
                        break;
                    case 'Utilities':
                        utilities.push(expenseDiv);
                        break;
                    case 'Amazon':
                        amazon.push(expenseDiv);
                        break;
                    case 'Misc':
                        misc.push(expenseDiv);
                        break;
                }
    
                if (expenseAdd.textContent === 'Looks a little empty...'){
                    expenseAdd.textContent = ''; // Clear the text
                }

                let selector = document.getElementById('select-expenseType').value;
                let selector2 = document.getElementById('select-category').value;
                expenseAdd.innerHTML = '';
                let result;
    
                console.log(selector2)
                switch (selector2){
                    case 'all':
                        result = all;
                        break;
                    case 'Dining Out':
                        result = diningOut;
                        break;
                    case 'Entertainment':
                        result = entertainment;
                        break;
                    case 'Groceries':
                        result = groceries;
                        break;
                    case 'Subscriptions':
                        result = subscriptions;
                        break;
                    case 'Rent':
                        result = rent;
                        break;
                    case 'Utilities':
                        result = utilities;
                        break;
                    case 'Amazon':
                        result = amazon;
                        break;
                    case 'Misc':
                        result = misc;
                        break;
                }
                let overlapArray;
                if (Array.isArray(result)) {
                    switch (selector) {
                        case 'all':
                            overlapArray = all.filter(element => result.includes(element));
                            break;
                        case 'paid':
                            overlapArray = paid.filter(element => result.includes(element));
                            break;
                        case 'unpaid':
                            overlapArray = unpaid.filter(element => result.includes(element));
                            break;
                        case 'recurring':
                            overlapArray = recurring.filter(element => result.includes(element));
                            break;
                        default:
                            overlapArray = [];
                    }
                
                    for (let expenseDiv of overlapArray) {
                        expenseAdd.appendChild(expenseDiv);
                    }
                
                    if (overlapArray.length === 0) {
                        expenseAdd.textContent = 'Looks a little empty...';
                    }
                } else {
                    console.error('result is not an array');
                }
                console.log(overlapArray);
            }
    
            }
  
            let expenseItems = document.querySelectorAll('.expense-item');
            console.log(expenseItems.length)
            // Loop through the NodeList and add an event listener to each element
            expenseItems.forEach(function(expenseItem) {
                console.log('double loser')
                expenseItem.addEventListener('click', function() {
                    showPopup(this);
    
                });
            });

        })
        .catch(error => {
            console.log(error);
        });
}

window.addEventListener('resize', function(event) {
    // Your code to run when the viewport size changes
    console.log('Viewport size has changed!');
    // For example, logging the new viewport size
    console.log('Width: ' + window.innerWidth + ', Height: ' + window.innerHeight);
    drawChart();
    drawChartMyBudg();

});

function drawChart(text='null') {

    if (text !== 'null'){
        dataTableMyBudg = new google.visualization.DataTable();
        dataTableMyBudg.addColumn('string', 'Category');
        dataTableMyBudg.addColumn('number', 'Below Allowed');
        dataTableMyBudg.addColumn({type: 'string', role: 'style'});
        dataTableMyBudg.addColumn('number', 'Above Allowed');
        dataTableMyBudg.addColumn({type: 'string', role: 'style'});
        dataTableMyBudg.addColumn('number', 'Remaining Allowed');
        dataTableMyBudg.addColumn({type: 'string', role: 'style'});
    
        chartMyBudg = new google.visualization.ColumnChart(document.getElementById('budgContent'));
    
        // Initial empty draw to set up the chart
        drawChartMyBudg();
    }
    // Create the data table
    let dataDis = new google.visualization.DataTable();
    dataDis.addColumn('string', 'Category');
    dataDis.addColumn('number', 'Money Spent ($)');

    let monDataDis = new google.visualization.DataTable();
    monDataDis.addColumn('string', 'Month');
    monDataDis.addColumn('number', 'Money Spent ($)');

    let catData = null;
    let monData = null;

    fetch('/expense/get-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ month: document.getElementById('month').value })
    }).then(response => response.json())
    .then(data => {
        console.log(data);
        catData = data.catData;
        console.log(catData);
        monData = data.monData;
    
        // Set chart options for pie chart (Monthly Spending by Category)
        let options = {
            title: 'Monthly Spending by Category',
            width: 'max-width',
            height: 'max-height',
            pieHole: 0.4, // Donut chart effect
            backgroundColor: '#EFEAD8', // Match background color
            fontName: 'Georgia', // Match the font
            titleTextStyle: {
                color: '#3D3B2A',
                fontSize: 18,
                bold: true
            },
            legend: {
                textStyle: {
                    color: '#3D3B2A'
                }
            },

            slices: {
                0: { color: '#A5A58D' }, // Olive Green
                1: { color: '#D9BF77' }, // Mustard Yellow
                2: { color: '#F2CC8F' }, // Soft Coral
                3: { color: '#778A95' }, // Slate Gray
                4: { color: '#A8C4C9' }, // Muted Blue
                5: { color: '#DBC3BE' }  // Pale Mauve
            },
            tooltip: {
                textStyle: {
                    color: '#3D3B2A'
                }
            },
            chartArea: {
                width: '90%',
                height: '80%'
            }
        };

        // Set chart options for line chart (Month by Month Spending)
        let options2 = {
            title: 'Month by Month Spending in ' + new Date().getFullYear(),
            backgroundColor: '#EFEAD8', // Match background color
            fontName: 'Georgia', // Match the font
            titleTextStyle: {
                color: '#3D3B2A',
                fontSize: 18,
                bold: true
            },
            hAxis: {
                title: 'Month',
                titleTextStyle: {
                    color: '#3D3B2A'
                },
                textStyle: {
                    color: '#3D3B2A'
                },
                gridlines: {
                    color: '#CCC' // Subtle gridlines
                }
            },
            vAxis: {
                title: 'Money Spent ($)',
                titleTextStyle: {
                    color: '#3D3B2A'
                },
                textStyle: {
                    color: '#3D3B2A'
                },
                gridlines: {
                    color: '#CCC' // Subtle gridlines
                }
            },
            legend: { position: 'none' },
            series: {
                0: {
                    lineDashStyle: [4, 4], // Dotted line
                    lineWidth: 2,
                    pointShape: 'circle',
                    pointSize: 5,
                    color: '#6B705C'
                }
            },
            trendlines: {
                0: {
                    color: '#CB997E',
                    lineWidth: 2
                }
            },
            chartArea: {
                width: '85%',
                height: '70%'
            }
        };

        dataDis.addRows(catData);
        monDataDis.addRows(monData);

        let chart2 = new google.visualization.LineChart(document.getElementById('monthlyAvgGraph'));
        chart2.draw(monDataDis, options2);
    
        let chart = new google.visualization.PieChart(document.getElementById('graph'));
        chart.draw(dataDis, options);
    });
}



// Function to create and populate the table
// Function to create and populate the table
function createTable(data) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Manually set headers for the two sections
    const headers = ['User', 'Amount'];

    // Create headers row
    const trHeaders = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        trHeaders.appendChild(th);
    });
    thead.appendChild(trHeaders);

    // Function to populate rows
    const populateRows = (data, sectionName) => {
        // Section name row (You Owe / They Owe)
        const trSectionName = document.createElement('tr');
        const thSectionName = document.createElement('th');
        thSectionName.textContent = sectionName;
        thSectionName.colSpan = 2; // Span across both columns
        trSectionName.appendChild(thSectionName);
        tbody.appendChild(trSectionName);

        // Populate rows with data
        data.forEach(([user, amount]) => {
            const tr = document.createElement('tr');
            const tdUser = document.createElement('td');
            tdUser.textContent = user;
            const tdAmount = document.createElement('td');
            tdAmount.textContent = amount;
            tr.appendChild(tdUser);
            tr.appendChild(tdAmount);
            tbody.appendChild(tr);
        });
    };

    // Assuming data is an object with youOwe and theyOwe arrays
    if (data.youOwe.length > 0) {
        populateRows(data.youOwe, 'You Owe');
    }

    if (data.theyOwe.length > 0) {
        populateRows(data.theyOwe, 'They Owe');
    }

    // Append the table to a container in your HTML
    document.getElementById('table-container').appendChild(table);
}

document.getElementById('create-budg').addEventListener('click', function(){
    let backdrop = document.getElementById('cre-back');
    backdrop.style.display = 'flex';
    let div = document.getElementById('edit-details');
    div.classList.remove('hidden');
    backdrop.addEventListener('click', (e) => {
        let diningOut = Number(document.getElementById('dining-out').value);
        let entertainment = Number(document.getElementById('entertainment').value);
        let groceries = Number(document.getElementById('groceries').value);
        let subscriptions = Number(document.getElementById('subscriptions').value);
        let rent = Number(document.getElementById('rent').value);
        let utilities = Number(document.getElementById('utilities').value);
        let amazon = Number(document.getElementById('amazon').value);
        let misc = Number(document.getElementById('misc').value);
        let month = document.getElementById('month').value;

        if (e.target === backdrop) {
            backdrop.style.display = 'none';
            fetch('/expense/create-budget', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({diningOut: diningOut, groceries: groceries, subscriptions: subscriptions, rent: rent, utilities: utilities,
                    amazon: amazon, misc: misc, entertainment: entertainment, month: month
                })
                
            })
            .then(response => response.json())
            .then(data => {
                console.log('this is data' + data);
                let total = 0;
                if (data === 'good to go'){
                    fetch('/expense/my-budgetChart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: 
                            JSON.stringify({month: document.getElementById('month').value})
                        
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data !== 'not edited'){
                            drawChart('draw please');
                            console.log('This is my data 1.0: ' + data)
                            data.forEach(element => {
                                let cat = element[0];
                                cat = callSwitch(cat);
                                console.log(cat);
                                document.getElementById(cat).value = Number(element[2]);
                                total += element[2]
                                updateChart(cat, Number(element[1]), Number(element[2]))
                                
                            })
                            
                        document.getElementById('totalBudg').textContent = `Total: $${total.toFixed(2)}`
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
                }

            })
            .catch(error => {
                console.error('error');
            })
        }
    });
})

let previousValues2 = new Map();
document.querySelectorAll('.form-group input').forEach(input => {

        previousValues2.set(input, Number(input.value));
        console.log(previousValues2)

    input.addEventListener('input', (event) => {
        let newValue = Number(input.value);
        let previousValue = previousValues2.get(input);

        console.log(previousValue)
        console.log(newValue);

        //0 1 = 1 - 1 = 0

        let amountRemaining = Number(document.getElementById('totalBudg').textContent.substring(8))

        console.log('This is amtRema' + amountRemaining)
        // Subtract the previous value of the input field from amountRemaining
        
        amountRemaining -= previousValue;

        // Add the new value of the input field to amountRemaining
        amountRemaining += newValue;

    

        // Update the total displayed
        document.getElementById('totalBudg').textContent = `Total: $${amountRemaining.toFixed(2)}`;

        previousValues2.set(input, newValue);
        document.getElementById('create-budg').textContent = 'edit';
        document.getElementById('budgContent').textContent = '';
    });
});

function callSwitch(cat){
    switch (cat) {
        case 'Amazon':
            return 'amazon';
        case 'Dining Out':
            return 'dining-out';
        case 'Groceries':
            return 'groceries';
        case 'Entertainment':
            return 'entertainment';
        case 'Subscriptions':
            return 'subscriptions';
        case 'Misc':
            return 'misc';
        case 'Rent':
            return 'rent';
        case 'Utilities':
            return 'utilities';
    }
}



function drawChartMyBudg() {
    const options = {
        title: 'Monthly Category Budget',
        backgroundColor: '#EFEAD8', // Match background color
        width: 'max-width',
        height: 'max-height',
        fontName: 'Georgia',
        hAxis: {
            title: 'Categories',
            minValue: 0,
        },
        vAxis: {
            title: 'Amount',
        },
        bar: { groupWidth: '75%' },
        legend: { position: 'none' },
        isStacked: true
    };

    chartMyBudg.draw(dataTableMyBudg, options);
}

function updateChart(category, currentUsed, totalAllowed) {
    const belowAllowed = currentUsed <= totalAllowed ? currentUsed : totalAllowed;
    const aboveAllowed = currentUsed > totalAllowed ? currentUsed - totalAllowed : 0;
    const remainingAllowed = totalAllowed - currentUsed >= 0 ? totalAllowed - currentUsed : 0;

    dataTableMyBudg.addRow([
        category,
        belowAllowed,
        'color: lightblue', // Style for below allowed amount
        aboveAllowed,
        aboveAllowed > 0 ? 'color: red' : 'color: transparent', // Style for above allowed amount
        remainingAllowed,
        'color: lightgrey' // Style for remaining allowed amount
    ]);

    drawChartMyBudg();
}

let selectElem = document.querySelector('#month');

selectElem.addEventListener('change', function(event) {
    let total = 0;
    fetch('/expense/my-budgetChart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: 
            JSON.stringify({month: document.getElementById('month').value})
        
    })
    .then(response => response.json())
    .then(data => {
        if (data !== 'not edited'){
            document.getElementById('budgContent').textContent = '';
            document.getElementById('create-budg').textContent = 'edit';
            drawChart('draw please');
            console.log('This is my data: ' + data)
            data.forEach(element => {
                let cat = element[0];
                cat = callSwitch(cat);
                console.log(cat);
                document.getElementById(cat).value = Number(element[2]);
                total += element[2]
                updateChart(cat, Number(element[1]), Number(element[2]))
                
            })
            
        document.getElementById('totalBudg').textContent = `Total: $${total.toFixed(2)}`
        } else {
            console.log('edited');
        }
    })
    .catch(error => {
        console.log(error)
    })
})

document.getElementById('logout').addEventListener('click', function(){
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/header'
        }
    }).then(response => response.json())
    .then(data => {
        window.location.href = 'http://localhost:3000/login'
    })
})

document.getElementById('inviteBtn').addEventListener('click', function(){
    fetch('/expense/invite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({invitee: document.getElementById('invite').value})
    }).then(response => response.json())
    .then(data => {
        window.location.reload();
    })
})