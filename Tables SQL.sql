//TABLES//

create table AEROPORTOS(
    codigo_aeroporto int NOT NULL,
    nome_aeroporto varchar2(30)PRIMARY KEY,
    cidade_aeroporto varchar2(30) NOT NULL,
    constraint FK_cidade_aeroporto FOREIGN KEY (cidade_aeroporto) references CIDADES (nome_cidade) ON DELETE CASCADE
);

create table CIDADES(
    codigo_cidade int NOT NULL,
    pais_cidade varchar2(30),
    nome_cidade varchar2(30) PRIMARY KEY,
    constraint FK_pais_cidade FOREIGN KEY (pais_cidade) references PAISES (nome_pais) ON DELETE CASCADE
);


create table PAISES(
    codigo_pais int NOT NULL,
    nome_pais varchar2(30) PRIMARY KEY,
    sigla_pais varchar2(5)
);

create table TRECHOS(
    codigo_trecho int NOT NULL,
    pais_partida varchar2(30) NOT NULL,
    pais_chegada varchar2(30) NOT NULL,
    cidade_partida varchar2(30) NOT NULL,
    cidade_chegada varchar2(30) NOT NULL,
    aeroporto_partida varchar2(30) NOT NULL,
    aeroporto_chegada varchar2(30) NOT NULL,
    trecho varchar2(200) PRIMARY KEY,
    constraint FK_pais_partida FOREIGN KEY (pais_partida) references PAISES (nome_pais) ON DELETE CASCADE,
    constraint FK_pais_chegada FOREIGN KEY (pais_chegada) references PAISES (nome_pais) ON DELETE CASCADE,
    constraint FK_cidade_partida FOREIGN KEY (cidade_partida) references CIDADES (nome_cidade) ON DELETE CASCADE,
    constraint FK_cidade_chegada FOREIGN KEY (cidade_chegada) references CIDADES (nome_cidade) ON DELETE CASCADE,
    constraint FK_aeroporto_partida FOREIGN KEY (aeroporto_partida) references AEROPORTOS (nome_aeroporto) ON DELETE CASCADE,
    constraint FK_aeroporto_chegada FOREIGN KEY (aeroporto_chegada) references AEROPORTOS (nome_aeroporto) ON DELETE CASCADE
);


create table AERONAVES(
    codigo_aeronave int PRIMARY KEY,
    fabricante varchar2(30) NOT NULL,
    modelo varchar2(10) NOT NULL,
    registro varchar2(10) NOT NULL,
    anofab int NOT NULL,
    numero_assentos int NOT NULL,
    disponivel int NOT NULL,
    
    assentos_linha int NOT NULL,
    assentos_corredor int NOT NULL
    

);



create table MAPA_ASSENTOS(
    aeronave int NOT NULL,
    banco int NOT NULL,
    disponivel int NOT NULL,
    custo int DEFAULT 150 NOT NULL,
    cpf_passageiro varchar2(14) NOT NULL,
    numero_voo int NOT NULL,
    CONSTRAINT PK_banco_numero_voo PRIMARY KEY (banco, numero_voo),
    constraint FK_assento_aeronave FOREIGN KEY (aeronave) references AERONAVES (codigo_aeronave) ON DELETE CASCADE,
    constraint FK_cpf_passageiro_assento FOREIGN KEY (cpf_passageiro) references PASSAGEIROS (cpf) ON DELETE CASCADE,
    constraint FK_numero_voo_assento FOREIGN KEY (numero_voo) references VOOS (codigo_voo) ON DELETE CASCADE
);



create table VOOS(
    codigo_voo int PRIMARY KEY,
    dia_ida varchar2(10) NOT NULL,
    dia_volta varchar2(10) NOT NULL,
    horario_ida varchar2(6) NOT NULL,
    horario_volta varchar2(6) NOT NULL,
    aeronave int NOT NULL,
    trecho_ida varchar2(200) NOT NULL,
    trecho_volta varchar2(200) NOT NULL,
    idavolta int NOT NULL,
    unique (aeronave,dia_ida) ,
    unique (aeronave, dia_volta),
    unique (dia_ida,horario_ida),
    unique (dia_volta,horario_volta),
    unique(dia_ida,dia_volta) ,
    constraint FK_aeronave FOREIGN KEY (aeronave) references AERONAVES (codigo_aeronave) ON DELETE CASCADE,
    constraint FK_trecho_ida FOREIGN KEY (trecho_ida) references TRECHOS (trecho) ON DELETE CASCADE

);


create table PASSAGEIROS(
    nome varchar2(30),
    cpf varchar2(14) PRIMARY KEY,
    email varchar2(50)  
);

create table PAGAMENTOS(
    cpf_cliente varchar2(14),
    custo float,
    qtd_paga float,
    modo_pagamento varchar2(15)
    
);



drop table paises;
drop table cidades;
drop table aeroportos;
drop table trechos;
drop table aeronaves;
drop table mapa_assentos;
drop table passageiros;
drop table pagamentos;
drop table voos;

select * from mapa_assentos;
select * from pagamentos;
select * from passageiros;



//TABLES BUGADAS


 
 

drop table passageiros;


//----------------------------//
//SEQUENCES//
create sequence SEQ_PAISES;

create sequence SEQ_AERONAVES;

create sequence SEQ_VOOS;

create sequence SEQ_TRECHOS;

create sequence SEQ_CIDADES;

create sequence SEQ_AEROPORTOS;

create sequence SEQ_DIAVOLTAVAZIO ;

create sequence SEQ_HORAVOLTAVAZIO;

create sequence SEQ_TRECHOVOLTAVAZIO;
//----------------------------//
drop sequence SEQ_PAISES;

drop sequence SEQ_AERONAVES;

drop sequence SEQ_VOOS;

drop sequence SEQ_TRECHOS;

drop sequence SEQ_CIDADES;

drop sequence SEQ_AEROPORTOS;

//---------------------------------------------------

/*CODIGO PRA VER TUDO SOBRE A AERONAVE CADASTRADA A UM VOO utilizando o codigo do voo*/

SELECT voos.codigo_voo, aeronaves.codigo_aeronave, aeronaves.marca, aeronaves.modelo,aeronaves.anofab,aeronaves.registro,aeronaves.numero_assentos
FROM AERONAVES
JOIN VOOS ON VOOS.aeronave = AERONAVES.codigo_aeronave;





