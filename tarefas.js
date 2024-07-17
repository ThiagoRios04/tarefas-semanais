document.addEventListener("DOMContentLoaded", function() {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const atividades = JSON.parse(localStorage.getItem(`${currentUser}_atividades`));
    if (!atividades) {
        window.location.href = 'atividades.html';
        return;
    }

    const diasSelect = document.getElementById('dias');
    const dias = document.querySelectorAll('.dia');
    const salvarButton = document.getElementById('salvar');
    const progressBar = document.getElementById('progress');
    const toggleModeButton = document.getElementById('mode');

    const graficos = {
        'segunda-feira': new Chart(document.getElementById('grafico-segunda-feira').getContext('2d'), getGraficoConfig()),
        'terça-feira': new Chart(document.getElementById('grafico-terca-feira').getContext('2d'), getGraficoConfig()),
        'quarta-feira': new Chart(document.getElementById('grafico-quarta-feira').getContext('2d'), getGraficoConfig()),
        'quinta-feira': new Chart(document.getElementById('grafico-quinta-feira').getContext('2d'), getGraficoConfig()),
        'sexta-feira': new Chart(document.getElementById('grafico-sexta-feira').getContext('2d'), getGraficoConfig())
    };

    function getGraficoConfig() {
        return {
            type: 'doughnut',
            data: {
                labels: ['Concluído', 'Restante'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 1
                }]
            },
            options: {
                cutoutPercentage: 70,
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(1) + '%';
                            return context.dataIndex === 0 ? percentage : '';
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: '14'
                        }
                    }
                }
            }
        };
    }

    function atualizarGrafico(dia) {
        const grafico = graficos[dia.id];
        const tarefas = dia.querySelectorAll('.tarefa');
        const concluidas = Array.from(tarefas).filter(tarefa => tarefa.checked).length;
        const total = tarefas.length;
        const porcentagemConcluida = (concluidas / total) * 100;
        grafico.data.datasets[0].data = [porcentagemConcluida, 100 - porcentagemConcluida];
        grafico.update();
    }

    function verificarTarefas() {
        const diaAtual = document.querySelector('.dia:not([style*="display: none"])');
        if (diaAtual) {
            const tarefas = diaAtual.querySelectorAll('.tarefa');
            for (const tarefa of tarefas) {
                if (!tarefa.checked) {
                    alert('Verifique se todas as tarefas foram concluídas.');
                    diasSelect.value = diaAtual.id;
                    return;
                }
            }
        }
        mostrarTarefas();
    }

    function mostrarTarefas() {
        const diaSelecionado = diasSelect.value;

        dias.forEach(dia => {
            if (dia.id === diaSelecionado) {
                dia.style.display = 'block';
                dia.style.animation = 'fadeIn 0.5s';
            } else {
                dia.style.display = 'none';
                dia.style.animation = 'fadeOut 0.5s';
            }
        });

        verificarEnvio();
    }

    function verificarEnvio() {
        const diaAtual = document.querySelector('.dia:not([style*="display: none"])');
        if (diaAtual) {
            const tarefas = diaAtual.querySelectorAll('.tarefa');
            const enviarButton = diaAtual.querySelector('button#enviar');
            let todasConcluidas = true;

            tarefas.forEach(tarefa => {
                const li = tarefa.parentElement;
                if (tarefa.checked) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                    todasConcluidas = false;
                }
            });

            atualizarGrafico(diaAtual);
            atualizarProgressoSemanal();

            if (todasConcluidas) {
                enviarButton.disabled = false;
                enviarButton.style.cursor = 'pointer';
                enviarButton.style.backgroundColor = '#28a745';
            } else {
                enviarButton.disabled = true;
                enviarButton.style.cursor = 'not-allowed';
                enviarButton.style.backgroundColor = '#007bff';
            }
        }
    }

    function atualizarProgressoSemanal() {
        const totalTarefas = Array.from(document.querySelectorAll('.tarefa')).length;
        const tarefasConcluidas = Array.from(document.querySelectorAll('.tarefa:checked')).length;
        const porcentagemSemanal = (tarefasConcluidas / totalTarefas) * 100;
        progressBar.style.width = porcentagemSemanal + '%';
    }

    function mudarProximoDia() {
        alert('Boa tacada!');
        const diaAtualIndex = [...diasSelect.options].findIndex(option => option.value === diasSelect.value);
        if (diaAtualIndex >= 0 && diaAtualIndex < diasSelect.options.length - 1) {
            diasSelect.options[diaAtualIndex + 1].disabled = false;
            diasSelect.value = diasSelect.options[diaAtualIndex + 1].value;
            mostrarTarefas();
        }
    }

    function salvarSemana() {
        const tarefasConcluidas = {};
        dias.forEach(dia => {
            const diaId = dia.id;
            const tarefas = dia.querySelectorAll('.tarefa');
            tarefasConcluidas[diaId] = [];
            tarefas.forEach(tarefa => {
                tarefasConcluidas[diaId].push(tarefa.checked);
            });
        });

        localStorage.setItem(`${currentUser}_tarefasSemana`, JSON.stringify(tarefasConcluidas));
        alert('Tarefas da semana salvas com sucesso!');

        // Limpar seleção de tarefas e reiniciar para segunda-feira
        dias.forEach(dia => {
            dia.querySelectorAll('.tarefa').forEach(tarefa => {
                tarefa.checked = false;
                tarefa.parentElement.classList.remove('completed');
            });
            atualizarGrafico(dia);
        });
        atualizarProgressoSemanal();
        diasSelect.value = 'segunda-feira';
        mostrarTarefas();
    }

    function carregarSemana() {
        const tarefasConcluidas = JSON.parse(localStorage.getItem(`${currentUser}_tarefasSemana`));
        if (tarefasConcluidas) {
            dias.forEach(dia => {
                const diaId = dia.id;
                const tarefas = dia.querySelectorAll('.tarefa');
                if (tarefasConcluidas[diaId]) {
                    tarefasConcluidas[diaId].forEach((concluida, index) => {
                        tarefas[index].checked = concluida;
                        if (concluida) {
                            tarefas[index].parentElement.classList.add('completed');
                        } else {
                            tarefas[index].parentElement.classList.remove('completed');
                        }
                    });
                }
                atualizarGrafico(dia);
            });
            atualizarProgressoSemanal();
        }
    }

    function toggleMode() {
        document.body.classList.toggle('dark-mode');
        document.querySelector('.container').classList.toggle('dark-mode');

        document.querySelectorAll('h1, label, select, h2, ul li, button').forEach(el => {
            el.classList.toggle('dark-mode');
        });

        if (document.body.classList.contains('dark-mode')) {
            toggleModeButton.textContent = 'ON';
        } else {
            toggleModeButton.textContent = 'OFF';
        }
    }

    // Inicializar atividades
    function inicializarAtividades() {
        document.getElementById('segunda-tarefas').innerHTML = atividades.segunda.split('\n').map(atividade => `<li><input type="checkbox" class="tarefa" onchange="verificarEnvio()"> ${atividade.trim()}</li>`).join('');
        document.getElementById('terca-tarefas').innerHTML = atividades.terca.split('\n').map(atividade => `<li><input type="checkbox" class="tarefa" onchange="verificarEnvio()"> ${atividade.trim()}</li>`).join('');
        document.getElementById('quarta-tarefas').innerHTML = atividades.quarta.split('\n').map(atividade => `<li><input type="checkbox" class="tarefa" onchange="verificarEnvio()"> ${atividade.trim()}</li>`).join('');
        document.getElementById('quinta-tarefas').innerHTML = atividades.quinta.split('\n').map(atividade => `<li><input type="checkbox" class="tarefa" onchange="verificarEnvio()"> ${atividade.trim()}</li>`).join('');
        document.getElementById('sexta-tarefas').innerHTML = atividades.sexta.split('\n').map(atividade => `<li><input type="checkbox" class="tarefa" onchange="verificarEnvio()"> ${atividade.trim()}</li>`).join('');
    }

    // Adicionar event listeners aos checkboxes após inicializar as atividades
    function adicionarEventListenersTarefas() {
        dias.forEach(dia => {
            dia.querySelectorAll('.tarefa').forEach(tarefa => {
                tarefa.addEventListener('change', verificarEnvio);
            });
        });

        // Adiciona evento ao botão de envio para mudar para o próximo dia
        dias.forEach(dia => {
            const enviarButton = dia.querySelector('button#enviar');
            enviarButton.addEventListener('click', mudarProximoDia);
        });
    }

    // Inicializa a exibição e carrega as tarefas salvas
    inicializarAtividades();
    adicionarEventListenersTarefas();
    mostrarTarefas();
    carregarSemana();

    diasSelect.addEventListener('change', verificarTarefas);
    salvarButton.addEventListener('click', salvarSemana);
});
