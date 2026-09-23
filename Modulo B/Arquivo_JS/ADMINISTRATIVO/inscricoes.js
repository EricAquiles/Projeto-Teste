import { listarAtividades, listarInscricoesPorAtividade, listarInscricoesPorEmail } from "../../api.js";

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
            grupoAtividade.style.display = 'block';
            grupoParticipante.style.display = 'none';
        } else {
            grupoAtividade.style.display = 'none';
            grupoParticipante.style.display = 'block';
        }
    });
});

// 3. Ação do Botão de Pesquisar
document.getElementById('btnPesquisar').addEventListener('click', async () => {
    const tipoSelecionado = document.querySelector('input[name="tipoFiltro"]:checked').value;
    const tbody = document.getElementById('tbodyInscricoes');
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
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${item.nome_participante}</td>
                <td>${item.email}</td>
                <td>${item.nome_atividade}</td>
            `;
            tbody.appendChild(linha);
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhuma inscrição encontrada.</td></tr>`;
    }
});