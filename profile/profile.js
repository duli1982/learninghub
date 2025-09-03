document.addEventListener('DOMContentLoaded', function() {
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    const userInfo = document.getElementById('user-info');
    const loadingState = document.getElementById('loading-state');

    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            userName.textContent = user.displayName || 'N/A';
            userEmail.textContent = user.email;
            userInfo.style.display = 'block';
            loadingState.style.display = 'none';
        } else {
            // No user is signed in.
            window.location.href = '/login/';
        }
    });

    logoutButton.addEventListener('click', function() {
        auth.signOut().then(() => {
            // Sign-out successful.
            window.location.href = '/';
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
        });
    });
});
