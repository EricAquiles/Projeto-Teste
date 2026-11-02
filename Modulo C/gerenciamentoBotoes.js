// --- 1. GESTÃO DO MODAL DO BOOTSTRAP (Para páginas de atividades) ---
let meuModal;

window.addEventListener("DOMContentLoaded", () => {
    const elementoModal = document.getElementById("meuPopup");
    if (elementoModal) {
        meuModal = new bootstrap.Modal(elementoModal);
    }
});

window.abrirPopup = function() {
    meuModal?.show();
};

window.responder = function(possuiCadastro) {
    window.location.href = possuiCadastro ? "loginParticipante.html" : "cadastro.html";
};

document.addEventListener('click', (event) => {
    if (event.target?.id === 'btnSimLogin') {
        event.preventDefault();
        window.location.href = "../loginParticipante.html";
    }
});


// --- 2. ALTERNÂNCIA ENTRE ATIVIDADES E MINHAS INSCRIÇÕES ---
document.addEventListener("DOMContentLoaded", () => {
    const btnMinhasInscricoes = document.getElementById('btnMinhasInscricoes');
    const btnVoltarAtividades = document.getElementById('btnVoltarAtividades');
    const secaoAtividades = document.getElementById('secaoAtividades');
    const secaoMinhasInscricoes = document.getElementById('secaoMinhasInscricoes');

    if (btnMinhasInscricoes && btnVoltarAtividades && secaoAtividades && secaoMinhasInscricoes) {
        const alternarSecoesAtividades = (mostrarInscricoes) => {
            secaoAtividades.style.display = mostrarInscricoes ? "none" : "block";
            secaoMinhasInscricoes.style.display = mostrarInscricoes ? "block" : "none";
            btnMinhasInscricoes.style.display = mostrarInscricoes ? "none" : "inline-block";
            btnVoltarAtividades.style.display = mostrarInscricoes ? "inline-block" : "none";
        };

        btnMinhasInscricoes.addEventListener('click', (event) => {
            event.preventDefault();
            alternarSecoesAtividades(true);
        });

        btnVoltarAtividades.addEventListener('click', (event) => {
            event.preventDefault();
            alternarSecoesAtividades(false);
        });
    }
});


// --- 3. ALTERNÂNCIA ENTRE TABELA E CADASTRO (Painel Administrativo de Participantes) ---
const secaoCadastro = document.getElementById('secaoCadastro');
const secaoTabela = document.getElementById('secaoTabela');
const btnMostrarCadastro = document.getElementById('btnMostrarCadastro');
const btnMostrarTabela = document.getElementById('btnMostrarTabela');

function alternarTelaParticipantes(mostrarCadastro) {
    if (!secaoCadastro || !secaoTabela) return;

    if (mostrarCadastro) {
        secaoCadastro.style.display = 'block';
        secaoTabela.style.display = 'none';
        if (btnMostrarCadastro) btnMostrarCadastro.className = 'btn btn-dark';
        if (btnMostrarTabela) btnMostrarTabela.className = 'btn btn-outline-dark';
    } else {
        secaoCadastro.style.display = 'none';
        secaoTabela.style.display = 'block';
        if (btnMostrarTabela) btnMostrarTabela.className = 'btn btn-dark';
        if (btnMostrarCadastro) btnMostrarCadastro.className = 'btn btn-outline-dark';
    }
}

// Funções globais chamadas pelo participante.js (ao editar ou salvar registos)
window.paginaCadastroParticipante = () => alternarTelaParticipantes(true);
window.visualizarTabelaParticipante = () => alternarTelaParticipantes(false);

// Eventos de clique nos botões do painel de participantes
btnMostrarCadastro?.addEventListener('click', () => alternarTelaParticipantes(true));
btnMostrarTabela?.addEventListener('click', () => alternarTelaParticipantes(false));

// --- ALTERNÂNCIA ENTRE TABELA E CADASTRO (Painel Administrativo de Atividades) ---
const secaoCadastroAtividade = document.getElementById('secaoCadastroAtividade');
const secaoTabelaAtividade = document.getElementById('secaoTabelaAtividade');
const btnMostrarCadastroAtividade = document.getElementById('btnMostrarCadastroAtividade');
const btnMostrarTabelaAtividade = document.getElementById('btnMostrarTabelaAtividade');

function alternarTelaAtividades(mostrarCadastro) {
    if (!secaoCadastroAtividade || !secaoTabelaAtividade) return;

    if (mostrarCadastro) {
        secaoCadastroAtividade.style.display = 'block';
        secaoTabelaAtividade.style.display = 'none';
        if (btnMostrarCadastroAtividade) btnMostrarCadastroAtividade.className = 'btn btn-dark';
        if (btnMostrarTabelaAtividade) btnMostrarTabelaAtividade.className = 'btn btn-outline-dark';
    } else {
        secaoCadastroAtividade.style.display = 'none';
        secaoTabelaAtividade.style.display = 'block';
        if (btnMostrarTabelaAtividade) btnMostrarTabelaAtividade.className = 'btn btn-dark';
        if (btnMostrarCadastroAtividade) btnMostrarCadastroAtividade.className = 'btn btn-outline-dark';
    }
}

// Funções globais exigidas pelo atividade.js (ao editar registos)
window.paginaCadastroAtividade = () => alternarTelaAtividades(true);
window.visualizarTabelaAtividade = () => alternarTelaAtividades(false);

// Eventos de clique nos botões do painel de atividades
btnMostrarCadastroAtividade?.addEventListener('click', () => alternarTelaAtividades(true));
btnMostrarTabelaAtividade?.addEventListener('click', () => alternarTelaAtividades(false));