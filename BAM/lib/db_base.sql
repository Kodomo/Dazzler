CREATE TABLE contenido (
    id		BIGSERIAL PRIMARY KEY ,
    pid		BIGINT NOT NULL,
    pos		SMALLINT,
    tipo	SMALLINT,
    hijos	SMALLINT DEFAULT 0,
    nombre  VARCHAR(50),
	icon	VARCHAR(32),
    contenido TEXT,
	FOREIGN KEY (pid) REFERENCES contenido(id) ON DELETE CASCADE ON UPDATE CASCADE
)  ;

CREATE TABLE usuarios (
    id		BIGSERIAL PRIMARY KEY ,
	login	VARCHAR(50) not null unique,
	clave	VARCHAR(50) not null,
	sesion	BIGINT default null,

	activo	smallint default 1,
	
    nombre  VARCHAR(50),
    correo  VARCHAR(50)
)  ;

CREATE TABLE sesiones (
    id			BIGSERIAL PRIMARY KEY ,
	inicio		BIGINT not null,
	fin			BIGINT not null,
	usuario		BIGINT not null,

	estado		SMALLINT default 0,
	
    ip  		INTEGER,
    useragent	VARCHAR(200),
	so			SMALLINT,
	navegador	SMALLINT,
	pais		SMALLINT,
	p			INTEGER,
	w			SMALLINT
) ;


CREATE TABLE grupos (
    id		BIGSERIAL PRIMARY KEY ,
    nombre  VARCHAR(50)

)  ;

CREATE TABLE gcontenido (
	gid	BIGINT not null,
	cid	BIGINT	not null,

    PRIMARY KEY(gid,cid),

	FOREIGN KEY (gid) REFERENCES grupos(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (cid) REFERENCES contenido(id) ON DELETE CASCADE ON UPDATE CASCADE
)  ;

CREATE TABLE gusuarios (
	gid	BIGINT not null,
	uid	BIGINT	not null,

    PRIMARY KEY(gid,uid),

	FOREIGN KEY (gid) REFERENCES grupos(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (uid) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
)  ;

-- sequencias
ALTER SEQUENCE contenido_id_seq INCREMENT 1  MINVALUE 1 MAXVALUE 9223372036854775807  RESTART 1001 CACHE 1  NO CYCLE;
ALTER SEQUENCE usuarios_id_seq 	INCREMENT 1  MINVALUE 1 MAXVALUE 9223372036854775807  RESTART 1001 CACHE 1  NO CYCLE;
ALTER SEQUENCE grupos_id_seq 	INCREMENT 1  MINVALUE 1 MAXVALUE 9223372036854775807  RESTART 1001 CACHE 1  NO CYCLE;

-- system base 
insert into contenido(id,pid,pos,tipo,nombre,icon,contenido) values(1,1,0,0,'app-root','folder','');


-- grupos
--insert into grupos(id,nombre) values(1,'User Admin');
--insert into grupos(id,nombre) values(2,'Web Admin');
--insert into grupos(id,nombre) values(3,'Group Admin');
--insert into grupos(id,nombre) values(10,'Basic User');


-- App Admin
--insert into contenido(id,pid,pos,tipo,nombre,hijos,icon,contenido) values(10,1,1,0,'Administracion del sistema',1,'folder','');
--insert into gcontenido(gid,cid) values(1,10);
--insert into gcontenido(gid,cid) values(2,10);
--insert into gcontenido(gid,cid) values(3,10);

--insert into contenido(id,pid,pos,tipo,nombre,icon,contenido) values(11,10,1,2,'Usuarios','user','Dazzler.admin.user.js');
--insert into gcontenido(gid,cid) values(1,11);

--insert into contenido(id,pid,pos,tipo,nombre,icon,contenido) values(12,10,2,2,'Aplicacion','application_edit','Dazzler.admin.content.js');
--insert into gcontenido(gid,cid) values(2,12);

--insert into contenido(id,pid,pos,tipo,nombre,icon,contenido) values(13,10,3,2,'Grupos','application_edit','Dazzler.admin.group.js');
--insert into gcontenido(gid,cid) values(3,13);


-- Admin user
--insert into usuarios(id,login,clave,activo,nombre,correo) values(100,'admin','webadmin',1,'Admin Account','root@localhost');
-- Permisos Admin
--insert into gusuarios(gid,uid) values(1,100);
--insert into gusuarios(gid,uid) values(2,100);
--insert into gusuarios(gid,uid) values(3,100);
--insert into gusuarios(gid,uid) values(10,100);

-- Basic User
--insert into usuarios(id,login,clave,activo,nombre,correo) values(101,'user','pass',1,'User Account','user@localhost');
-- Permisos basicos
--insert into gusuarios(gid,uid) values(10,101);



