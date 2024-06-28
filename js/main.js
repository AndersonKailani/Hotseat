$(document).ready(function() {
    // Highlight active nav link based on current URL
    var path = window.location.pathname;
    $('.navbar-nav a').each(function() {
      if ($(this).attr('href') === path) {
        $(this).addClass('active');
      }
    });
  
    // Handle logout
    $('#logout').click(function(event) {
      event.preventDefault();
      localStorage.removeItem('token'); // Remove the token from local storage
      window.location.href = 'index.html'; // Redirect to the login page
    });
  });
  