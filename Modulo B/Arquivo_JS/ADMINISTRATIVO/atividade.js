import { cadastrarAtividade, listarAtividades, deletarAtividade, atualizarAtividade } from "../../api.js"

const tbody = document.getElementById('tabelaAtividades');
let idEditarAtividade = null;

// Cadastrar ou Atualizar Atividade
document.getElementById('atividades').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nomeAtividade = document.getElementById('nomeAtividade').value;
    const descricao = document.getElementById('descricao').value;
    const vagas = document.getElementById('vagas').value;

    if(!nomeAtividade || !descricao || !vagas){
        alert('Preencha todos os campos!');
        return;
    }

    const dados = {
        nomeAtividade,
        descricao,
        vagas
    }

    try{
        // CORRIGIDO: comparando com null (sem aspas)
        if(idEditarAtividade === null){
            // CORRIGIDO: adicionado o await
            const resposta = await cadastrarAtividade(dados);
            console.log(resposta.mensagem);
            alert("Atividade cadastrada com sucesso!");
        }else{
            const resposta = await atualizarAtividade(idEditarAtividade, dados);
            alert(resposta.mensagem);

            idEditarAtividade = null;
            document.getElementById('btnConfirmarCadastro').textContent = "Confirmar";
        }

        document.getElementById('atividades').reset();
        carregarTabela();

        if(typeof visualizarTabelaAtividade === "function"){
            visualizarTabelaAtividade();
        }
    }catch (erro) {
        console.error('ERRO AO CADASTRAR ATIVIDADE: ', erro);
    }
});

// Carregar Tabela 
async function carregarTabela() {
    if(!tbody) return;

    try{
        const atividades = await listarAtividades();
        tbody.innerHTML = "";

        atividades.forEach(atividade => {
            const linhas = document.createElement('tr');

            // CORRIGIDO: adicionado o sinal de '=' e incluída a descrição para bater com os colunas[1]
            linhas.innerHTML = `
                <td>${atividade.nome_atividade}</td>
                <td>${atividade.descricao}</td>
                <td>${atividade.vagas}</td>
                <td>
                    <button class="btn btn-sm btn-danger me-1" data-id="${atividade.id_atividade}" data-acao="excluir">Excluir</button>
                    <button class="btn btn-sm btn-warning" data-id="${atividade.id_atividade}" data-acao="editar">Editar</button>
                </td>
            `;
            tbody.appendChild(linhas);
        })
    }catch (erro){
        console.error("ERRO AO CARREGAR TABELA: ", erro);
    }
}
carregarTabela();

// Ações
if(tbody){
    tbody.addEventListener('click', async (event) => {
        const target = event.target;
        const acao = target.getAttribute('data-acao');
        const idAtividade = target.getAttribute('data-id');

        if(!acao || !idAtividade) return;

        if(acao === "excluir"){
            const confirmar = confirm('Tem certeza que deseja excluir essa atividade?');
            if(!confirmar) return;

            try{
                const resposta = await deletarAtividade(idAtividade);
                alert(resposta.mensagem);
                carregarTabela();
            }catch (erro) {
                console.error('ERRO AO EXCLUIR ATIVIDADE: ', erro);
            }
        }

        if(acao === "editar"){
            const linha = target.closest('tr');
            // CORRIGIDO: trocado target por linha para puxar os tds corretos
            const colunas = linha.querySelectorAll('td');

            document.getElementById('nomeAtividade').value = colunas[0].textContent;
            document.getElementById('descricao').value = colunas[1].textContent;
            document.getElementById('vagas').value = colunas[2].textContent;

            idEditarAtividade = idAtividade;
            document.getElementById('btnConfirmarCadastro').textContent = "Atualizar";

            if(typeof paginaCadastroAtividade === "function"){
                paginaCadastroAtividade();
            }

            window.scrollTo({ top: 0, behavior: 'smooth'});
        }
    });
}