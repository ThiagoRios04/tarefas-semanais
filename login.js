document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'atividades.html';
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
});
