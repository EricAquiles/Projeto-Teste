import { listarAtividades, listarInscricoesPorAtividade, listarInscricoesPorEmail, deletarInscricao } from "../../api.js";

const tbody = document.getElementById('tbodyInscricoes');

// 1. Carrega as atividades no <select> assim que a página abre
async function inicializarSelectAtividades() {
    try {
        const atividades = await listarAtividades();
        const select = document.getElementById('selectAtividades');
        select.innerHTML = '<option value="">Selecione uma atividade...</option>';
        
        atividades.forEach(ativ => {
            const option = document.createElement('option');
            option.value = ativ.id_atividade;
            option.textContent = ativ.nome_atividade;
            select.appendChild(option);
        });
    } catch (erro) {
        console.error("Erro ao preencher select de atividades:", erro);
    }
}

inicializarSelectAtividades();

// 2. Controla a troca de exibição entre o Select e o Input de E-mail ao mudar o rádio
const radios = document.querySelectorAll('input[name="tipoFiltro"]');
const grupoAtividade = document.getElementById('grupoAtividade');
const grupoParticipante = document.getElementById('grupoParticipante');

radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'atividade') {
            grupoAtividade.classList.remove('d-none');
            grupoParticipante.classList.add('d-none');
        } else {
            grupoAtividade.classList.add('d-none');
            grupoParticipante.classList.remove('d-none');
        }
    });
});

// 3. Ação do Botão de Pesquisar
document.getElementById('btnPesquisar').addEventListener('click', async () => {
    const tipoSelecionado = document.querySelector('input[name="tipoFiltro"]:checked').value;
    tbody.innerHTML = ""; 

    let dados = [];

    if (tipoSelecionado === 'atividade') {
        const idAtividade = document.getElementById('selectAtividades').value;
        if (!idAtividade) {
            alert("Selecione uma atividade!");
            return;
        }
        dados = await listarInscricoesPorAtividade(idAtividade);
    } else {
        const email = document.getElementById('inputEmail').value.trim();
        if (!email) {
            alert("Digite o e-mail do participante!");
            return;
        }
        dados = await listarInscricoesPorEmail(email);
    }

    if (dados && dados.length > 0) {
        dados.forEach(item => {
            console.log("Dados do item:", item);
            const linha = document.createElement('tr');
            
            // ATENÇÃO: Ajuste 'item.id_inscricao' caso a sua API retorne outro nome para o ID da inscrição (ex: item.id)
            linha.innerHTML = `
                <td>${item.nome_participante}</td>
                <td>${item.email}</td>
                <td>${item.nome_atividade}</td>
                <td>
                    <button class="btn btn-sm btn-danger" data-id="${item.id_inscricao}" data-acao="excluir">Excluir</button>
                </td>
            `;
            tbody.appendChild(linha);
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhuma inscrição encontrada.</td></tr>`;
    }
});

// 4. Delegação de Eventos para Excluir Inscrição
if (tbody) {
    tbody.addEventListener('click', async (event) => {
        const target = event.target;
        const acao = target.getAttribute('data-acao');
        const idInscricao = target.getAttribute('data-id');

        if (!acao || !idInscricao) return;

        if (acao === "excluir") {
            const confirmar = confirm('Tem certeza que deseja excluir esta inscrição?');
            if (!confirmar) return;

            try {
                const resposta = await deletarInscricao(idInscricao);
                alert(resposta?.mensagem || "Inscrição excluída com sucesso!");
                
                // Refaz a pesquisa automaticamente para atualizar a tabela
                document.getElementById('btnPesquisar').click();
            } catch (erro) {
                console.error('ERRO AO EXCLUIR INSCRIÇÃO: ', erro);
                alert('Ocorreu um erro ao tentar excluir a inscrição.');
            }
        }
    });
}