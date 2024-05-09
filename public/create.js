// JavaScript for "Create a Group" form
document.querySelector('#create-group').addEventListener('submit', function(event) {
    event.preventDefault();

    let username = document.querySelector('#username').value;
    let groupName = document.querySelector('#grp-name').value;
    let groupMembers = document.querySelector('#grp-mem').value;

    let data = {
        GroupAdm: username,
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
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log('Success:', data);
    }).catch((error) => {
        console.error('Error:', error);
    });
});

// JavaScript for "Enter Code" form
document.querySelector('#got-code').addEventListener('submit', function(event) {
    event.preventDefault();

    let code = Array.from(document.querySelectorAll('#got-code input')).map(input => input.value).join('');

    // Send a POST request to the server
    fetch('/group/join', { // replace '/group/join' with your actual endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log('Success:', data);
    }).catch((error) => {
        console.error('Error:', error);
    });
});