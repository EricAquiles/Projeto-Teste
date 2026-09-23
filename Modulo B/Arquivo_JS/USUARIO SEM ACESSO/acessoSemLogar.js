import { numeroInscricoes, descricaoSelecionada, cadastrarParticipante, realizarInscricao, realizarInscricaoSemLogar } from "../../api.js";

// Identifica qual página está aberta no navegador pelo nome do arquivo na URL
const paginaAtual = window.location.pathname;

// ==========================================
// 1. LÓGICA EXCLUSIVA DA TELA: listaAtividades.html
// ==========================================
if (paginaAtual.includes("listaAtividades.html")) {
    const tbody = document.getElementById('tabelaAtividade');

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
                        <button class="btn btn-sm btn-primary btn-saiba-mais" data-id="${atividade.id_atividade}">Saiba Mais</button>
                    </td>
                `;
                tbody.appendChild(linhas);
            });

            // Adiciona o evento de clique nos botões gerados dinamicamente
            document.querySelectorAll('.btn-saiba-mais').forEach(button => {
                button.addEventListener('click', (e) => {
                    const idAtividade = e.target.getAttribute('data-id');
                    sessionStorage.setItem("atividadeSelecionada", idAtividade);
                    window.location.href = "descricao.html";
                });
            });

        } catch (erro) {
            console.error("ERRO AO CARREGAR TABELA: ", erro);
        }
    }

    mostrarTabela();
}


// ==========================================
// 2. LÓGICA EXCLUSIVA DA TELA: descricao.html
// ==========================================
if (paginaAtual.includes("descricao.html")) {
    const desc = document.getElementById('tabelaDescricao');

    // Mostrar a Descrição da Atividade Selecionada
    async function mostrarDescricao() {
        if (!desc) return;
        
        const atividadeSelecionada = sessionStorage.getItem("atividadeSelecionada");

        if (!atividadeSelecionada) {
            alert("Nenhuma atividade selecionada!");
            window.location.href = "listaAtividades.html";
            return;
        }

        try {
            const resposta = await descricaoSelecionada({ atividadeSelecionada });
            desc.innerHTML = "";

            resposta.forEach(item => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${item.descricao}</td>
                    <td>
                        <!-- Dispara o modal de pergunta "Você já possui cadastro?" -->
                        <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalPossuiCadastro">
                            Inscrever-se
                        </button>
                    </td>
                `;
                desc.appendChild(linha);
            });
        } catch (erro) {
            console.error('ERRO AO CARREGAR DESCRIÇÃO: ', erro);
        }
    }

    mostrarDescricao();

    // Cadastro de Participante caso não possua
    const formParticipante = document.getElementById('participante');
    if (formParticipante) {
        formParticipante.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nomeParticipante = document.getElementById('nomeParticipante').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const senha = document.getElementById('senha').value;

            if (!nomeParticipante || !email || !telefone || !senha) {
                alert('Preencha todos os campos!');
                return;
            }

            const dados = { nomeParticipante, email, telefone, senha };

            try {
                const resposta = await cadastrarParticipante(dados);
                console.log(resposta.mensagem);  

                formParticipante.reset();  

                sessionStorage.setItem("participanteCadastrado", resposta.id_participantes);
                
                // Fecha o modal de cadastro atual com segurança
                const modalCadastroEl = document.getElementById('modalCadastroParticipante');
                const modalCadastroInstance = bootstrap.Modal.getInstance(modalCadastroEl);
                if (modalCadastroInstance) {
                    modalCadastroInstance.hide();
                }

                // Abre o segundo pop-up (modal de confirmação final) após cadastrar com sucesso
                const modalConfirmarEl = document.getElementById('modalConfirmarInscricao');
                if (modalConfirmarEl) {
                    const modalConfirmar = new bootstrap.Modal(modalConfirmarEl);
                    modalConfirmar.show();
                }
                
            } catch (erro) {
                console.error('Erro ao Salvar Participante: ', erro);
                alert('Erro ao cadastrar participante.');
            }
        });
    }

    // Cadastrar atividade do participante sem Acesso (Confirmação final no modal)
    const btnConfirmar = document.getElementById('btnConfirmarInscricaoSim'); 
    if (btnConfirmar) {
        // Evita duplicação de eventos clonando o nó do botão de forma segura
        const novoBtnConfirmar = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtnConfirmar, btnConfirmar);

        // Ajustado para escutar o ID correto do botão no HTML
        document.getElementById('btnConfirmarInscricaoSim').addEventListener('click', async (event) => {
            event.preventDefault();
            
            const id_atividade = sessionStorage.getItem("atividadeSelecionada");
            const id_participante = sessionStorage.getItem("participanteCadastrado");

            if (!id_atividade || !id_participante) {
                alert("Erro: Dados da atividade ou do participante em falta.");
                return;
            }

            const dados = { id_atividade, id_participante };

            try {
                const resposta = await realizarInscricaoSemLogar(dados);
                console.log(resposta.mensagem);
                
                const modalBody = document.querySelector('#modalConfirmarInscricao .modal-body');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <p class="fs-5 mb-4 text-success fw-bold">Inscrição realizada com sucesso!</p>
                        <button id="btnVoltarLista" class="btn btn-primary px-4">Voltar para a Lista</button>
                    `;
                    
                    document.getElementById('btnVoltarLista').addEventListener('click', () => {
                        window.location.href = "listaAtividades.html";
                    });
                } else {
                    window.location.href = "listaAtividades.html";
                }

            } catch (erro) {
                console.error("ERRO AO REGISTRAR INSCRIÇÃO: ", erro);
                alert("Erro ao realizar inscrição.");
            }
        });
    }
}

