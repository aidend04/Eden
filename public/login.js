document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    let usernameInput = document.getElementById('username').value;
    let passwordInput = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: usernameInput, password: passwordInput})
    })
    .then(response => response.json())
    .then(data => {
        const errorMessageDiv = document.getElementById('error-message-div');
        const welcomeMessageDiv = document.getElementById('welcome-message-div');
        if (data.message === 'User not found'){
            errorMessageDiv.textContent = 'Invalid username, please try again or register';
            errorMessageDiv.classList.remove('hidden');
        } else if (data.message === 'Incorrect password'){
            errorMessageDiv.textContent = 'Invalid password, please try again';
            errorMessageDiv.classList.remove('hidden');
        } else if (data.message === 'No group') {
            welcomeMessageDiv.classList.remove('hidden');
            errorMessageDiv.classList.add('hidden');
            setTimeout(() => {
                window.location.href = '/group/create';
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = '/group/create';
            }, 1000);
        }
    });
});