document.addEventListener("DOMContentLoaded", function() {
    const atividadesForm = document.getElementById('atividades-form');
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    atividadesForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const atividades = {
            segunda: document.getElementById('segunda').value,
            terca: document.getElementById('terca').value,
            quarta: document.getElementById('quarta').value,
            quinta: document.getElementById('quinta').value,
            sexta: document.getElementById('sexta').value
        };

        localStorage.setItem(`${currentUser}_atividades`, JSON.stringify(atividades));
        window.location.href = 'tarefas.html';
    });
});
