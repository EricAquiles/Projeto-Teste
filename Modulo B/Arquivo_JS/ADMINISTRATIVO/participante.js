import { cadastrarParticipante, listarParticipantes, deletarParticipante, atualizarParticipante } from '../../api.js'

const tbody = document.getElementById('tabelaParticipantes');

let idEditarParticipante = null;

// Cadastrar Participante

document.getElementById('participante').addEventListener('submit', async (event) => {

    event.preventDefault();

    const nomeParticipante = document.getElementById('nomeParticipante').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;

    if(!nomeParticipante || !email || !telefone || !senha) {
        alert('Preencha todos os Campos!! ')
        return;
    }

    const dados = {
        nomeParticipante,
        email,
        telefone,
        senha
    }


    try{
        if(idEditarParticipante === null){
            const resposta = await cadastrarParticipante(dados)
            console.log(resposta.mensagem);

                     
        } else {
            const resposta = await atualizarParticipante(idEditarParticipante, dados);
            alert(resposta.mensagem);

            idEditarParticipante = null;
            document.getElementById('btnConfirmarCadastro').textContent = 'Confirmar';
        }

        document.getElementById('participante').reset();   

        carregarTabela()

        if (typeof visualizarTabelaParticipante === 'function'){
            visualizarTabelaParticipante();
        }
    } catch (erro) {
        console.error('Erro ao Salvar Participante: ', erro)
    }
})

// Carregar tabela

async function carregarTabela() {
    
    if(!tbody) return;

    try{
        const participantes = await listarParticipantes();
        tbody.innerHTML = '';

        participantes.forEach(participante => {
            const linhas = document.createElement('tr');

            linhas.innerHTML = `
            
                <td>${participante.nome_participante}</td>
                <td>${participante.email}</td>
                <td>${participante.telefone}</td>
                <td>
                    <button data-id = "${participante.id_participante}" data-acao = "excluir">Excluir</button>
                    <button data-id = "${participante.id_participante}" data-acao = "editar">Editar</button>
                </td>
            `;
            tbody.appendChild(linhas)
        })
    } catch (erro) {
        console.error('Erro ao carregar tabela: ', erro)
    }
}

carregarTabela()

// Ações

if (tbody) {
    tbody.addEventListener('click', async (event) => {
        const target = event.target;
        const acao = target.getAttribute('data-acao');
        const idParticipante = target.getAttribute('data-id');

        if(!idParticipante || !acao) return;

        if(acao === 'excluir'){
            const confirmar = confirm('Tem certeza que deseja excluir esse participante? ');
            if(!confirmar) return;

            try{
                const resposta = await deletarParticipante(idParticipante);
                alert(resposta.mensagem);
                carregarTabela();
            }catch (erro) {
                console.error('ERRO AO DELETAR REGISTRO DO PARTICIPANTE: ', erro)
            }
        }

        if(acao === 'editar'){
            const linha = target.closest('tr');
            const colunas = linha.querySelectorAll('td');

            document.getElementById('nomeParticipante').value = colunas[0].textContent;
            document.getElementById('email').value = colunas[1].textContent;
            document.getElementById('telefone').value = colunas[2].textContent;

            idEditarParticipante = idParticipante;
            document.getElementById('btnConfirmarCadastro').textContent = 'Atualizar';

            if(typeof paginaCadastroParticipante === "function"){
                paginaCadastroParticipante()
            }

            window.scrollTo({ top:0, behavior: 'smooth'});
        }

    })
}