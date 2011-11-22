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

Dazzler.manager.projectPanel = Ext.extend(Ext.ux.crudGridPanel.cruPagingGrid, {

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

	Dazzler.manager.projectPanel.superclass.constructor.call(this,config);
	},

	defaultDesc: 'Proyectos',
	title: 'Proyectos del sistema',
	baseParams: {xid: %xid%},
	defaulPageSize: 25,

	addButtonText	: 'Agregar proyecto',
	editButtonText	: 'Editar proyecto',


	storeFields: function(){
		return ['id', 'uid', 'user', 'name', 'url', 'url_signature', 'estado', 'hosts' ];
		},

	gridColumns: function(){
		return  [{ dataIndex: 'name', header: 'Proyecto'},
				{ dataIndex: 'url', header: 'Url'},
				{ dataIndex: 'user', header: 'Administrador'},
				{ dataIndex: 'estado', header: 'Estado', renderer: function (value){
				var img;
				if(value == 0)
					img = '<div><img src=\"{$IconsURL}/world.png\" width=\"16\" height=\"16\" class=\"typeImg\"></div>';
				else if(value == 1)
					img = '<div><img src=\"{$IconsURL}/world_night.png\" width=\"16\" height=\"16\" class=\"typeImg\"></div>';
				else
					img = '<div><img src=\"{$IconsURL}/world_dawn.png\" width=\"16\" height=\"16\" class=\"typeImg\"></div>';
				return img;
				}}	];
		},

	formFields: function(){
		var researcherStore = new Ext.data.Store({
			proxy		: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
			reader		: new Ext.data.JsonReader({
						root: 'root',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'nombre']
						}),
			baseParams	: {'xid': %xid%, 'customFn': 'researchCombo'},
			remoteSort	: true,
			sortInfo	: {field: 'nombre', direction: 'ASC'},
			autoLoad	: {}
			});

		return [{ name: 'user', fieldLabel: 'Administrador', xtype:'combo', allowBlank: false, store: researcherStore, mode: 'local',forceSelection: true, hiddenName: 'uid',valueField: 'id',displayField: 'nombre',  triggerAction: 'all' },
				{ name: 'name', fieldLabel: 'Nombre', allowBlank: false },
				{ name: 'url', fieldLabel: 'Url', allowBlank: false },
				{ name: 'url_signature', fieldLabel: 'Firma', allowBlank: false, xtype: 'textarea' },
				{ name: 'estado', fieldLabel: 'Suspendido', xtype: 'checkbox' }
				];
		}
});
";

}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.manager.projectPanel() );
SCV.mainContent.doLayout();
";
}

function DirectRead($DB, $Data){
$out = array();

$out['root'] = array();
$DB->Consulta("select count(*) from projects;");
$t = $DB->SacaTupla();
$out['totalCount'] = $t[0];
	
$DB->Consulta("select projects.id, uid, nombre as user, name, url, url_signature, estado from (projects left join usuarios on (projects.uid = usuarios.id)) order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

while($t = $DB->SacaTupla(false)){
	$out['root'][] = $t;
	}
$out['success'] = true;

return $out;
}

function DirectCreate($DB, $Data){
$out = array();

$DB->Consulta("select nextval('projects_id_seq'::regclass);");
list($nextid) = $DB->SacaTupla();

if($Data->root->estado)
	$status = 1;
else
	$status = 0;

$uid = intval($Data->root->uid);
$Escaped = $DB->EscapeObject($Data->root,array('name','url','url_signature'));


$DB->Consulta("insert into projects( id,uid,name,url,url_signature,estado ) values($nextid,$uid,'{$Escaped['name']}','{$Escaped['url']}','{$Escaped['url_signature']}',$status);");

if($DB->Estado){
	$out['success'] = true;
	$out['root'] =  array('id'=>$nextid, 'uid'=>$uid, 'name'=>$Data->root->name, 'user'=>$Data->root->user, 'url'=>$Data->root->url, 'url_signature'=>$Data->root->url_signature, 'estado'=>$status );
	}
else{
	$out['success'] = false;
	$out['root'] = array();
	$out['msg'] = "Error al crear el Proyecto, verifique que el nombre no exista y vuelva a intentarlo";
	}

return $out;
}

function DirectUpdate($DB, $Data){
$out = array();
$out['root'] =  array();

if($Data->root->estado)
	$status = 1;
else
	$status = 0;

$uid = intval($Data->root->uid);
$Escaped = $DB->EscapeObject($Data->root,array('name','url','url_signature'));

$DB->Consulta("update projects set uid=$uid, name='{$Escaped['name']}', url='{$Escaped['url']}', url_signature='{$Escaped['url_signature']}', estado={$status} where id = {$Data->root->id}");

if($DB->Estado){
	$out['success'] = true;
	$out['groups'] =  array('id'=>$Data->root->id, 'uid'=>$uid, 'name'=>$Data->root->name, 'user'=>$Data->root->user, 'url'=>$Data->root->url, 'url_signature'=>$Data->root->url_signature, 'estado'=>$status );
	}
else{
	$out['success'] = false;
	$out['msg'] = "Error al actualizar el Proyecto.";
	}

return $out;
}

function DirectDestroy($DB, $Data){
$out = array();

$out['root'] =  array();
$out['success'] = true;
$pid = intval($Data->root);
$DB->Consulta("delete from projects where id = $pid;");

if(!$DB->Estado){
	$out['success'] = false;
	$out['msg'] = "Error al eliminar el Proyecto.";
	}

return $out;
}

function researchCombo($DB, $Data){
$out = array();
$out['root'] = array();

$DB->Consulta("select users.id, nombre from (users left join usuarios on (usuarios.id=users.id)) where tipo&4=4 order by {$Data->sort} {$Data->dir};");

while($t = $DB->SacaTupla(false)){
	$out['root'][] = $t;
	}
$out['success'] = true;

return $out;
}

