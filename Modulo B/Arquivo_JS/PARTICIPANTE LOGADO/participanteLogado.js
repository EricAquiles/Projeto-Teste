import { buscarInscricao, numeroInscricoes, descricaoSelecionada, realizarInscricao } from "../../api.js"

const participanteLogado = sessionStorage.getItem("participanteLogado");

if(!participanteLogado){
    alert("Acesso Negado! Faça o login novamente.")
    window.location.replace("../loginParticipante.html")
}

const tbody = document.getElementById('tabelaAtividade');
const desc = document.getElementById('tabelaDescricao');
const minhasInscricoes = document.getElementById('tabelaMinhasInscricoes');

// Variável para controlar o modal de confirmação do participante logado
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
}

// Função de Sair / Logout do Participante
const btnSair = document.getElementById('btnSair');
if (btnSair) {
    btnSair.addEventListener('click', (event) => {
        event.preventDefault();
        
        sessionStorage.removeItem("participanteLogado");
        sessionStorage.removeItem("atividadeSelecionada");
        
        window.location.replace("../loginParticipante.html");
    });
}

// Tabela de descrição das Atividades
async function mostrarTabela() {
    if (!tbody) return;
    
    try{
        const informacoesParaParticipantes = await numeroInscricoes();
        tbody.innerHTML = "";

        informacoesParaParticipantes.forEach(atividade => {
            const linhas = document.createElement('tr')
            const vagasDisponiveis = atividade.vagas - atividade.total_inscricoes;

            linhas.innerHTML = `
                <td>${atividade.nome_atividade}</td>
                <td>${atividade.vagas}</td>
                <td>${vagasDisponiveis}</td>
                <td>
                    <button class="btn-saiba-mais btn btn-sm btn-primary">Saiba Mais</button>
                </td>
            `;

            const saibaMais = linhas.querySelector('.btn-saiba-mais')

            saibaMais.addEventListener('click', () => {
                sessionStorage.setItem("atividadeSelecionada", atividade.id_atividade);
                // Altere para caminho relativo direto a partir da pasta atual:
                window.location.href = "descricaoAtividadeParticipante.html";
            })

            tbody.appendChild(linhas)
        })
    }catch (erro){
        console.error("ERRO AO CARREGAR TABELA: ", erro)
    }
}
mostrarTabela()

// Mostrar a Descrição da Atividade Selecionada
async function mostrarDescricao() {
    const atividadeSelecionada = sessionStorage.getItem("atividadeSelecionada")

    try {
        const resposta = await descricaoSelecionada({atividadeSelecionada});
        if (!desc) return;
        desc.innerHTML = "";

        resposta.forEach(descricao => {
            const linha = document.createElement('tr')

            linha.innerHTML = `
                <td>${descricao.descricao}</td>
                <td>
                    <button class="btn btn-success" onclick="inscrever()">Inscrever-se</button>
                </td>
            `
            desc.appendChild(linha);
        })   
    }catch (erro){
        console.error('ERRO AO CARREGAR DESCRIÇÃO: ', erro)
    }
}
mostrarDescricao()

// Mostrar as Atividades inscritas
const btnMinhasInscricoesEl = document.getElementById('btnMinhasInscricoes');
if (btnMinhasInscricoesEl) {
    btnMinhasInscricoesEl.addEventListener('click', async (event) => {
        event.preventDefault();

        try{
            const id_participante = sessionStorage.getItem("participanteLogado")
            if (!minhasInscricoes) return;
            minhasInscricoes.innerHTML = "";

            // Caso a sua API em api.js já retorne o .json() tratado, usamos direto:
// O NOVO CÓDIGO SEGURO:
const respostaApi = await buscarInscricao({id_participante});

// Garante que pegamos o array de dentro, independentemente de como a API estruturou
const listaInscricoes = Array.isArray(respostaApi) ? respostaApi : (respostaApi.inscricoes || respostaApi.resultado || []);

if (listaInscricoes.length === 0) {
    minhasInscricoes.innerHTML = `<tr><td class="text-center text-muted">Nenhuma inscrição encontrada.</td></tr>`;
} else {
    listaInscricoes.forEach(inscricao => {
        const linha = document.createElement("tr")
        // Tenta ler 'nome_atividade' ou 'nomeAtividade' dependendo do seu banco
        const nomeAtividade = inscricao.nome_atividade || inscricao.nomeAtividade || "Atividade";
        
        linha.innerHTML = `
            <td>${nomeAtividade}</td>
        `
        minhasInscricoes.appendChild(linha);
    });
}        
        }catch (erro) {
            console.error("ERRO PARA ACESSAR AS INSCRIÇOES DO PARTICIPANTE: ", erro)
        }
    });
}

// Realização da inscrição do Participante
const btnConfirmarInscricaoEl = document.getElementById('confirmarInscricao');
if (btnConfirmarInscricaoEl) {
    btnConfirmarInscricaoEl.addEventListener('click', async (event) => {
        event.preventDefault();

        const id_participante = sessionStorage.getItem("participanteLogado");
        const id_atividade = sessionStorage.getItem("atividadeSelecionada");    

        const dados = {
            id_participante,
            id_atividade
        }

        try {
            const resposta = await realizarInscricao(dados);
            const resultado = await resposta.json();

            const modalBody = document.querySelector('#modalConfirmarInscricao .modal-body');
            if (!modalBody) return;

            // Se deu certo (status 200 ou 201)
            if (resposta.ok) {
                modalBody.innerHTML = `
                    <p class="fs-5 mb-4 text-success fw-bold">${resultado.mensagem}</p>
                    <button id="btnVoltarLista" class="btn btn-primary px-4">Voltar para a Lista</button>
                `;
            } else {
                // Se caiu no erro de duplicidade (status 400) ou outro erro
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