import { confirmarLogin } from "../api.js";

document.getElementById('btnConfirmarLogin').addEventListener('click', async (event) => {
    event.preventDefault();

    const mensagemErro = document.getElementById('msgErro');
    mensagemErro.textContent = ""; // Limpa erros anteriores

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    if (!usuario || !senha) {
        mensagemErro.textContent = "Preencha os campos";
        return;
    }

    const dados = {
        usuario,
        senha
    };

    try {
        const resposta = await confirmarLogin(dados);
        const resultado = await resposta.json();
        
        if (resposta.status === 200 || resposta.status === 201) {
            sessionStorage.setItem("usuarioLogado", JSON.stringify(resultado.id_administracao));
            // Caminho corrigido a partir da raiz do projeto (onde o loginAdministrador.html está localizado)
            window.location.replace("../../Modulo C/Acesso Administrativo/adminParticipante.html");
        } else {
            mensagemErro.textContent = 'Usuário ou senha inválido. Tente novamente';
        }

    } catch (erro) {
        console.error('ERRO AO VALIDAR LOGIN: ', erro);
        mensagemErro.textContent = 'Erro de conexão com o servidor.';
    }
});