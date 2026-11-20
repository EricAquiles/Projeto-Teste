// --- 1. GESTÃO DO MODAL DO BOOTSTRAP ---
let meuModal;
window.addEventListener("DOMContentLoaded", () => {
    const elementoModal = document.getElementById("meuPopup");
    if (elementoModal) meuModal = new bootstrap.Modal(elementoModal);
});

window.abrirPopup = () => meuModal?.show();

window.responder = (possuiCadastro) => {
    window.location.href = possuiCadastro ? "loginParticipante.html" : "cadastro.html";
};

document.addEventListener('click', (event) => {
    if (event.target?.id === 'btnSimLogin') {
        event.preventDefault();
        window.location.href = "../loginParticipante.html";
    }
});


// --- 2. FUNÇÃO GENÉRICA DE ALTERNÂNCIA (Para secções ou painéis) ---
// Evita repetir o código de esconder/mostrar e trocar classes de botões
const configurarAlternancia = (btnA, btnB, secaoA, secaoB, acaoAVisivel) => {
    if (!btnA || !btnB || !secaoA || !secaoB) return;

    const alternar = (mostrarA) => {
        // Alterna visibilidade usando a classe d-none do Bootstrap
        secaoA.classList.toggle('d-none', !mostrarA);
        secaoB.classList.toggle('d-none', mostrarA);

        // Alterna estilos dos botões ativos/outline
        btnA.className = mostrarA ? 'btn btn-dark' : 'btn btn-outline-dark';
        btnB.className = mostrarA ? 'btn btn-outline-dark' : 'btn btn-dark';
    };

    btnA.addEventListener('click', (e) => { e.preventDefault(); alternar(true); });
    btnB.addEventListener('click', (e) => { e.preventDefault(); alternar(false); });

    return alternar; // Retorna caso queira chamar via global
};


// --- 3. APLICAR NAS TABS / PAINÉIS ---
document.addEventListener("DOMContentLoaded", () => {

    // A. Atividades vs Minhas Inscrições (Área do Utilizador)
    const btnMinhasInscricoes = document.getElementById('btnMinhasInscricoes');
    const btnVoltarAtividades = document.getElementById('btnVoltarAtividades');
    const secaoAtividades = document.getElementById('secaoAtividades');
    const secaoMinhasInscricoes = document.getElementById('secaoMinhasInscricoes');

    if (btnMinhasInscricoes && btnVoltarAtividades && secaoAtividades && secaoMinhasInscricoes) {
        btnMinhasInscricoes.addEventListener('click', (e) => {
            e.preventDefault();
            secaoAtividades.classList.add('d-none');
            secaoMinhasInscricoes.classList.remove('d-none');
            btnMinhasInscricoes.style.display = 'none';
            btnVoltarAtividades.style.display = 'inline-block';
        });

        btnVoltarAtividades.addEventListener('click', (e) => {
            e.preventDefault();
            secaoAtividades.classList.remove('d-none');
            secaoMinhasInscricoes.classList.add('d-none');
            btnMinhasInscricoes.style.display = 'inline-block';
            btnVoltarAtividades.style.display = 'none';
        });
    }

    // B. Painel Administrativo - Participantes
    const altParticipantes = configurarAlternancia(
        document.getElementById('btnMostrarTabela'),
        document.getElementById('btnMostrarCadastro'),
        document.getElementById('secaoTabela'),
        document.getElementById('secaoCadastro'),
        true
    );
    
    if (altParticipantes) {
        window.visualizarTabelaParticipante = () => altParticipantes(true);
        window.paginaCadastroParticipante = () => altParticipantes(false);
    }

    // C. Painel Administrativo - Atividades
    const altAtividades = configurarAlternancia(
        document.getElementById('btnMostrarTabelaAtividade'),
        document.getElementById('btnMostrarCadastroAtividade'),
        document.getElementById('secaoTabelaAtividade'),
        document.getElementById('secaoCadastroAtividade'),
        true
    );

    if (altAtividades) {
        window.visualizarTabelaAtividade = () => altAtividades(true);
        window.paginaCadastroAtividade = () => altAtividades(false);
    }
});