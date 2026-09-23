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
            // Busca os dados da API com o número de inscrições e vagas
            const informacoesParaParticipantes = await numeroInscricoes();
            tbody.innerHTML = "";

            // Cria as linhas da tabela dinamicamente para cada atividade
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

            // Adiciona o evento de clique nos botões "Saiba Mais" gerados na tabela
            document.querySelectorAll('.btn-saiba-mais').forEach(button => {
                button.addEventListener('click', (e) => {
                    const idAtividade = e.target.getAttribute('data-id');
                    // Salva o ID da atividade selecionada no sessionStorage para usar na próxima tela
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

    // Função para buscar e mostrar a descrição da atividade selecionada
    async function mostrarDescricao() {
        if (!desc) return;
        
        const atividadeSelecionada = sessionStorage.getItem("atividadeSelecionada");

        // Validação de segurança: Se o usuário entrar direto na descrição sem selecionar nenhuma atividade
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
                        <!-- Botão que dispara o 1º modal: "Você já possui cadastro?" -->
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

    // ==========================================
    // CADASTRO DE PARTICIPANTE (Caso não possua cadastro)
    // ==========================================
    const formParticipante = document.getElementById('participante');
    if (formParticipante) {
        formParticipante.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita o recarregamento padrão da página

            // Captura os valores digitados nos inputs do formulário de cadastro
            const nomeParticipante = document.getElementById('nomeParticipante').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const senha = document.getElementById('senha').value;

            // Validação simples via JavaScript (complementar ao 'required' do HTML)
            if (!nomeParticipante || !email || !telefone || !senha) {
                alert('Preencha todos os campos!');
                return;
            }

            const dados = { nomeParticipante, email, telefone, senha };

            try {
                // Envia os dados para a API para cadastrar o participante
                const resposta = await cadastrarParticipante(dados);
                console.log(resposta.mensagem);  

                formParticipante.reset(); // Limpa o formulário

                // Salva o ID do participante recém-cadastrado no sessionStorage
                sessionStorage.setItem("participanteCadastrado", resposta.id_participantes);
                
                // Fecha com segurança o modal de cadastro atual usando a API do Bootstrap 5
                const modalCadastroEl = document.getElementById('modalCadastroParticipante');
                const modalCadastroInstance = bootstrap.Modal.getInstance(modalCadastroEl);
                if (modalCadastroInstance) {
                    modalCadastroInstance.hide();
                }

                // Abre automaticamente o segundo modal (confirmação final da inscrição)
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

    // ==========================================
    // CONFIRMAÇÃO FINAL DA INSCRIÇÃO
    // ==========================================
    const btnConfirmarInscricaoSim = document.getElementById('btnConfirmarInscricaoSim'); 
    if (btnConfirmarInscricaoSim) {
        btnConfirmarInscricaoSim.addEventListener('click', async (event) => {
            event.preventDefault();
            
            // Recupera os IDs necessários salvos na sessão
            const id_atividade = sessionStorage.getItem("atividadeSelecionada");
            const id_participante = sessionStorage.getItem("participanteCadastrado");

            if (!id_atividade || !id_participante) {
                alert("Erro: Dados da atividade ou do participante em falta.");
                return;
            }

            const dados = { id_atividade, id_participante };

            try {
                // Efetiva a inscrição do participante sem acesso prévio
                const resposta = await realizarInscricaoSemLogar(dados);
                console.log(resposta.mensagem);
                
                // Altera o conteúdo interno do modal para exibir a mensagem de sucesso e o botão de retorno
                const modalBody = document.querySelector('#modalConfirmarInscricao .modal-body');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <p class="fs-5 mb-4 text-success fw-bold">Inscrição realizada com sucesso!</p>
                        <button id="btnVoltarLista" class="btn btn-primary px-4">Voltar para a Lista</button>
                    `;
                    
                    // Adiciona evento de clique no botão gerado dinamicamente para voltar à listagem
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