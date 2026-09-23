let meuModal;

window.addEventListener("DOMContentLoaded", () => {
    const elementoModal = document.getElementById("meuPopup");
    if (elementoModal) {
        meuModal = new bootstrap.Modal(elementoModal);
    }
});

// Coloca as funções no escopo global (window) para o HTML conseguir enxergar
window.abrirPopup = function() {
    if (meuModal) {
        meuModal.show();
    }
};

window.responder = function(possuiCadastro) {
    if (possuiCadastro) {
        window.location.href = "loginParticipante.html";
    } else {
        window.location.href = "cadastro.html";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const btnMinhasInscricoes = document.getElementById('btnMinhasInscricoes');
    const btnVoltarAtividades = document.getElementById('btnVoltarAtividades');
    const secaoAtividades = document.getElementById('secaoAtividades');
    const secaoMinhasInscricoes = document.getElementById('secaoMinhasInscricoes');

    if (btnMinhasInscricoes && btnVoltarAtividades) {
        // Clica em "Ver Minhas Inscrições" -> Esconde atividades, mostra inscrições
        btnMinhasInscricoes.addEventListener('click', (event) => {
            event.preventDefault();
            secaoAtividades.style.display = "none";
            secaoMinhasInscricoes.style.display = "block";
            btnMinhasInscricoes.style.display = "none";
            btnVoltarAtividades.style.display = "inline-block";
        });

        // Clica em "Ver Todas as Atividades" -> Volta ao normal
        btnVoltarAtividades.addEventListener('click', (event) => {
            event.preventDefault();
            secaoAtividades.style.display = "block";
            secaoMinhasInscricoes.style.display = "none";
            btnMinhasInscricoes.style.display = "inline-block";
            btnVoltarAtividades.style.display = "none";
        });
    }
});

// Ouve cliques em qualquer lugar da página, mas só age se o alvo for o botão de login do modal
document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'btnSimLogin') {
        event.preventDefault();
        window.location.href = "../loginParticipante.html";
    }
});