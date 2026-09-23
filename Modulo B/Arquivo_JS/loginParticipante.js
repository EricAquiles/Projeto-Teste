import { validarLogin } from "../api.js"

document.getElementById('login').addEventListener('submit', async (event) => {

    event.preventDefault();
    
    const email = document.getElementById('emailLogin').value;
    const senha = document.getElementById('senhaLogin').value;

    const dados = {
        email,
        senha
    }

    try {
        const resposta = await validarLogin(dados);
        const resultado = await resposta.json();
        
        if (resposta.status === 201) {
            sessionStorage.setItem("participanteLogado", JSON.stringify(resultado.id_participantes))
            window.location.replace("../../Modulo C/Acesso Para Participante/listaAtividadeParticipante.html");
        }else {
            alert('Usuário ou senha inválido. Tente novamente');
        }

    }catch (erro) {
        console.error('ERRO AO VALIDAR LOGIN: ', erro)
    }

})

// Função do Botão Voltar na Tela de Login de Participante
const btnVoltar = document.getElementById('btnVoltar');
if (btnVoltar) {
    btnVoltar.addEventListener('click', (event) => {
        event.preventDefault();
        // Redireciona para a página inicial (ajuste o caminho se necessário para a sua estrutura)
        window.location.replace("../../Modulo C/Interface Sem Acesso/home.html");
    });
}