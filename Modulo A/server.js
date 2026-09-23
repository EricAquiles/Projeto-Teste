const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
const routes = require('../Modulo B/routes.js')

const app = express();

app.use(express.json());
app.use(cors());

app.use(routes);

app.listen(3000, () => {
    console.log('Servidor ligado com sucesso!')
})