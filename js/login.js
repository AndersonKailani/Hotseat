// Handle login form submission
$(document).ready(function() {
    $('#login-form').submit(function(event) {
      event.preventDefault();
      var username = $('#username').val();
      var password = $('#password').val();
  
      // Perform API call to authenticate user
      // Example: Using fetch API
      fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then(data => {
        // Store user session/token in localStorage or cookies
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username); // Store the username
        // Redirect user to posts page after successful login
        window.location.href = 'posts.html';
      })
      .catch(error => {
        console.error('Error:', error);
        // Display error message to user (optional)
      });
    });
  });
  