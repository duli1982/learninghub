document.addEventListener('DOMContentLoaded', function() {
    const sessionContainer = document.getElementById('session-container');
    const progressContainer = document.getElementById('progress-container');
    const progressList = document.getElementById('progress-list');

    // Function to display user progress
    function displayUserProgress(userId) {
        const progressRef = db.collection('progress').doc(userId);
        progressRef.get().then((doc) => {
            if (doc.exists) {
                const progressData = doc.data();
                progressList.innerHTML = ''; // Clear previous list
                let completedCount = 0;
                for (const sessionId in progressData) {
                    if (progressData[sessionId]) {
                        const listItem = document.createElement('p');
                        listItem.textContent = `✓ ${sessionId.replace(/-/g, ' ').replace('session ', 'Session ')}`;
                        progressList.appendChild(listItem);
                        completedCount++;
                    }
                }
                if (completedCount > 0) {
                    progressContainer.style.display = 'block';
                }
            }
        }).catch((error) => {
            console.error("Error getting progress:", error);
        });
    }

    // Function to initialize progress tracking for a session
    function initProgressTracking(user) {
        const markAsCompleteButton = document.getElementById('mark-as-complete');
        const completionStatus = document.getElementById('completion-status');
        const titleElement = sessionContainer.querySelector('h2');

        if (!markAsCompleteButton || !titleElement || !titleElement.textContent.includes('Session')) return;

        const sessionId = titleElement.textContent.split(':')[0].replace('Session ', 'session-').replace('.', '-');

        if (user) {
            const userId = user.uid;
            const progressRef = db.collection('progress').doc(userId);

            // Check initial completion status
            progressRef.get().then((doc) => {
                if (doc.exists && doc.data()[sessionId]) {
                    markAsCompleteButton.textContent = 'Completed';
                    markAsCompleteButton.disabled = true;
                    completionStatus.textContent = 'You have already completed this session.';
                }
            }).catch((error) => {
                console.error("Error getting document:", error);
            });

            // Add click listener
            markAsCompleteButton.addEventListener('click', function() {
                const sessionData = { [sessionId]: true };
                progressRef.set(sessionData, { merge: true })
                    .then(() => {
                        markAsCompleteButton.textContent = 'Completed';
                        markAsCompleteButton.disabled = true;
                        completionStatus.textContent = 'Session marked as complete!';
                        displayUserProgress(userId); // Update progress display
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                        completionStatus.textContent = 'Error saving progress. Please try again.';
                    });
            });
        } else {
            // Not logged in
            markAsCompleteButton.textContent = 'Login to track progress';
            markAsCompleteButton.disabled = true;
        }
    }

    // Main auth state change listener
    auth.onAuthStateChanged(function(user) {
        if (user) {
            displayUserProgress(user.uid);
            initProgressTracking(user);
        } else {
            progressContainer.style.display = 'none';
            initProgressTracking(null);
        }
    });

    // Since content is loaded dynamically, we need to know when a new session is loaded.
    // We'll use a MutationObserver on the session container to detect when new content is added.
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                auth.onAuthStateChanged(function(user) {
                    initProgressTracking(user);
                });
            }
        });
    });

    observer.observe(sessionContainer, { childList: true });
});
