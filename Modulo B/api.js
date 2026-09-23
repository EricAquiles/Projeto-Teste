const URL = "http://localhost:3000"

// Login

export async function confirmarLogin(dados) {
    const resposta = await fetch(`${URL}/loginAdiminstrativo`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    });
    return resposta;
}

// Login Participante 

export async function validarLogin(dados) {
    const resposta = await fetch(`${URL}/loginParticipante`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    })
    return resposta;
}

// API para Acesso dos Usuários sem Cadastro feito

export async function numeroInscricoes() {
    const resposta = await fetch(`${URL}/acessoSemLogar`);
    return await resposta.json();
}

export async function descricaoSelecionada(atividadeSelecionada) {
    const resposta = await fetch(`${URL}/acessoSemLogar`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(atividadeSelecionada)
    })
    return await resposta.json()
}

export async function realizarInscricaoSemLogar(dados) {
    const resposta = await fetch(`${URL}/participanteInscricao/salvar`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    });
    return await resposta.json();
}

// API para Participantes

export async function cadastrarParticipante(dados) {
    const resposta = await fetch(`${URL}/participante`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    })
    return await resposta.json();
}

export async function listarParticipantes() {
    const resposta = await fetch(`${URL}/participante`);
    return await resposta.json();
}

export async function deletarParticipante(id_participante) {
    const resposta = await fetch(`${URL}/participante/${id_participante}`, {
        method: "DELETE"
    });
    return await resposta.json();
}

export async function atualizarParticipante(id_participante, dados) {
    const resposta = await fetch(`${URL}/participante/${id_participante}`, {
        method: "PUT",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    });
    return await resposta.json();
}

// API para Atividades

export async function cadastrarAtividade(dados) {
    const resposta = await fetch(`${URL}/atividade`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(dados)
    })
    return await resposta.json();
}

export async function listarAtividades() {
    const resposta = await fetch(`${URL}/atividade`);
    return await resposta.json()
}

export async function deletarAtividade(id_atividade) {
    const resposta = await fetch(`${URL}/atividade/${id_atividade}`, {
        method: "DELETE"
    })
    return await resposta.json()
}

export async function atualizarAtividade(id_atividade, dados) {
    const resposta = await fetch(`${URL}/atividade/${id_atividade}`, {
        method: "PUT",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(dados)
    })
    return await resposta.json();
}

// API para Inscrições

export async function listarInscricoesPorAtividade(id_atividade) {
    const resposta = await fetch(`${URL}/inscricoes/atividade/${id_atividade}`);
    return await resposta.json();
}

export async function listarInscricoesPorEmail(email) {
    const resposta = await fetch(`${URL}/inscricoes/participante?email=${email}`);
    return await resposta.json();
}

export async function deletarInscricao(id_inscricao) {

    const resposta = await fetch(`${URL}/inscricoes/${id_inscricao}`, {
        method: 'DELETE'
    });
    return await resposta.json();
}

// API para Participante Logado

export async function buscarInscricao(dados) {
    const resposta = await fetch(`${URL}/participanteInscricao`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    });
    return await resposta.json();
}

export async function realizarInscricao(dados) {
    const resposta = await fetch(`${URL}/participanteInscricao/salvar`, {
        method: "POST",
        headers: {
            "Content-type" : "application/json"
        },
        body: JSON.stringify(dados)
    })
    return resposta;
}