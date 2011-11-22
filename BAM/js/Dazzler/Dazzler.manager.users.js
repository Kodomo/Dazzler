/* !
 * This file is part of Dazzler
 * Copyright(c) 2011 USI - Universidad de Concepcion
 * 
 * Dazzler is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Dazzler is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Dazzler.  If not, see <http://www.gnu.org/licenses/>.
 * 
*/

function App_define(){
global $IconsURL;
return "
Ext.ns('Dazzler.manager');
/* Panel administracion de grupos de maquinas */

Dazzler.manager.usersPanel = Ext.extend(Ext.ux.crudGridPanel.cruPagingGrid, {

	constructor: function(config){

	config = Ext.apply({
		configStore : { buildFields: this.storeFields },
		baseParams: {xid: %xid%},

		configForm : {
			items		: this.formFields(),
			labelWidth	: 80,
			height		: 250,
			width		: 400
			},

		buildColumns : this.gridColumns
		}, config);

	Dazzler.manager.usersPanel.superclass.constructor.call(this,config);
	},

	defaultDesc: 'Usuarios',
	title: 'Usuarios del sistema',
	defaulPageSize: 25,

	addButtonText	: 'Agregar usuario',
	editButtonText	: 'Editar usuario',


	storeFields: function(){
		return ['id', 'login', 'nombre', 'correo', 'clave', 'tipo1', 'tipo2', 'tipo3', 'hosts', 'proyectos' ];
		},

	gridColumns: function(){
		return  [{ dataIndex: 'login', header: 'Login'},
				{ dataIndex: 'nombre', header: 'Nombre'},
				{ dataIndex: 'correo', header: 'Correo'},
				{ dataIndex: 'hosts', header: 'Equipos'},
				{ dataIndex: 'projects', header: 'Proyectos'},
				{ dataIndex: 'tipo1', header: ' ', renderer: function (value, metaData, record){
				var img = '<div>';

				if(record.get('tipo1'))
					img += '<img src=\"{$IconsURL}/user_star.png\" width=\"16\" height=\"16\" class=\"typeImg\">';

				if(record.get('tipo2'))
					img += '<img src=\"{$IconsURL}/user_green.png\" width=\"16\" height=\"16\" class=\"typeImg\">';

				if(record.get('tipo3'))
					img += '<img src=\"{$IconsURL}/user_suit_black.png\" width=\"16\" height=\"16\" class=\"typeImg\">';

				img += '</div>';
				return img;
				}}	];
		},

	formFields: function(){
		return [{ name: 'login' , fieldLabel: 'Login', allowBlank: false },
				{ name: 'nombre', fieldLabel: 'Nombre', allowBlank: false },
				{ name: 'clave', fieldLabel: 'Clave', allowBlank: false, 
					inputType: 'password',
					minLengthText: 'La clave debe tener de 6 a 20 caracteres',
					minLength: 6,
					maxLengthText: 'La clave debe tener de 6 a 20 caracteres',
					maxLength: 20 },
				{ name: 'correo', fieldLabel: 'Correo electronico', allowBlank: false, vtype: 'email'},
				{ name: 'tipo1', fieldLabel: 'Administrador', xtype: 'checkbox' },
				{ name: 'tipo2', fieldLabel: 'Proveedor', xtype: 'checkbox' },
				{ name: 'tipo3', fieldLabel: 'Investigador', xtype: 'checkbox' }
				];
		}

});
";

}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.manager.usersPanel() );
SCV.mainContent.doLayout();
";

}

function DirectRead($DB, $Data){
$out = array();

$out['root'] = array();
$DB->Consulta("select count(*) from users;");
$t = $DB->SacaTupla();
$out['totalCount'] = $t[0];
	
$DB->Consulta("select users.id, login, nombre, clave, correo, tipo from (users left join usuarios on (users.id = usuarios.id)) order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

while($t = $DB->SacaTupla(false)){
	$t['tipo1'] = ($t['tipo'] & 1)&&1;
	$t['tipo2'] = ($t['tipo'] & 2)&&1;
	$t['tipo3'] = ($t['tipo'] & 4)&&1;

	$out['root'][] = $t;
	}
$out['success'] = true;

return $out;
}

function DirectCreate($DB, $Data){
$out = array();

$tipo = 0;

if($Data->root->tipo1)
	$tipo += 1;
if($Data->root->tipo2)
	$tipo += 2;
if($Data->root->tipo3)
	$tipo += 4;

$salt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"; 
srand((double)microtime()*1000000); // start the random generator 
$password=""; // set the inital variable 
for ($i=0;$i<64;$i++)  // loop and create password 
	$password = $password . substr ($salt, rand() % strlen($salt), 1); 

$weakhash = md5($password);
$login = $DB->EscapeString($Data->root->login);
$nombre = $DB->EscapeString($Data->root->nombre);
$clave = $DB->EscapeString($Data->root->clave);
$correo = $DB->EscapeString($Data->root->correo);

$DB->Consulta("select nextval('usuarios_id_seq'::regclass);");
list($uid) = $DB->SacaTupla();
$DB->Consulta("select nextval('groups_id_seq'::regclass);");
list($gid) = $DB->SacaTupla();

$DB->Consulta("begin;");
$DB->Consulta("insert into usuarios( id,login,nombre,clave,correo ) values($uid,'$login','$nombre','$clave','$correo');");
$DB->Consulta("insert into users( id,weakhash,group_default,tipo ) values($uid,'$weakhash',$gid,$tipo);");
$DB->Consulta("insert into groups( id,uid,name,info ) values($gid,$uid,'Default','Grupo por defecto');");

if($Data->root->tipo1)
	$DB->Consulta("insert into gusuarios(gid,uid) values(1001,$uid);");
if($Data->root->tipo2)
	$DB->Consulta("insert into gusuarios(gid,uid) values(1002,$uid);");
if($Data->root->tipo3)
	$DB->Consulta("insert into gusuarios(gid,uid) values(1003,$uid);");

$DB->Consulta("commit;");


if($DB->Estado){
	$out['success'] = true;
	$out['root'] =  array('id'=>$uid, 'login'=>$Data->root->login, 'nombre'=>$Data->root->nombre, 'correo'=>$Data->root->correo, 'clave'=>$Data->root->clave, 'tipo1'=>$Data->root->tipo1, 'tipo2'=>$Data->root->tipo2, 'tipo3'=>$Data->root->tipo3 );
	}
else{
	$out['success'] = false;
	$out['root'] = array();
	$out['msg'] = "Error al crear el usuario, verifique que el nombre no exista y vuelva a intentarlo";
	}

return $out;
}

function DirectUpdate($DB, $Data){
$out = array();
$out['root'] =  array();

if($Data->root->tipo1)
	$tipo += 1;
if($Data->root->tipo2)
	$tipo += 2;
if($Data->root->tipo3)
	$tipo += 4;

$DB->Consulta("begin;");
$DB->Consulta("update usuarios set nombre='{$Data->root->nombre}', clave='{$Data->root->clave}' where id = {$Data->root->id}");
$DB->Consulta("update users set tipo=$tipo where id = {$Data->root->id}");
$DB->Consulta("commit;");
if($DB->Estado){
	if($Data->root->tipo1)
		$DB->Consulta("insert into gusuarios(gid,uid) values(1001,{$Data->root->id});");
	else
		$DB->Consulta("delete from gusuarios where gid=1001 and uid={$Data->root->id};");

	if($Data->root->tipo2)
		$DB->Consulta("insert into gusuarios(gid,uid) values(1002,{$Data->root->id});");
	else
		$DB->Consulta("delete from gusuarios where gid=1002 and uid={$Data->root->id};");

	if($Data->root->tipo3)
		$DB->Consulta("insert into gusuarios(gid,uid) values(1003,{$Data->root->id});");
	else
		$DB->Consulta("delete from gusuarios where gid=1003 and uid={$Data->root->id};");

	$out['success'] = true;
	$out['root'] =  array('id'=>$Data->root->id,  'login'=>$Data->root->login, 'correo'=>$Data->root->correo, 'nombre'=>$Data->root->nombre,  'clave'=>$Data->root->clave, 'tipo1'=>$Data->root->tipo1, 'tipo2'=>$Data->root->tipo2, 'tipo3'=>$Data->root->tipo3 );
	}
else{
	$out['success'] = false;
	$out['msg'] = "Error al actualizar el Usuario.";
	}

return $out;
}

function DirectDestroy($DB, $Data){
$out = array();

$out['root'] =  array();
$out['success'] = true;
$DB->Consulta("begin;");
$DB->Consulta("delete from users where id = {$Data->root};");
$DB->Consulta("delete from usuarios where id = {$Data->root};");
$DB->Consulta("commit;");

if(!$DB->Estado){
	$out['success'] = false;
	$out['msg'] = "Error al eliminar el Usuario.";
	}

return $out;
}

