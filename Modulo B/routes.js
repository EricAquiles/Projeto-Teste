const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require("../Modulo A/database.js")

// Envio de Email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ericaquiles29@gmail.com',
        pass: 'erjy ybea jias cmag'  
    }
});

// Login
router.post("/loginAdiminstrativo", async (req, res) => {
    const {usuario, senha} = req.body;

    const [linhas] = await pool.query(
        `select * from administrador where usuario = ? and senha = ?`, [usuario, senha]
    )

    if(linhas.length === 0) {
        return res.status(400).json({
            mensagem: 'USUÁRIO INVÁLIDO'
        })
    }

    const administrador = linhas[0]

    res.status(201).json({
        mensagem : 'USUÁRIO VÁLIDO',
        id_administrador : administrador.id_administrador
    })
});

// Login para Participantes
router.post("/loginParticipante", async (req, res) => {
    const {email, senha} = req.body;

    const [linhas] = await pool.query(
        `select * from participantes where email = ? and senha = ?`, [email, senha]
    )

    if(linhas.length === 0) {
        return res.status(400).json({
            mensagem: 'USUÁRIO INVÁLIDO'
        })
    }

    const participante = linhas[0]

    res.status(201).json({
        mensagem : 'USUÁRIO VÁLIDO',
        id_participantes : participante.id_participante
    })
});

// Rotas para Acesso dos Usuários sem Logar
router.get("/acessoSemLogar", async (req, res) => {
    try{
        const [linhas] = await pool.query(
            `
                select 
                    a.id_atividade,
                    a.nome_atividade,
                    a.descricao,
                    a.vagas,
                    count(i.id_inscricoes) as total_inscricoes
                from
                    atividades a
                left join
                    inscricoes i on a.id_atividade = i.id_atividade
                group by
                    a.id_atividade,
                    a.nome_atividade,
                    a.descricao,
                    a.vagas
            `
        )
        res.json(linhas)
    }catch (erro){
        console.error("ERRO AO CARREGAR TABELA: ", erro)
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.post("/acessoSemLogar", async (req,res) => {
    try {
        const {atividadeSelecionada} = req.body;

        const [linha] = await pool.query(
            `select descricao from atividades where id_atividade = ?`, [atividadeSelecionada]
        )

        res.json(linha);        
    }catch (erro){
        console.error('ERRO AO REALIZAR A REQUISIÇÃO DA DESCRIÇÃO: ', erro)
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

// Rotas para Participante
router.post("/participante", async (req, res) => {
    const {nomeParticipante, email, telefone, senha} = req.body;

    try{
        const [existente] = await pool.query(
            `select * from participantes where email = ? `, [email]
        );

        if(existente.length > 0){
            return res.status(400).json({
                erro: "Já existe um participante com esse email"
            })
        }

        const [resultado] = await pool.query(
            `insert into participantes(nome_participante, email, telefone, senha) values(?, ?, ?, ?)`, [nomeParticipante, email, telefone, senha]
        );

        const idGerado = resultado.insertId;

        const mailOptions = {
            from: 'ericaquiles29@gmail.com',
            to: email,
            subject: 'Confirmação de Cadastro - Sistema de Atividades',
            text: `Olá ${nomeParticipante},\n\nSeu cadastro foi realizado com sucesso!\n\nSeus dados de acesso:\nE-mail: ${email}\nSenha: ${senha}\n\nGuarde bem suas informações!`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            mensagem: 'Participante cadastrado com sucesso e e-mail enviado!',
            id_participantes: idGerado 
        });

    } catch (erro) {
        console.error('ERRO AO CADASTRAR PARTICIPANTE: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.get("/participante", async (req,res) => {
    try{
        const [linhas] = await pool.query(
            `select * from participantes`
        )
        res.json(linhas);
    } catch (erro) {
        console.error('ERRO AO REALIZAR A REQUISIÇÃO DA TABELA: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.put("/participante/:id_participante", async (req, res) => {
    const {id_participante} = req.params;
    const {nomeParticipante, email, telefone} = req.body;

    try{
        await pool.query(
            `update participantes set nome_participante = ?, email = ?, telefone = ? where id_participante = ?`, [nomeParticipante, email, telefone, id_participante]
        );
        res.json({
            mensagem: "Participante atualizado com sucesso!"
        })
    }catch (erro) {
        console.error('ERRO AO ATUALIZAR PARTICIPANTE: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.delete("/participante/:id_participante", async (req, res) => {
    const {id_participante} = req.params;

    try{
        const [linhas] = await pool.query(
            `select * from inscricoes where id_participante = ?`,[id_participante]
        )

        if(linhas.length > 0){
            return res.status(400).json({
                mensagem: "ESTE PARTICIPANTE POSSUI INSCRIÇÃO EM ALGUMA ATIVIDADE, EXCLUA TODAS AS INSCRIÇÕES DELE PARA PROSSEGUIR"
            })
        }

        await pool.query(
            `delete from participantes where id_participante = ?`, [id_participante]
        )

        res.json({
            mensagem: 'Participante excluido com sucesso'
        })
    }catch(erro) {
        console.error('ERRO AO EXCLUIR PARTICIPANTE: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

// Rotas para Atividade
router.post("/atividade", async (req, res) => {
    const { nomeAtividade, descricao, vagas } = req.body;

    try{
        const [existente] = await pool.query(
            `select * from atividades where nome_atividade = ?`, [nomeAtividade]
        )

        if(existente.length > 0){
            return res.status(400).json({
                mensagem: "Essa atividade já existe"
            })
        }

        await pool.query(
            `insert into atividades(nome_atividade, descricao, vagas) values (?, ?, ?)`, [nomeAtividade, descricao, vagas]
        )
        res.status(201).json({
            mensagem : "Atividade cadastrada com sucesso!"
        })
    }catch (erro){
        console.error('ERRO AO CADASTRAR ATIVIDADE: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.get("/atividade", async (req, res) => {
    try{
        const [linhas] = await pool.query(
            `select * from atividades`
        )
        res.json(linhas)
    }catch (erro){
        console.error('ERRO AO CARREGAR ATIVIDADES: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.put("/atividade/:id_atividade", async (req, res) => {
    const {id_atividade} = req.params;
    const {nomeAtividade, descricao, vaga} = req.body;

    try{
        await pool.query(
            `update atividades set nome_atividade = ?, descricao = ?, vagas = ? where id_atividade = ?`,[nomeAtividade, descricao, vaga, id_atividade]
        )

        res.json({
            mensagem : "Atividade atualizada com sucesso!"
        })
    }catch (erro) {
        console.error('ERRO AO ATUALIZAR A ATIVIDADE: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.delete("/atividade/:id_atividade", async (req, res) => {
    const {id_atividade} = req.params;

    try{
        const [existe] = await pool.query(
            `select * from inscricoes where id_atividade = ?`,[id_atividade]
        )

        if(existe.length > 0 ){
            return res.status(400).json({
                mensagem: "Esta atividade tem participantes inscritos"
            })
        }

        await pool.query(
            `delete from atividades where id_atividade = ?`, [id_atividade]
        )
        res.json({
            mensagem : "Atividade excluida com sucesso"
        })
    }catch (erro) {
        console.error('ERRO AO EXCLUIR A ATIVIDADE: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

// Rotas para Inscrições (Por Atividade)
router.get("/inscricoes/atividade/:id_atividade", async (req, res) => {
    const { id_atividade } = req.params;
    try {
        const [linhas] = await pool.query(
            `select 
                i.id_inscricoes, 
                p.nome_participante, 
                p.email, 
                a.nome_atividade 
             from inscricoes i
             join participantes p on i.id_participante = p.id_participante
             join atividades a on i.id_atividade = a.id_atividade
             where i.id_atividade = ?`,
            [id_atividade]
        );
        res.json(linhas);
    } catch (erro) {
        console.error("ERRO AO BUSCAR INSCRIÇÕES POR ATIVIDADE: ", erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

// Por Email
router.get("/inscricoes/participante", async (req, res) => {
    const { email } = req.query;
    try {
        const [linhas] = await pool.query(
            `select 
                i.id_inscricoes, 
                p.nome_participante, 
                p.email, 
                a.nome_atividade 
             from inscricoes i
             join participantes p on i.id_participante = p.id_participante
             join atividades a on i.id_atividade = a.id_atividade
             where p.email LIKE ?`,
            [`%${email}%`]
        );
        res.json(linhas);
    } catch (erro) {
        console.error("ERRO AO BUSCAR INSCRIÇÕES POR EMAIL: ", erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

// Rota para deletar uma inscrição pelo ID correto (`id_inscricoes`)
router.delete("/inscricoes/:id_inscricoes", async (req, res) => {
    const { id_inscricoes } = req.params;

    try {
        const [resultado] = await pool.query(
            `DELETE FROM inscricoes WHERE id_inscricoes = ?`, 
            [id_inscricoes]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Inscrição não encontrada." });
        }

        res.json({
            mensagem: "Inscrição excluída com sucesso!"
        });
    } catch (erro) {
        console.error('ERRO AO EXCLUIR A Inscrição: ', erro);
        res.status(500).json({ erro: "Erro ao excluir inscrição no banco de dados." });
    }
});

// Participante Logado
router.post("/participanteInscricao", async (req, res) => {
    const {id_participante} = req.body;

    try{
        const [linhas] = await pool.query(
            `
                SELECT 
                    i.id_inscricoes,
                    a.id_atividade,
                    a.nome_atividade
                FROM inscricoes i
                JOIN atividades a ON i.id_atividade = a.id_atividade
                WHERE i.id_participante = ?
            `, [id_participante]
        )   
        res.json(linhas)    
    }catch (erro){
        console.error("ERRO AO TRAZER AS INSCRIÇOES DO PARTICIPANTE: ", erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

router.post("/participanteInscricao/salvar", async (req,res) => {
    const {id_atividade, id_participante} = req.body;

    try{
        const [linhas] = await pool.query(
            `select * from inscricoes where id_participante = ? and id_atividade = ?`, [id_participante, id_atividade]
        )

        if(linhas.length > 0 ){
            return res.status(400).json({
                mensagem: "PARTICIPANTE JÁ CADASTRADO NESSA ATIVIDADE"
            })
        }

        await pool.query(
            `insert into inscricoes (id_participante, id_atividade) values(?, ?)`, [id_participante, id_atividade]
        )

        res.status(200).json({
            mensagem: "INSCRIÇÃO REALIZADA COM SUCESSO"
        })
    }catch (erro){
        console.error('ERRO AO REALIZAR INSCRIÇÃO: ', erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

module.exports = router;