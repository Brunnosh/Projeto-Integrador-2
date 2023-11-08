//TABLES//

create table AEROPORTOS(
    codigo_aeroporto int,
    nome_aeroporto varchar2(30)PRIMARY KEY,
    cidade_aeroporto varchar2(30),
    constraint FK_cidade_aeroporto FOREIGN KEY (cidade_aeroporto) references CIDADES (nome_cidade) ON DELETE CASCADE
);

create table CIDADES(
    codigo_cidade int ,
    nome_cidade varchar2(30) PRIMARY KEY
);

create table TRECHOS(
    codigo_trecho int,
    cidade_partida varchar2(30),
    cidade_chegada varchar2(30),
    aeroporto_partida varchar2(30),
    aeroporto_chegada varchar2(30),
    trecho varchar2(200) PRIMARY KEY,
    constraint FK_cidade_partida FOREIGN KEY (cidade_partida) references CIDADES (nome_cidade) ON DELETE CASCADE,
    constraint FK_cidade_chegada FOREIGN KEY (cidade_chegada) references CIDADES (nome_cidade) ON DELETE CASCADE,
    constraint FK_aeroporto_partida FOREIGN KEY (aeroporto_partida) references AEROPORTOS (nome_aeroporto) ON DELETE CASCADE,
    constraint FK_aeroporto_chegada FOREIGN KEY (aeroporto_chegada) references AEROPORTOS (nome_aeroporto) ON DELETE CASCADE
);


create table AERONAVES(
    codigo_aeronave int PRIMARY KEY,
    fabricante varchar2(30),
    modelo varchar2(10),
    registro varchar2(10),
    anofab int,
    numero_assentos int,
    disponivel int
    

);
create table MAPA_ASSENTOS(
    aeronave int,
    banco int PRIMARY KEY ,
    disponivel int,
    custo int DEFAULT 150,
    constraint FK_assento_aeronave FOREIGN KEY (aeronave) references AERONAVES (codigo_aeronave) ON DELETE CASCADE
);



create table VOOS(
    codigo_voo int PRIMARY KEY,
    dia_ida varchar2(10),
    dia_volta varchar2(10),
    horario_ida varchar2(6),
    horario_volta varchar2(6),
    aeronave int ,
    trecho varchar2(200),
    idavolta int,
    unique (aeronave,dia_ida),
    unique (dia_ida,horario_ida),
    unique (aeronave, dia_volta),
    unique (dia_volta,horario_volta),
    constraint FK_aeronave FOREIGN KEY (aeronave) references AERONAVES (codigo_aeronave) ON DELETE CASCADE,
    constraint FK_trecho FOREIGN KEY (trecho) references TRECHOS (trecho) ON DELETE CASCADE
);

delete from voos;

select * from voos;

//----------------------------//
//SEQUENCES//
create sequence SEQ_AERONAVES;

create sequence SEQ_VOOS;

create sequence SEQ_TRECHOS;

create sequence SEQ_CIDADES;

create sequence SEQ_AEROPORTOS;
//---------------------------------------------------

/*CODIGO PRA VER TUDO SOBRE A AERONAVE CADASTRADA A UM VOO utilizando o codigo do voo*/

SELECT voos.codigo_voo, aeronaves.codigo_aeronave, aeronaves.marca, aeronaves.modelo,aeronaves.anofab,aeronaves.registro,aeronaves.numero_assentos
FROM AERONAVES
JOIN VOOS ON VOOS.aeronave = AERONAVES.codigo_aeronave;





