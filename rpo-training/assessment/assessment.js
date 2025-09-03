document.addEventListener('DOMContentLoaded', function() {
    const assessmentTitle = document.getElementById('assessment-title');
    const assessmentContainer = document.getElementById('assessment-container');
    const submitButton = document.getElementById('submit-assessment');
    const resultsContainer = document.getElementById('results-container');
    const scoreElement = document.getElementById('score');
    const scoreFeedback = document.getElementById('score-feedback');

    let questions = [];
    let correctAnswers = [];

    // Get module id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');

    if (!moduleId) {
        assessmentContainer.innerHTML = '<p>Module not specified. Please go back and select an assessment.</p>';
        submitButton.style.display = 'none';
        return;
    }

    // Load assessment data
    fetch('../assessments.json')
        .then(response => response.json())
        .then(data => {
            const assessment = data[moduleId];
            if (!assessment) {
                assessmentContainer.innerHTML = '<p>Assessment not found for this module.</p>';
                submitButton.style.display = 'none';
                return;
            }

            assessmentTitle.textContent = assessment.title;
            questions = assessment.questions;
            correctAnswers = questions.map(q => q.answer);
            displayQuestions();
        })
        .catch(error => {
            console.error('Error loading assessment data:', error);
            assessmentContainer.innerHTML = '<p>Error loading assessment data. Please try again later.</p>';
            submitButton.style.display = 'none';
        });

    function displayQuestions() {
        assessmentContainer.innerHTML = '';
        questions.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question-block', 'bg-white', 'p-6', 'rounded-lg', 'border');

            const questionText = document.createElement('p');
            questionText.classList.add('font-semibold', 'mb-4');
            questionText.textContent = `${index + 1}. ${q.question}`;
            questionElement.appendChild(questionText);

            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('space-y-2');

            q.options.forEach(option => {
                const label = document.createElement('label');
                label.classList.add('flex', 'items-center', 'p-3', 'rounded-md', 'hover:bg-gray-50', 'cursor-pointer');

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question-${index}`;
                radio.value = option;
                radio.classList.add('mr-3');

                label.appendChild(radio);
                label.appendChild(document.createTextNode(option));
                optionsContainer.appendChild(label);
            });

            questionElement.appendChild(optionsContainer);
            assessmentContainer.appendChild(questionElement);
        });
    }

    submitButton.addEventListener('click', function() {
        const userAnswers = [];
        questions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            userAnswers.push(selectedOption ? selectedOption.value : null);
        });

        let score = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === correctAnswers[index]) {
                score++;
            }
        });

        const percentage = Math.round((score / questions.length) * 100);
        scoreElement.textContent = `${score} / ${questions.length} (${percentage}%)`;

        if (percentage === 100) {
            scoreFeedback.textContent = "Excellent! You aced it!";
            scoreFeedback.className = 'mt-2 text-green-600';
        } else if (percentage >= 70) {
            scoreFeedback.textContent = "Good job! You passed.";
            scoreFeedback.className = 'mt-2 text-blue-600';
        } else {
            scoreFeedback.textContent = "You might want to review the material and try again.";
            scoreFeedback.className = 'mt-2 text-red-600';
        }

        resultsContainer.style.display = 'block';
        submitButton.style.display = 'none';

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Save score to Firestore if user is logged in
        auth.onAuthStateChanged(function(user) {
            if (user) {
                const userId = user.uid;
                const assessmentRef = db.collection('assessments').doc(userId);
                const scoreData = {
                    [moduleId]: {
                        score: score,
                        total: questions.length,
                        percentage: percentage,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }
                };
                assessmentRef.set(scoreData, { merge: true })
                    .then(() => {
                        console.log("Assessment score saved successfully!");
                    })
                    .catch((error) => {
                        console.error("Error saving assessment score: ", error);
                    });
            }
        });
    });
});
