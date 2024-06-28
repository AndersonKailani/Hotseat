// Handle registration form submission
$(document).ready(function() {
    $('#register-form').submit(function(event) {
      event.preventDefault();
      var username = $('#username').val();
      var fullName = $('#fullName').val();
      var password = $('#password').val();
  
      // Perform API call to register user
      fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username, 
          fullName: fullName, 
          password: password
        }), // Ensure the payload matches the expected structure
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Registration failed');
        }
        return response.json();
      })
      .then(data => {
        // Redirect user to login page after successful registration
        window.location.href = 'index.html';
      })
      .catch(error => {
        console.error('Error:', error);
        // Display error message to user
        alert('Registration failed. Please try again.');
      });
    });
  });
  