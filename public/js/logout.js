document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.querySelector('.btn-danger');
    
    if (logoutButton) {
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const confirmLogout = confirm('Are you sure you want to log out?');
        
        if (confirmLogout) {
          window.location.href = logoutButton.href;
        }
      });
    }
  });
  