import { confirmarLogin } from "../api.js";

// Botão Voltar (ajuste o caminho se home.html estiver em outra pasta)
const btnVoltar = document.getElementById('btnVoltar');
if (btnVoltar) {
    btnVoltar.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = "Interface Sem Acesso/home.html";
    });
}

// Envio do formulário de login
const formLoginAdmin = document.getElementById('formLoginAdmin');
if (formLoginAdmin) {
    formLoginAdmin.addEventListener('submit', async (event) => {
        event.preventDefault();

        const mensagemErro = document.getElementById('msgErro');
        mensagemErro.textContent = "";

        const usuario = document.getElementById('usuario').value.trim();
        const senha = document.getElementById('senha').value;

        if (!usuario || !senha) {
            mensagemErro.textContent = "Preencha os campos";
            return;
        }

        try {
            const resultado = await confirmarLogin({ usuario, senha });
            const idAdmin = resultado?.id_administracao ?? resultado?.id_administrador;

            if (idAdmin) {
                sessionStorage.setItem("usuarioLogado", JSON.stringify(idAdmin));
                window.location.href = "Acesso Administrativo/adminParticipante.html";
            } else {
                mensagemErro.textContent = resultado?.mensagem || "Usuário ou senha inválido. Tente novamente";
            }
        } catch (erro) {
            console.error('ERRO AO VALIDAR LOGIN: ', erro);
            mensagemErro.textContent = 'Erro de conexão com o servidor.';
        }
    });
}