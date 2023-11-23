
// recursos/modulos necessarios.
import express from "express";
import oracledb, { Connection, ConnectionAttributes } from "oracledb";
import dotenv from "dotenv";

// usando o módulo de CORS
import cors from "cors";

// preparar o servidor web de backend na porta 3000
const app = express();
const port = 3000;
// preparar o servidor para dialogar no padrao JSON 
app.use(express.json());
app.use(cors());

// já configurando e preparando o uso do dotenv para 
// todos os serviços.
dotenv.config();

// criando um TIPO chamado CustomResponse.
// Esse tipo vamos sempre reutilizar.
type CustomResponse = {
  status: string,
  message: string,
  payload: any
};



// servicos de backend (AERONAVES)
app.get("/listarAeronaves", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM AERONAVES");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.post("/listarAeronavesWhere", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try {
    const connAttibs = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);

    // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
    const codigo_aeronave = req.body.codigo_aeronave;

    // Usando a cláusula WHERE para filtrar por CPF
    const result = await connection.execute(
      "SELECT numero_assentos,assentos_linha,assentos_corredor FROM AERONAVES WHERE codigo_aeronave = :codigo_aeronave",
      { codigo_aeronave: { val: codigo_aeronave } } // Configuração correta do bind para o parâmetro :cpf
    );

    await connection.close();

    cr.status = "SUCCESS";
    cr.message = "Dados obtidos";
    cr.payload = result.rows;

  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});

app.put("/inserirAeronave", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const marca = req.body.marca as string;
  const modelo = req.body.modelo as string;
  const anoFab = req.body.anoFab as string;
  const qtdeAssentos = req.body.qtdeAssentos as number;
  const registro = req.body.registro as string; 
  const disponivel = req.body.disponivel as number;
  const assentoslinha = req.body.assentoslinha as number; 
  const assentoscorredor = req.body.assentoscorredor as number;  

  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAero = `INSERT INTO AERONAVES 
    (CODIGO_AERONAVE, FABRICANTE, MODELO, REGISTRO, ANOFAB, NUMERO_ASSENTOS, DISPONIVEL, assentos_linha, assentos_corredor)
    VALUES
    (SEQ_AERONAVES.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)`

    const dados = [marca, modelo, registro, anoFab, qtdeAssentos, disponivel, assentoslinha, assentoscorredor];
    let resInsert = await conn.execute(cmdInsertAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave inserida.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.delete("/excluirAeronave", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const codigo = req.body.codigo as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE AERONAVES WHERE codigo_aeronave = :1`
    const dados = [codigo];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave excluída.";
    }else{
      cr.message = "Aeronave não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

app.put("/alterarAeronave", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const codigo = req.body.marca as number;
  const marca = req.body.marca as string;
  const modelo = req.body.modelo as string;
  const anoFab = req.body.anoFab as string;
  const qtdeAssentos = req.body.qtdeAssentos as number;
  const registro = req.body.registro as string; 
  const disponivel = req.body.disponivel as number; 

  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAero = `UPDATE AERONAVES SET CODIGO_AERONAVE = :1, FABRICANTE = :2, MODELO = :3, REGISTRO = :4,
    ANOFAB = :5, NUMERO_ASSENTOS = :6, DISPONIVEL = :7
    WHERE CODIGO_AERONAVE = :1`
    

    const dados = [codigo, marca, modelo, registro, anoFab, qtdeAssentos, disponivel];
    let resInsert = await conn.execute(cmdInsertAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave inserida.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});



// servicos de backend (AEROPORTOS)

app.put("/inserirAeroporto", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const nomeaeroporto = req.body.nomeaeroporto as string;
  const cidadeaeroporto = req.body.cidadeaeroporto as string;

  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAeroporto = `INSERT INTO AEROPORTOS 
    (CODIGO_AEROPORTO, NOME_AEROPORTO, CIDADE_AEROPORTO)
    VALUES
    (SEQ_AEROPORTOS.NEXTVAL, :1, :2)`

    const dados = [nomeaeroporto, cidadeaeroporto];
    let resInsert = await conn.execute(cmdInsertAeroporto, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.get("/listarAeroportos", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM AEROPORTOS");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.post("/listarAeroportosWhere", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try {
    const connAttibs = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);

    // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
    const cidade_aeroporto = req.body.cidade_aeroporto;

    // Usando a cláusula WHERE para filtrar por CPF
    const result = await connection.execute(
      "SELECT * FROM AEROPORTOS WHERE CIDADE_AEROPORTO = :cidade_aeroporto",
      { cidade_aeroporto: { val: cidade_aeroporto } } // Configuração correta do bind para o parâmetro :cpf
    );

    await connection.close();

    cr.status = "SUCCESS";
    cr.message = "Dados obtidos";
    cr.payload = result.rows;

  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});


app.delete("/excluirAeroporto", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const codigo = req.body.codigo as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE AEROPORTOS WHERE codigo_aeroporto = :1`
    const dados = [codigo];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "aeroporto excluída.";
    }else{
      cr.message = "aeroporto não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

// servicos de backend (CIDADES)

app.put("/inserirCidade", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const nomedacidade = req.body.nomecidade as string;
  const paisdacidade = req.body.paiscidade as string;
  
  
  console.log(paisdacidade)

  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertCidade = `INSERT INTO CIDADES 
    (CODIGO_cidade, PAIS_CIDADE, NOME_CIDADE)
    VALUES
    (SEQ_CIDADES.NEXTVAL, :1, :2)`

    const dados = [paisdacidade, nomedacidade];
    let resInsert = await conn.execute(cmdInsertCidade, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.get("/listarCidades", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM CIDADES");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.post("/listarCidadesWhere", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try {
    const connAttibs = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);

    // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
    const pais_cidade = req.body.pais_cidade;

    // Usando a cláusula WHERE para filtrar por CPF
    const result = await connection.execute(
      "SELECT * FROM CIDADES WHERE PAIS_CIDADE = :pais_cidade",
      { pais_cidade: { val: pais_cidade } } // Configuração correta do bind para o parâmetro :cpf
    );

    await connection.close();

    cr.status = "SUCCESS";
    cr.message = "Dados obtidos";
    cr.payload = result.rows;

  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});

app.delete("/excluirCidade", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const codigo = req.body.codigo as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE CIDADES WHERE codigo_cidade = :1`
    const dados = [codigo];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Cidade excluída.";
    }else{
      cr.message = "Cidade não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

// servicos de backend (PAISES)

app.put("/inserirPais", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const nomepais = req.body.nomepais as string;
  const sigla = req.body.sigla as string;


  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInserPais = `INSERT INTO PAISES 
    (CODIGO_PAIS, NOME_PAIS, SIGLA_PAIS)
    VALUES
    (SEQ_PAISES.NEXTVAL, :1, :2)`

    const dados = [nomepais, sigla];
    let resInsert = await conn.execute(cmdInserPais, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Pais inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.get("/listarPais", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM PAISES");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.delete("/excluirPais", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const codigo = req.body.codigo as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE PAISES WHERE codigo_pais = :1`
    const dados = [codigo];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Pais excluída.";
    }else{
      cr.message = "Pais não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

// servicos de backend (TRECHOS)

app.put("/inserirTrecho", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição. 
  const paispartida = req.body.paispartida as string;
  const paischegada = req.body.paischegada as string;
  const cidadepartida = req.body.cidadepartida as string;
  const cidadechegada = req.body.cidadechegada as string;
  const aeroportopartida = req.body.aeroportopartida as string;
  const aeroportochegada = req.body.aeroportochegada as string;
  const trecho = req.body.trecho as string;

  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });


    const cmdInsertTrecho = `INSERT INTO TRECHOS 
    (CODIGO_TRECHO,PAIS_PARTIDA, PAIS_CHEGADA, CIDADE_PARTIDA, CIDADE_CHEGADA, AEROPORTO_PARTIDA, AEROPORTO_CHEGADA, TRECHO)
    VALUES
    (SEQ_TRECHOS.NEXTVAL, :1, :2, :3, :4, :5, :6, :7)`

    const dados = [paispartida, paischegada, cidadepartida, cidadechegada, aeroportopartida,aeroportochegada,trecho];
    let resInsert = await conn.execute(cmdInsertTrecho, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Trecho inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.get("/listarTrechos", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM TRECHOS");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.post("/listarTrechosWhere", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try {
    const connAttibs = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);

    // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
    const cidade_ida = req.body.cidade_ida
    const cidade_chegada = req.body.cidade_chegada
    

    // Usando a cláusula WHERE para filtrar por CPF
    const result = await connection.execute(
      "SELECT * FROM TRECHOS WHERE CIDADE_PARTIDA = :cidade_partida AND CIDADE_CHEGADA = :cidade_chegada",
      { cidade_chegada: { val: cidade_chegada }, cidade_partida: { val: cidade_ida } } // Configuração correta do bind para o parâmetro :cpf
    );

    await connection.close();

    cr.status = "SUCCESS";
    cr.message = "Dados obtidos";
    cr.payload = result.rows;

  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});

app.delete("/excluirTrecho", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const codigo = req.body.codigo as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE TRECHOS WHERE CODIGO_TRECHO = :1`
    const dados = [codigo];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "trecho excluída.";
    }else{
      cr.message = "trecho não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});


// servicos de backend(VOO)

app.put("/inserirVoo", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição.
  const dia_ida = req.body.dia_ida as string;
  const dia_volta = req.body.dia_volta as string;
  const horario_ida = req.body.horario_ida as string;
  const horario_volta = req.body.horario_volta as string;
  const aeronave = req.body.aeronave as number;
  const trecho_ida = req.body.trechoida as string;
  const trecho_volta = req.body.trechovolta as string;  
  const idavolta = req.body.idavolta as number; 



  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  if(idavolta == 1){
      // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertVoo = `INSERT INTO VOOS
    (CODIGO_VOO, DIA_IDA, DIA_VOLTA, HORARIO_IDA, HORARIO_VOLTA, AERONAVE, TRECHO_IDA, TRECHO_VOLTA, IDAVOLTA)
    VALUES
    (SEQ_VOOS.NEXTVAL, :1, :2, :3, :4, :5, :6, :7, :8)`

    const dados = [dia_ida, dia_volta, horario_ida, horario_volta, aeronave, trecho_ida, trecho_volta, idavolta];
    let resInsert = await conn.execute(cmdInsertVoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Voo Cadastrado";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
  }
  if(idavolta == 0){
      // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertVoo = `INSERT INTO VOOS
    (CODIGO_VOO, DIA_IDA, DIA_VOLTA, HORARIO_IDA, HORARIO_VOLTA, AERONAVE, TRECHO_IDA, TRECHO_VOLTA, IDAVOLTA)
    VALUES
    (SEQ_VOOS.NEXTVAL, :1, SEQ_DIAVOLTAVAZIO.NEXTVAL, :2, SEQ_HORAVOLTAVAZIO.NEXTVAL, :3, :4, SEQ_TRECHOVOLTAVAZIO.NEXTVAL, :5)`

    const dados = [dia_ida, horario_ida, aeronave, trecho_ida, idavolta];
    let resInsert = await conn.execute(cmdInsertVoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Voo Cadastrado";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
  }

});

app.get("/listarVoos", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM VOOS");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

    


  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.delete("/excluirVoo", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const codigo = req.body.codigo as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = `DELETE VOOS WHERE CODIGO_VOO = :1`
    const dados = [codigo];

    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Voo excluída.";
    }else{
      cr.message = "Voo não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

//SERVICOS BACKEND ASSENTOS

app.put("/inserirAssento", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição.
  const isADM = req.body.isADM as number;
  const aeronave = req.body.aeronave as number;
  const assento = req.body.assento as number;
  const cpfpassageiro = req.body.cpfpassageiro as string;
  const numvoo = req.body.numvoo as number;
  const disponivel = 0;

  //Se a inserção estiver vindo da tela de ADM
  if(isADM == 1){
    
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertVoo = `INSERT INTO MAPA_ASSENTOS
    (aeronave, banco, disponivel)
    VALUES
    (:1, :2, :3)`

    const dados = [aeronave, assento, disponivel];
    let resInsert = await conn.execute(cmdInsertVoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "assento Cadastrado";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
  }

  //Se a inserção estiver vindo da tela de um cliente
  if(isADM == 0){
    
    let cr: CustomResponse = {
      status: "ERROR",
      message: "",
      payload: undefined,
    };
  
    let conn;
  
    // conectando 
    try{
      conn = await oracledb.getConnection({
         user: process.env.ORACLE_DB_USER,
         password: process.env.ORACLE_DB_PASSWORD,
         connectionString: process.env.ORACLE_CONN_STR,
      });
  
      const cmdInsertVoo = `INSERT INTO MAPA_ASSENTOS
      (aeronave, banco, disponivel, cpf_passageiro, numero_voo)
      VALUES
      (:1, :2, :3, :4, :5)`
  
      const dados = [aeronave, assento, disponivel, cpfpassageiro, numvoo];
      let resInsert = await conn.execute(cmdInsertVoo, dados);
      
      // importante: efetuar o commit para gravar no Oracle.
      await conn.commit();
    
      // obter a informação de quantas linhas foram inseridas. 
      // neste caso precisa ser exatamente 1
      const rowsInserted = resInsert.rowsAffected
      if(rowsInserted !== undefined &&  rowsInserted === 1) {
        cr.status = "SUCCESS"; 
        cr.message = "assento Cadastrado";
      }
  
    }catch(e){
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      //fechar a conexao.
      if(conn!== undefined){
        await conn.close();
      }
      res.send(cr);  
    }
    }
});

app.get("/listarAssentos", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM mapa_assentos");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});

app.post("/listarAssentosWhere", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try {
    const connAttibs = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);

    // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
    const codigo_aeronave = req.body.codigo_aeronave
    const numero_voo = req.body.numero_voo

    

    // Usando a cláusula WHERE para filtrar por CPF
    const result = await connection.execute(
      "SELECT * FROM MAPA_ASSENTOS WHERE AERONAVE = :codigo_aeronave AND NUMERO_VOO = :numero_voo",
      { codigo_aeronave: { val: codigo_aeronave }, numero_voo: { val: numero_voo } } // Configuração correta do bind para o parâmetro :cpf
    );

    await connection.close();

    cr.status = "SUCCESS";
    cr.message = "Dados obtidos";
    cr.payload = result.rows;

  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});

app.delete("/excluirAssentoUnico", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const aeronave = req.body.aeronave as number;
  const assento = req.body.assento as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAssento = `DELETE FROM MAPA_ASSENTOS WHERE aeronave = :1 AND banco = :2`
    const dados = [aeronave, assento];

    let resDelete = await connection.execute(cmdDeleteAssento, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "assento excluído.";
    }else{
      cr.message = "assento não excluído. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

app.delete("/excluirTodosAssentos", async(req,res)=>{
  // excluindo a aeronave pelo código dela:
  const aeronave = req.body.aeronave as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAssento = `DELETE FROM MAPA_ASSENTOS WHERE aeronave = :1`
    const dados = [aeronave];

    let resDelete = await connection.execute(cmdDeleteAssento, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // encerrar a conexao. 
    await connection.close();
    
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "assentos excluídos.";
    }else{
      cr.message = "assentos não excluídos. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});

//SERVICOS BACKENT CLIENTE

app.put("/inserirCliente", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição.
  const nome = req.body.nome as string;
  const cpf = req.body.cpf as string;
  const email = req.body.email as string;
  const senha = req.body.senha as string;


  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertVoo = `INSERT INTO PASSAGEIROS 
    (nome, cpf, email, senha)
    VALUES
    (:1, :2, :3, :4)`

    const dados = [nome, cpf, email, senha];
    let resInsert = await conn.execute(cmdInsertVoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Cliente Cadastrado";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

app.post("/loginCliente", async (req, res) => {
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try {
    const connAttibs = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);

    // Suponha que o CPF esteja no corpo da solicitação como req.body.cpf
    const cpf = req.body.cpf;

    // Usando a cláusula WHERE para filtrar por CPF
    const result = await connection.execute(
      "SELECT * FROM PASSAGEIROS WHERE CPF = :cpf",
      { cpf: { val: cpf } } // Configuração correta do bind para o parâmetro :cpf
    );

    await connection.close();

    cr.status = "SUCCESS";
    cr.message = "Dados obtidos";
    cr.payload = result.rows;

  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao Oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});

app.put("/atualizarCliente", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição.
  const cpf = req.body.cpf as string;
  const email = req.body.email as string;
  const senha = req.body.senha as string;


  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertVoo = `UPDATE PASSAGEIROS set email = :1, senha = :2 where cpf = :3 `

    const dados = [email, senha, cpf];
    let resInsert = await conn.execute(cmdInsertVoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Cliente Cadastrado";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

//SERVICOS PAGAMENTO

app.put("/InserirPagamento", async(req,res)=>{
  
  // para inserir a aeronave temos que receber os dados na requisição.
  const cpf = req.body.cpf as string;
  const custo = req.body.custo as number;
  const qtd_paga = req.body.qtd_paga as number;
  const modo_pagamento = req.body.modo_pagamento as string;


  // correção: verificar se tudo chegou para prosseguir com o cadastro.
  // verificar se chegaram os parametros
  // VALIDAR se estão bons (de acordo com os critérios - exemplo: 
  // não pode qtdeAssentos ser número e ao mesmo tempo o valor ser -5)

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertVoo = `INSERT INTO PAGAMENTOS 
    (cpf_cliente, custo, qtd_paga, modo_pagamento)
    VALUES
    (:1, :2, :3, :4)`

    const dados = [cpf, custo, qtd_paga, modo_pagamento];
    let resInsert = await conn.execute(cmdInsertVoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Cliente Cadastrado";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});


app.listen(port,()=>{
  console.log("Servidor HTTP funcionando...");
});