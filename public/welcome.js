window.onload = function() {
    // Get the welcome message div
    let welcomeMessageDiv = document.getElementById('welcome-message-div');

    // Remove the 'hidden' class to show the welcome message
    welcomeMessageDiv.classList.remove('hidden');

    setTimeout(function() {
        window.location.href = '/group/create'; // Replace 'your-new-url' with the actual new URL
    }, 10000);
}