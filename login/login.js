document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const googleSignInButton = document.getElementById('google-signin');
    const errorMessage = document.getElementById('error-message');

    // Email/Password Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                window.location.href = '/profile/';
            })
            .catch((error) => {
                errorMessage.textContent = error.message;
            });
    });

    // Google Sign-In
    googleSignInButton.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = result.credential;
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                window.location.href = '/profile/';
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessageText = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                const credential = error.credential;
                errorMessage.textContent = errorMessageText;
            });
    });
});
