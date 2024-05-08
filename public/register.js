document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the username and password values from the form
    let usernameInput = document.getElementById('username').value;
    let passwordInput = document.getElementById('password').value;
    let passwordConfirmInput = document.getElementById('password_two').value;

    if (passwordInput != passwordConfirmInput) {
        const errorMessageDiv = document.getElementById('error-message-div');
        errorMessageDiv.textContent = "Passwords do not match";
        errorMessageDiv.classList.remove('hidden');
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === 'User registered successfully') {
            const welcomeMessageDiv = document.getElementById('welcome-message-div');
            welcomeMessageDiv.classList.remove('hidden');
            
    
            // Wait for 4 seconds (the duration of the animation), then redirect to /group/create
            setTimeout(() => {
                window.location.href = '/welcome';
            }, 1000);
        } else {
            // Show error message
            const errorMessageDiv = document.getElementById('error-message-div');
            if (data.message.includes('E11000')) {
                errorMessageDiv.textContent = 'A user with that username already exists';
            } else {
                errorMessageDiv.textContent = data.message;
            }
            errorMessageDiv.classList.remove('hidden');
        }
    });
});