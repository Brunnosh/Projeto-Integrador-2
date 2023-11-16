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
app.put("/inserirAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição. 
    const marca = req.body.marca;
    const modelo = req.body.modelo;
    const anoFab = req.body.anoFab;
    const qtdeAssentos = req.body.qtdeAssentos;
    const registro = req.body.registro;
    const disponivel = req.body.disponivel;
    const assentoslinha = req.body.assentoslinha;
    const assentoscorredor = req.body.assentoscorredor;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
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
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.delete("/excluirAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a aeronave pelo código dela:
    const codigo = req.body.codigo;
    // definindo um objeto de resposta.
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
        const cmdDeleteAero = `DELETE AERONAVES WHERE codigo_aeronave = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
app.put("/alterarAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição. 
    const codigo = req.body.marca;
    const marca = req.body.marca;
    const modelo = req.body.modelo;
    const anoFab = req.body.anoFab;
    const qtdeAssentos = req.body.qtdeAssentos;
    const registro = req.body.registro;
    const disponivel = req.body.disponivel;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
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
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// servicos de backend (AEROPORTOS)
app.put("/inserirAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição. 
    const nomeaeroporto = req.body.nomeaeroporto;
    const cidadeaeroporto = req.body.cidadeaeroporto;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
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
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
        const cidade_aeroporto = req.body.cidade_aeroporto;
        // Usando a cláusula WHERE para filtrar por CPF
        const result = yield connection.execute("SELECT * FROM AEROPORTOS WHERE CIDADE_AEROPORTO = :cidade_aeroporto", { cidade_aeroporto: { val: cidade_aeroporto } } // Configuração correta do bind para o parâmetro :cpf
        );
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
    // excluindo a aeronave pelo código dela:
    const codigo = req.body.codigo;
    // definindo um objeto de resposta.
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
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
// servicos de backend (CIDADES)
app.put("/inserirCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição. 
    const nomecidade = req.body.nomecidade;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertCidade = `INSERT INTO CIDADES 
    (CODIGO_cidade, NOME_CIDADE)
    VALUES
    (SEQ_CIDADES.NEXTVAL, :1)`;
        const dados = [nomecidade];
        let resInsert = yield conn.execute(cmdInsertCidade, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
app.delete("/excluirCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a aeronave pelo código dela:
    const codigo = req.body.codigo;
    // definindo um objeto de resposta.
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
        const cmdDeleteAero = `DELETE CIDADES WHERE codigo_cidade = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Cidade excluída.";
        }
        else {
            cr.message = "Cidade não excluída. Verifique se o código informado está correto.";
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
// servicos de backend (TRECHOS)
app.put("/inserirTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição. 
    const cidadepartida = req.body.cidadepartida;
    const cidadechegada = req.body.cidadechegada;
    const aeroportopartida = req.body.aeroportopartida;
    const aeroportochegada = req.body.aeroportochegada;
    const trecho = req.body.trecho;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertTrecho = `INSERT INTO TRECHOS 
    (CODIGO_TRECHO, CIDADE_PARTIDA, CIDADE_CHEGADA, AEROPORTO_PARTIDA, AEROPORTO_CHEGADA, TRECHO)
    VALUES
    (SEQ_TRECHOS.NEXTVAL, :1, :2, :3, :4, :5)`;
        const dados = [cidadepartida, cidadechegada, aeroportopartida, aeroportochegada, trecho];
        let resInsert = yield conn.execute(cmdInsertTrecho, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        //fechar a conexao.
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
app.delete("/excluirTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a aeronave pelo código dela:
    const codigo = req.body.codigo;
    // definindo um objeto de resposta.
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
        const cmdDeleteAero = `DELETE TRECHOS WHERE CODIGO_TRECHO = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "trecho excluída.";
        }
        else {
            cr.message = "trecho não excluída. Verifique se o código informado está correto.";
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
// servicos de backend(VOO)
app.put("/inserirVoo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição.
    const dia_ida = req.body.dia_ida;
    const dia_volta = req.body.dia_volta;
    const horario_ida = req.body.horario_ida;
    const horario_volta = req.body.horario_volta;
    const aeronave = req.body.aeronave;
    const trecho_ida = req.body.trechoida;
    const trecho_volta = req.body.trechovolta;
    const idavolta = req.body.idavolta;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
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
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
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
app.delete("/excluirVoo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a aeronave pelo código dela:
    const codigo = req.body.codigo;
    // definindo um objeto de resposta.
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
        const cmdDeleteAero = `DELETE VOOS WHERE CODIGO_VOO = :1`;
        const dados = [codigo];
        let resDelete = yield connection.execute(cmdDeleteAero, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
//SERVICOS BACKEND ASSENTOS
app.put("/inserirAssento", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição.
    const aeronave = req.body.codigo;
    const assento = req.body.assento;
    const disponivel = 0;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertVoo = `INSERT INTO MAPA_ASSENTOS 
    (aeronave, banco, disponivel)
    VALUES
    (:1, :2, :3)`;
        const dados = [aeronave, assento, disponivel];
        let resInsert = yield conn.execute(cmdInsertVoo, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
app.delete("/excluirAssentoUnico", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a aeronave pelo código dela:
    const aeronave = req.body.aeronave;
    const assento = req.body.assento;
    // definindo um objeto de resposta.
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
        const cmdDeleteAssento = `DELETE FROM MAPA_ASSENTOS WHERE aeronave = :1 AND banco = :2`;
        const dados = [aeronave, assento];
        let resDelete = yield connection.execute(cmdDeleteAssento, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
app.delete("/excluirTodosAssentos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a aeronave pelo código dela:
    const aeronave = req.body.aeronave;
    // definindo um objeto de resposta.
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
        const cmdDeleteAssento = `DELETE FROM MAPA_ASSENTOS WHERE aeronave = :1`;
        const dados = [aeronave];
        let resDelete = yield connection.execute(cmdDeleteAssento, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // encerrar a conexao. 
        yield connection.close();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
//SERVICOS BACKENT CLIENTE
app.put("/inserirCliente", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a aeronave temos que receber os dados na requisição.
    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const email = req.body.email;
    const senha = req.body.senha;
    // correção: verificar se tudo chegou para prosseguir com o cadastro.
    // verificar se chegaram os parametros
    // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
    // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertVoo = `INSERT INTO PASSAGEIROS 
    (nome, cpf, email, senha)
    VALUES
    (:1, :2, :3, :4)`;
        const dados = [nome, cpf, email, senha];
        let resInsert = yield conn.execute(cmdInsertVoo, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
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
        //fechar a conexao.
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
        // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
        const cpf = req.body.cpf;
        // Usando a cláusula WHERE para filtrar por CPF
        const result = yield connection.execute("SELECT * FROM PASSAGEIROS WHERE CPF = :cpf", { cpf: { val: cpf } } // Configuração correta do bind para o parâmetro :cpf
        );
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
app.listen(port, () => {
    console.log("Servidor HTTP funcionando...");
});
