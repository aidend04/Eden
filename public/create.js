// JavaScript for "Create a Group" form
document.querySelector('#create-group').addEventListener('submit', function(event) {
    event.preventDefault();

    let groupName = document.querySelector('#grp-name').value;
    let groupMembers = document.querySelector('#grp-mem').value;

    let data = {
        Name: groupName,
        invitees: groupMembers.split(',') // split the string into an array of emails
    };

    // Send a POST request to the server
    fetch('/group/create', { // replace '/group/create' with your actual endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
    .then(data => {

        const errorMessageDiv = document.getElementById('error-message-div');
        console.log(data.message);
        
        if (data.message === 'Group name already exists.') {
            errorMessageDiv.textContent = 'A group already uses that name, please try again';
            errorMessageDiv.classList.remove('hidden');
        } else if (data.message === 'User not found') {
            errorMessageDiv.textContent = 'Sorry, this might be an us issue. Please try again. Double check the username!';
            errorMessageDiv.classList.remove('hidden');
        } else if (data.message === 'looks like you got a group'){
            errorMessageDiv.textContent = 'Looks like you are already in a group, please login'
            errorMessageDiv.classList.remove('hidden');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);

        } else if (data.message === 'Success'){
            console.log('Success:', data);
            const welcomeMessageDiv = document.getElementById('welcome-message-div');
            welcomeMessageDiv.classList.remove('hidden');
    
            setTimeout(() => {
                window.location.href = '/home';
            }, 1000);
        }
    });
});

// JavaScript for "Enter Code" form
document.querySelector('#got-code').addEventListener('submit', function(event) {
    event.preventDefault();

    let code = Array.from(document.querySelectorAll('#got-code input')).map(input => input.value).join('');

    // Send a POST request to the server
    fetch('/group/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
    }).then(response =>
        response.json()).then(data => {
        console.log(data.message);
        const errorMessageDiv = document.getElementById('error-message-div2');
        const welcomeMessageDiv = document.getElementById('welcome-message-div2');
        if (data.message === 'Invalid invite code'){
            console.log('hi');
            errorMessageDiv.textContent = "Invalid code";
            errorMessageDiv.classList.remove("hidden");
        } else if (data.message === 'This code is no longer valid.'){
            errorMessageDiv.textContent = "This code has already been used";
            errorMessageDiv.classList.remove("hidden");
        } else if (data.message === 'Cannot find group.'){
            errorMessageDiv.textContent = "This group no longer exists.";
            errorMessageDiv.classList.remove("hidden");
        } else {
            errorMessageDiv.classList.add("hidden");
            welcomeMessageDiv.textContent = "Success";
            welcomeMessageDiv.classList.remove("hidden");

            setTimeout(() => {
                window.location.href = '/home';
            }, 1000);
        }
    });
});