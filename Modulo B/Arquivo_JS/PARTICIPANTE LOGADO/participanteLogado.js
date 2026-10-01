import { buscarInscricao, numeroInscricoes, descricaoSelecionada, realizarInscricao } from "../../api.js";

// ==========================================
// 1. VERIFICAÇÃO DE AUTENTICAÇÃO INICIAL
// ==========================================
const participanteLogado = sessionStorage.getItem("participanteLogado");
if (!participanteLogado) {
    alert("Acesso Negado! Faça o login novamente.");
    window.location.replace("../loginParticipante.html");
}

// ==========================================
// 2. SELETORES GLOBAIS DE ELEMENTOS
// ==========================================
const tbody = document.getElementById('tabelaAtividade');
const desc = document.getElementById('tabelaDescricao');
const minhasInscricoes = document.getElementById('tabelaMinhasInscricoes');
const btnSair = document.getElementById('btnSair');
const btnMinhasInscricoesEl = document.getElementById('btnMinhasInscricoes');
const btnConfirmarInscricaoEl = document.getElementById('confirmarInscricao');

// ==========================================
// 3. CONTROLE DE MODAIS
// ==========================================
let modalInscricaoObj;

document.addEventListener("DOMContentLoaded", () => {
    const elModal = document.getElementById('modalConfirmarInscricao');
    if (elModal) {
        modalInscricaoObj = new bootstrap.Modal(elModal);
    }
});

// Função global chamada pelo botão "Inscrever-se" na descrição
window.inscrever = function() {
    if (modalInscricaoObj) {
        modalInscricaoObj.show();
    }
};

// ==========================================
// 4. EVENTO DE LOGOUT (SAIR)
// ==========================================
if (btnSair) {
    btnSair.addEventListener('click', (event) => {
        event.preventDefault();
        
        sessionStorage.removeItem("participanteLogado");
        sessionStorage.removeItem("atividadeSelecionada");
        
        window.location.replace("../loginParticipante.html");
    });
}

// ==========================================
// 5. CARREGAR TABELA DE ATIVIDADES
// ==========================================
async function mostrarTabela() {
    if (!tbody) return;
    
    try {
        const informacoesParaParticipantes = await numeroInscricoes();
        tbody.innerHTML = "";

        informacoesParaParticipantes.forEach(atividade => {
            const linhas = document.createElement('tr');
            const vagasDisponiveis = atividade.vagas - atividade.total_inscricoes;

            linhas.innerHTML = `
                <td>${atividade.nome_atividade}</td>
                <td>${atividade.vagas}</td>
                <td>${vagasDisponiveis}</td>
                <td>
                    <button class="btn-saiba-mais btn btn-sm btn-primary">Saiba Mais</button>
                </td>
            `;

            const saibaMais = linhas.querySelector('.btn-saiba-mais');
            saibaMais.addEventListener('click', () => {
                sessionStorage.setItem("atividadeSelecionada", atividade.id_atividade);
                window.location.href = "descricaoAtividadeParticipante.html";
            });

            tbody.appendChild(linhas);
        });
    } catch (erro) {
        console.error("ERRO AO CARREGAR TABELA: ", erro);
    }
}
mostrarTabela();

// ==========================================
// 6. CARREGAR DESCRIÇÃO DA ATIVIDADE SELECIONADA
// ==========================================
async function mostrarDescricao() {
    if (!desc) return;
    const atividadeSelecionada = sessionStorage.getItem("atividadeSelecionada");

    try {
        const resposta = await descricaoSelecionada({ atividadeSelecionada });
        desc.innerHTML = "";

        resposta.forEach(descricao => {
            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${descricao.descricao}</td>
                <td>
                    <button class="btn btn-success" onclick="inscrever()">Inscrever-se</button>
                </td>
            `;
            desc.appendChild(linha);
        });   
    } catch (erro) {
        console.error('ERRO AO CARREGAR DESCRIÇÃO: ', erro);
    }
}
mostrarDescricao();

// ==========================================
// 7. CARREGAR MINHAS INSCRIÇÕES
// ==========================================
if (btnMinhasInscricoesEl) {
    btnMinhasInscricoesEl.addEventListener('click', async (event) => {
        event.preventDefault();

        try {
            const id_participante = sessionStorage.getItem("participanteLogado");
            if (!minhasInscricoes) return;
            minhasInscricoes.innerHTML = "";

            const respostaApi = await buscarInscricao({ id_participante });
            const listaInscricoes = Array.isArray(respostaApi) ? respostaApi : (respostaApi.inscricoes || respostaApi.resultado || []);

            if (listaInscricoes.length === 0) {
                minhasInscricoes.innerHTML = `<tr><td class="text-center text-muted">Nenhuma inscrição encontrada.</td></tr>`;
            } else {
                listaInscricoes.forEach(inscricao => {
                    const linha = document.createElement("tr");
                    const nomeAtividade = inscricao.nome_atividade || inscricao.nomeAtividade || "Atividade";
                    
                    linha.innerHTML = `
                        <td>${nomeAtividade}</td>ttdd
                    `;
                    minhasInscricoes.appendChild(linha);
                });
            }        
        } catch (erro) {
            console.error("ERRO PARA ACESSAR AS INSCRIÇÕES DO PARTICIPANTE: ", erro);
        }
    });
}

// ==========================================
// 8. REALIZAÇÃO DA INSCRIÇÃO
// ==========================================
if (btnConfirmarInscricaoEl) {
    btnConfirmarInscricaoEl.addEventListener('click', async (event) => {
        event.preventDefault();

        const id_participante = sessionStorage.getItem("participanteLogado");
        const id_atividade = sessionStorage.getItem("atividadeSelecionada");    

        const dados = { id_participante, id_atividade };

        try {
            const resposta = await realizarInscricao(dados);
            const resultado = await resposta.json();

            const modalBody = document.querySelector('#modalConfirmarInscricao .modal-body');
            if (!modalBody) return;

            if (resposta.ok) {
                modalBody.innerHTML = `
                    <p class="fs-5 mb-4 text-success fw-bold">${resultado.mensagem}</p>
                    <button id="btnVoltarLista" class="btn btn-primary px-4">Voltar para a Lista</button>
                `;
            } else {
                modalBody.innerHTML = `
                    <p class="fs-5 mb-4 text-danger fw-bold">${resultado.mensagem || "Erro ao realizar inscrição."}</p>
                    <button id="btnVoltarLista" class="btn btn-secondary px-4">Voltar</button>
                `;
            }

            document.getElementById('btnVoltarLista').addEventListener('click', () => {
                window.location.href = "listaAtividadeParticipante.html";
            });

        } catch (erro) {
            console.error("ERRO AO REGISTRAR INSCRIÇÃO: ", erro);
            alert("Erro de conexão ao realizar inscrição.");
        }
    });
}