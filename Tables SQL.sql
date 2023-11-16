//TABLES//

create table AEROPORTOS2(
    codigo_aeroporto int NOT NULL,
    nome_aeroporto varchar2(30)PRIMARY KEY,
    cidade_aeroporto varchar2(30) NOT NULL,
    constraint FK_cidade_aeroporto2 FOREIGN KEY (cidade_aeroporto) references CIDADES2 (nome_cidade) ON DELETE CASCADE
);

create table CIDADES2(
    codigo_cidade int NOT NULL,
    pais_cidade varchar2(30),
    nome_cidade varchar2(30) PRIMARY KEY,
    constraint FK_pais_cidade2 FOREIGN KEY (pais_cidade) references PAISES2 (nome_pais) ON DELETE CASCADE
);


create table PAISES2(
    codigo_pais int NOT NULL,
    nome_pais varchar2(30) PRIMARY KEY,
    sigla_pais varchar2(5)
);

create table TRECHOS2(
    codigo_trecho int NOT NULL,
    pais_partida varchar2(30) NOT NULL,
    pais_chegada varchar2(30) NOT NULL,
    cidade_partida varchar2(30) NOT NULL,
    cidade_chegada varchar2(30) NOT NULL,
    aeroporto_partida varchar2(30) NOT NULL,
    aeroporto_chegada varchar2(30) NOT NULL,
    trecho varchar2(200) PRIMARY KEY,
    constraint FK_pais_partida2 FOREIGN KEY (pais_partida) references PAISES2 (nome_pais) ON DELETE CASCADE,
    constraint FK_pais_chegada2 FOREIGN KEY (pais_chegada) references PAISES2 (nome_pais) ON DELETE CASCADE,
    constraint FK_cidade_partida2 FOREIGN KEY (cidade_partida) references CIDADES2 (nome_cidade) ON DELETE CASCADE,
    constraint FK_cidade_chegada2 FOREIGN KEY (cidade_chegada) references CIDADES2 (nome_cidade) ON DELETE CASCADE,
    constraint FK_aeroporto_partida2 FOREIGN KEY (aeroporto_partida) references AEROPORTOS2 (nome_aeroporto) ON DELETE CASCADE,
    constraint FK_aeroporto_chegada2 FOREIGN KEY (aeroporto_chegada) references AEROPORTOS2 (nome_aeroporto) ON DELETE CASCADE
);


create table AERONAVES2(
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



create table MAPA_ASSENTOS2(
    aeronave int NOT NULL,
    banco int PRIMARY KEY NOT NULL,
    disponivel int NOT NULL,
    custo int DEFAULT 150 NOT NULL,
    constraint FK_assento_aeronave2 FOREIGN KEY (aeronave) references AERONAVES2 (codigo_aeronave) ON DELETE CASCADE
);



create table VOOS2(
    codigo_voo int PRIMARY KEY,
    dia_ida varchar2(10) NOT NULL,
    dia_volta varchar2(10) NOT NULL,
    horario_ida varchar2(6) NOT NULL,
    horario_volta varchar2(6) NOT NULL,
    aeronave int NOT NULL,
    trecho_ida varchar2(200) NOT NULL,
    trecho_volta varchar2(200) NOT NULL,
    idavolta int NOT NULL,
    unique (aeronave,dia_ida),
    unique (dia_ida,horario_ida),
    unique (aeronave, dia_volta),
    unique (dia_volta,horario_volta),
    constraint FK_aeronave2 FOREIGN KEY (aeronave) references AERONAVES2 (codigo_aeronave) ON DELETE CASCADE,
    constraint FK_trecho_ida2 FOREIGN KEY (trecho_ida) references TRECHOS2 (trecho) ON DELETE CASCADE,
    constraint FK_trecho_volta2 FOREIGN KEY (trecho_volta) references TRECHOS2 (trecho) ON DELETE CASCADE
);


create table PASSAGEIROS2(
    nome varchar2(30),
    cpf varchar2(14) PRIMARY KEY,
    email varchar2(50),
    senha varchar2(15)
    
);



select * from paises2;
select * from CIDADES2;
select * from aeroportos2;
select * from trechos2;



//TABLES BUGADAS

drop table cidades;

drop table paises;


//----------------------------//
//SEQUENCES//
create sequence SEQ_PAISES;

create sequence SEQ_AERONAVES;

create sequence SEQ_VOOS;

create sequence SEQ_TRECHOS;

create sequence SEQ_CIDADES;

create sequence SEQ_AEROPORTOS;
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





