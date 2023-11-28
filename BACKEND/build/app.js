"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// recursos/modulos necessarios.
const express_1 = __importDefault(require("express"));
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
// usando o módulo de CORS
const cors_1 = __importDefault(require("cors"));
// preparar o servidor web de backend na porta 3000
const app = (0, express_1.default)();
const port = 3000;
// preparar o servidor para dialogar no padrao JSON 
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// já configurando e preparando o uso do dotenv para 
// todos os serviços.
dotenv_1.default.config();
// servicos de backend (AERONAVES)
app.get("/listarAeronaves", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM AERONAVES");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarAeronavesWhere", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const codigo_aeronave = req.body.codigo_aeronave;
        const result = yield connection.execute("SELECT numero_assentos,assentos_linha,assentos_corredor FROM AERONAVES WHERE codigo_aeronave = :codigo_aeronave", { codigo_aeronave: { val: codigo_aeronave } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.put("/inserirAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const marca = req.body.marca;
    const modelo = req.body.modelo;
    const anoFab = req.body.anoFab;
    const qtdeAssentos = req.body.qtdeAssentos;
    const registro = req.body.registro;
    const disponivel = req.body.disponivel;
    const assentoslinha = req.body.assentoslinha;
    const assentoscorredor = req.body.assentoscorredor;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertAero = `INSERT INTO AERONAVES 
    (CODIGO_AERONAVE, FABRICANTE, MODELO, REGISTRO, ANOFAB, NUMERO_ASSENTOS, DISPONIVEL, assentos_linha, assentos_corredor)
    VALUES
    (SEQ_AERONAVES.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)`;
        const dados = [marca, modelo, registro, anoFab, qtdeAssentos, disponivel, assentoslinha, assentoscorredor];
        let resInsert = yield conn.execute(cmdInsertAero, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeronave inserida.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.delete("/excluirAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.codigo;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = `DELETE AERONAVES WHERE codigo_aeronave = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeronave excluída.";
        }
        else {
            cr.message = "Aeronave não excluída. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.put("/alterarAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.marca;
    const marca = req.body.marca;
    const modelo = req.body.modelo;
    const anoFab = req.body.anoFab;
    const qtdeAssentos = req.body.qtdeAssentos;
    const registro = req.body.registro;
    const disponivel = req.body.disponivel;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertAero = `UPDATE AERONAVES SET CODIGO_AERONAVE = :1, FABRICANTE = :2, MODELO = :3, REGISTRO = :4,
    ANOFAB = :5, NUMERO_ASSENTOS = :6, DISPONIVEL = :7
    WHERE CODIGO_AERONAVE = :1`;
        const dados = [codigo, marca, modelo, registro, anoFab, qtdeAssentos, disponivel];
        let resInsert = yield conn.execute(cmdInsertAero, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeronave inserida.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// servicos de backend (AEROPORTOS)
app.put("/inserirAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nomeaeroporto = req.body.nomeaeroporto;
    const cidadeaeroporto = req.body.cidadeaeroporto;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertAeroporto = `INSERT INTO AEROPORTOS 
    (CODIGO_AEROPORTO, NOME_AEROPORTO, CIDADE_AEROPORTO)
    VALUES
    (SEQ_AEROPORTOS.NEXTVAL, :1, :2)`;
        const dados = [nomeaeroporto, cidadeaeroporto];
        let resInsert = yield conn.execute(cmdInsertAeroporto, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeroporto inserido.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.get("/listarAeroportos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM AEROPORTOS");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarAeroportosWhere", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const cidade_aeroporto = req.body.cidade_aeroporto;
        const result = yield connection.execute("SELECT * FROM AEROPORTOS WHERE CIDADE_AEROPORTO = :cidade_aeroporto", { cidade_aeroporto: { val: cidade_aeroporto } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.codigo;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    // conectando 
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = `DELETE AEROPORTOS WHERE codigo_aeroporto = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "aeroporto excluída.";
        }
        else {
            cr.message = "aeroporto não excluída. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// servicos de backend (CIDADES)
app.put("/inserirCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nomedacidade = req.body.nomecidade;
    const paisdacidade = req.body.paiscidade;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertCidade = `INSERT INTO CIDADES 
    (CODIGO_cidade, PAIS_CIDADE, NOME_CIDADE)
    VALUES
    (SEQ_CIDADES.NEXTVAL, :1, :2)`;
        const dados = [paisdacidade, nomedacidade];
        let resInsert = yield conn.execute(cmdInsertCidade, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Cidade inserida.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.get("/listarCidades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM CIDADES");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarCidadesWhere", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const pais_cidade = req.body.pais_cidade;
        const result = yield connection.execute("SELECT * FROM CIDADES WHERE PAIS_CIDADE = :pais_cidade", { pais_cidade: { val: pais_cidade } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.codigo;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = `DELETE CIDADES WHERE codigo_cidade = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Cidade excluída.";
        }
        else {
            cr.message = "Cidade não excluída, Erro.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// servicos de backend (PAISES)
app.put("/inserirPais", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nomepais = req.body.nomepais;
    const sigla = req.body.sigla;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInserPais = `INSERT INTO PAISES 
    (CODIGO_PAIS, NOME_PAIS, SIGLA_PAIS)
    VALUES
    (SEQ_PAISES.NEXTVAL, :1, :2)`;
        const dados = [nomepais, sigla];
        let resInsert = yield conn.execute(cmdInserPais, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Pais inserido.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.get("/listarPais", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM PAISES");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirPais", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.codigo;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = `DELETE PAISES WHERE codigo_pais = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Pais excluída.";
        }
        else {
            cr.message = "Pais não excluído, Erro.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// servicos de backend (TRECHOS)
app.put("/inserirTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paispartida = req.body.paispartida;
    const paischegada = req.body.paischegada;
    const cidadepartida = req.body.cidadepartida;
    const cidadechegada = req.body.cidadechegada;
    const aeroportopartida = req.body.aeroportopartida;
    const aeroportochegada = req.body.aeroportochegada;
    const trecho = req.body.trecho;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertTrecho = `INSERT INTO TRECHOS 
    (CODIGO_TRECHO,PAIS_PARTIDA, PAIS_CHEGADA, CIDADE_PARTIDA, CIDADE_CHEGADA, AEROPORTO_PARTIDA, AEROPORTO_CHEGADA, TRECHO)
    VALUES
    (SEQ_TRECHOS.NEXTVAL, :1, :2, :3, :4, :5, :6, :7)`;
        const dados = [paispartida, paischegada, cidadepartida, cidadechegada, aeroportopartida, aeroportochegada, trecho];
        let resInsert = yield conn.execute(cmdInsertTrecho, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Trecho inserido.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.get("/listarTrechos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM TRECHOS");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarTrechosWhere", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const cidade_ida = req.body.cidade_ida;
        const cidade_chegada = req.body.cidade_chegada;
        const result = yield connection.execute("SELECT * FROM TRECHOS WHERE CIDADE_PARTIDA = :cidade_partida AND CIDADE_CHEGADA = :cidade_chegada", { cidade_chegada: { val: cidade_chegada }, cidade_partida: { val: cidade_ida } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.codigo;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = `DELETE TRECHOS WHERE CODIGO_TRECHO = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "trecho excluída.";
        }
        else {
            cr.message = "trecho não excluído, Erro.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// servicos de backend(VOO)
app.put("/inserirVoo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dia_ida = req.body.dia_ida;
    const dia_volta = req.body.dia_volta;
    const horario_ida = req.body.horario_ida;
    const horario_volta = req.body.horario_volta;
    const aeronave = req.body.aeronave;
    const trecho_ida = req.body.trechoida;
    const trecho_volta = req.body.trechovolta;
    const idavolta = req.body.idavolta;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    //Se o voo for de ida e volta
    if (idavolta == 1) {
        try {
            conn = yield oracledb_1.default.getConnection({
                user: process.env.ORACLE_DB_USER,
                password: process.env.ORACLE_DB_PASSWORD,
                connectionString: process.env.ORACLE_CONN_STR,
            });
            const cmdInsertVoo = `INSERT INTO VOOS
    (CODIGO_VOO, DIA_IDA, DIA_VOLTA, HORARIO_IDA, HORARIO_VOLTA, AERONAVE, TRECHO_IDA, TRECHO_VOLTA, IDAVOLTA)
    VALUES
    (SEQ_VOOS.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)`;
            const dados = [dia_ida, dia_volta, horario_ida, horario_volta, aeronave, trecho_ida, trecho_volta, idavolta];
            let resInsert = yield conn.execute(cmdInsertVoo, dados);
            yield conn.commit();
            const rowsInserted = resInsert.rowsAffected;
            if (rowsInserted !== undefined && rowsInserted === 1) {
                cr.status = "SUCCESS";
                cr.message = "Voo Cadastrado";
            }
        }
        catch (e) {
            if (e instanceof Error) {
                cr.message = e.message;
                console.log(e.message);
            }
            else {
                cr.message = "Erro ao conectar ao oracle. Sem detalhes";
            }
        }
        finally {
            if (conn !== undefined) {
                yield conn.close();
            }
            res.send(cr);
        }
    }
    //Se o voo for só de ida
    if (idavolta == 0) {
        try {
            conn = yield oracledb_1.default.getConnection({
                user: process.env.ORACLE_DB_USER,
                password: process.env.ORACLE_DB_PASSWORD,
                connectionString: process.env.ORACLE_CONN_STR,
            });
            //sequences auxiliares para não conflitar com as clausulas "unique" no SQL, pq se colocar "0" da integrity constraint, poderia colocar como NULL mas ai daria mais trabalho kk.
            const cmdInsertVoo = `INSERT INTO VOOS
    (CODIGO_VOO, DIA_IDA, DIA_VOLTA, HORARIO_IDA, HORARIO_VOLTA, AERONAVE, TRECHO_IDA, TRECHO_VOLTA, IDAVOLTA)
    VALUES
    (SEQ_VOOS.NEXTVAL, :1, SEQ_DIAVOLTAVAZIO.NEXTVAL, :2, SEQ_HORAVOLTAVAZIO.NEXTVAL, :3, :4, SEQ_TRECHOVOLTAVAZIO.NEXTVAL, :5)`;
            const dados = [dia_ida, horario_ida, aeronave, trecho_ida, idavolta];
            let resInsert = yield conn.execute(cmdInsertVoo, dados);
            yield conn.commit();
            const rowsInserted = resInsert.rowsAffected;
            if (rowsInserted !== undefined && rowsInserted === 1) {
                cr.status = "SUCCESS";
                cr.message = "Voo Cadastrado";
            }
        }
        catch (e) {
            if (e instanceof Error) {
                cr.message = e.message;
                console.log(e.message);
            }
            else {
                cr.message = "Erro ao conectar ao oracle. Sem detalhes";
            }
        }
        finally {
            if (conn !== undefined) {
                yield conn.close();
            }
            res.send(cr);
        }
    }
}));
app.get("/listarVoos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM VOOS");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarVooAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const codigo_aeronave = req.body.codigo_aeronave;
        const result = yield connection.execute("SELECT * FROM VOOS WHERE AERONAVE = :codigo_aeronave ", { codigo_aeronave: { val: codigo_aeronave } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirVoo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const codigo = req.body.codigo;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = `DELETE VOOS WHERE CODIGO_VOO = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Voo excluída.";
        }
        else {
            cr.message = "Voo não excluída. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
//SERVICOS BACKEND ASSENTOS
app.put("/inserirAssento", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isADM = req.body.isADM;
    const aeronave = req.body.aeronave;
    const assento = req.body.assento;
    var cpfpassageiro = req.body.cpfpassageiro;
    const numvoo = req.body.numvoo;
    const disponivel = 0;
    console.log(isADM);
    //Se a inserção estiver vindo de uma tela de ADM
    if (isADM == 1) {
        cpfpassageiro = "0";
        const custo = 0;
        console.log(aeronave);
        console.log(assento);
        console.log(cpfpassageiro);
        console.log(numvoo);
        let cr = {
            status: "ERROR",
            message: "",
            payload: undefined,
        };
        let conn;
        try {
            conn = yield oracledb_1.default.getConnection({
                user: process.env.ORACLE_DB_USER,
                password: process.env.ORACLE_DB_PASSWORD,
                connectionString: process.env.ORACLE_CONN_STR,
            });
            const cmdInsertVoo = `INSERT INTO MAPA_ASSENTOS
    (aeronave, banco, disponivel, custo, cpf_passageiro, numero_voo)
    VALUES
    (:1, :2, :3, :4, :5, :6)`;
            const dados = [aeronave, assento, disponivel, custo, cpfpassageiro, numvoo];
            let resInsert = yield conn.execute(cmdInsertVoo, dados);
            yield conn.commit();
            const rowsInserted = resInsert.rowsAffected;
            if (rowsInserted !== undefined && rowsInserted === 1) {
                cr.status = "SUCCESS";
                cr.message = "assento Cadastrado";
            }
        }
        catch (e) {
            if (e instanceof Error) {
                cr.message = e.message;
                console.log(e.message);
            }
            else {
                cr.message = "Erro ao conectar ao oracle. Sem detalhes";
            }
        }
        finally {
            if (conn !== undefined) {
                yield conn.close();
            }
            res.send(cr);
        }
    }
    //Se a inserção estiver vindo da tela de um cliente
    if (isADM == 0) {
        let cr = {
            status: "ERROR",
            message: "",
            payload: undefined,
        };
        let conn;
        try {
            conn = yield oracledb_1.default.getConnection({
                user: process.env.ORACLE_DB_USER,
                password: process.env.ORACLE_DB_PASSWORD,
                connectionString: process.env.ORACLE_CONN_STR,
            });
            const cmdInsertVoo = `INSERT INTO MAPA_ASSENTOS
      (aeronave, banco, disponivel, cpf_passageiro, numero_voo)
      VALUES
      (:1, :2, :3, :4, :5)`;
            const dados = [aeronave, assento, disponivel, cpfpassageiro, numvoo];
            let resInsert = yield conn.execute(cmdInsertVoo, dados);
            yield conn.commit();
            const rowsInserted = resInsert.rowsAffected;
            if (rowsInserted !== undefined && rowsInserted === 1) {
                cr.status = "SUCCESS";
                cr.message = "assento Cadastrado";
            }
        }
        catch (e) {
            if (e instanceof Error) {
                cr.message = e.message;
                console.log(e.message);
            }
            else {
                cr.message = "Erro ao conectar ao oracle. Sem detalhes";
            }
        }
        finally {
            //fechar a conexao.
            if (conn !== undefined) {
                yield conn.close();
            }
            res.send(cr);
        }
    }
}));
app.get("/listarAssentos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM mapa_assentos");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarAssentosWhere", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const codigo_aeronave = req.body.codigo_aeronave;
        const numero_voo = req.body.numero_voo;
        const result = yield connection.execute("SELECT * FROM MAPA_ASSENTOS WHERE AERONAVE = :codigo_aeronave AND NUMERO_VOO = :numero_voo", { codigo_aeronave: { val: codigo_aeronave }, numero_voo: { val: numero_voo } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.post("/listarAssentosWhereCpf", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const cpf_passageiro = req.body.cpf;
        const result = yield connection.execute("SELECT * FROM MAPA_ASSENTOS WHERE cpf_passageiro = :cpf_passageiro", { cpf_passageiro: { val: cpf_passageiro } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirAssentoUnico", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const aeronave = req.body.aeronave;
    const assento = req.body.assento;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAssento = `DELETE FROM MAPA_ASSENTOS WHERE aeronave = :1 AND banco = :2`;
        const dados = [aeronave, assento];
        let resDelete = yield connection.execute(cmdDeleteAssento, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "assento excluído.";
        }
        else {
            cr.message = "assento não excluído. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.delete("/excluirTodosAssentos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const aeronave = req.body.aeronave;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAssento = `DELETE FROM MAPA_ASSENTOS WHERE aeronave = :1`;
        const dados = [aeronave];
        let resDelete = yield connection.execute(cmdDeleteAssento, dados);
        yield connection.commit();
        yield connection.close();
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "assentos excluídos.";
        }
        else {
            cr.message = "assentos não excluídos. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
//SERVICOS BACKENT CLIENTE
app.put("/inserirCliente", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const email = req.body.email;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertVoo = `INSERT INTO PASSAGEIROS 
    (nome, cpf, email)
    VALUES
    (:1, :2, :3)`;
        const dados = [nome, cpf, email];
        let resInsert = yield conn.execute(cmdInsertVoo, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Cliente Cadastrado";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.post("/loginCliente", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        const cpf = req.body.cpf;
        const result = yield connection.execute("SELECT * FROM PASSAGEIROS WHERE CPF = :cpf", { cpf: { val: cpf } });
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = result.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.get("/listarClientes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM PASSAGEIROS");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
app.put("/atualizarCliente", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cpf = req.body.cpf;
    const email = req.body.email;
    const senha = req.body.senha;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertVoo = `UPDATE PASSAGEIROS set email = :1, senha = :2 where cpf = :3 `;
        const dados = [email, senha, cpf];
        let resInsert = yield conn.execute(cmdInsertVoo, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Cliente Cadastrado";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
//SERVICOS PAGAMENTO
app.put("/InserirPagamento", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cpf = req.body.cpf;
    const custo = req.body.custo;
    const qtd_paga = req.body.qtd_paga;
    const modo_pagamento = req.body.modo_pagamento;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertVoo = `INSERT INTO PAGAMENTOS 
    (cpf_cliente, custo, qtd_paga, modo_pagamento)
    VALUES
    (:1, :2, :3, :4)`;
        const dados = [cpf, custo, qtd_paga, modo_pagamento];
        let resInsert = yield conn.execute(cmdInsertVoo, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Cliente Cadastrado";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.listen(port, () => {
    console.log("Servidor HTTP funcionando...");
});
