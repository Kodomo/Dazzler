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

Dazzler.manager.unknownHostsPanel = Ext.extend(	Ext.ux.crudGridPanel.cruPagingGrid, {

	constructor: function(config){

		this.usersStore = new Ext.data.Store({
			proxy		: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
			reader		: new Ext.data.JsonReader({
						root: 'root',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'nombre']
						}),
			baseParams	: {'xid': %xid%, 'customFn': 'usersCombo'},
			remoteSort	: true,
			sortInfo	: {field: 'nombre', direction: 'ASC'},
			autoLoad	: true
			});


	config = Ext.apply({
		configStore 	: { buildFields: this.storeFields },
		baseParams		: {xid: %xid%},
		configForm 		: {
						items		: this.formFields(),
						labelWidth	: 80,
						height		: 80,
						width		: 350
						},

		viewConfig		: this.buildViewConf(),
		tbar			: this.buildTbar(),
		buildColumns 	: this.gridColumns,

		defaultDesc		: 'Equipos',
		title			: 'Equipos sin cuenta en el sistema',
		defaulPageSize	: 25,

		editButtonText	: 'Asignar usuario',

		}, config);

	Dazzler.manager.unknownHostsPanel.superclass.constructor.call(this,config);

	this.store.on('update',this.onUpdateHost,this);

	},

	storeFields: function(){
		return ['id','uid', 'name', 'ipaddr', 'cpus', 'mips', 'flops', 'last', 'hits' ];
		},
	onUpdateHost: function(){
		this.store.reload({});
		},
	gridColumns: function(){
		return  [{ dataIndex: 'name', header: 'Nombre'},
				{ dataIndex: 'user', header: 'UserLogin'},
				{ dataIndex: 'cpus', header: 'N° CPU'},
				{ dataIndex: 'mips', header: 'MIPS'},
				{ dataIndex: 'flops', header: 'Flops'},
				{ dataIndex: 'ipaddr', header: 'Ip'},
				{ dataIndex: 'hits', header: 'Contactos'},
				{ dataIndex: 'last', header: 'Último contacto'},
				{ dataIndex: 'id', header: 'Request',
					renderer: function(){
						return	'<div class=\"controlBtn\"><img src=\"{$IconsURL}/page_white_acrobat.png\" width=\"16\" height=\"16\" class=\"control_view\"></div>';
						}
				}	];
		},


	buildTbar: function(){

		return [ '->', {
			text	: this.editButtonText,
			ref		: '../editBtn',
			iconCls	: Ext.ux.TDGi.iconMgr.getIcon('bullet_edit'),
			disabled: true,
			scope	: this,
			handler	: this.onEdit
			} ];
		},

	formFields: function(){
		return [{ name: 'usuario', fieldLabel: 'Administrador', xtype:'combo', allowBlank: false, store: this.usersStore, mode: 'local',forceSelection: true, hiddenName: 'uid',valueField: 'id',displayField: 'nombre',  triggerAction: 'all' } ];
		}

});
";

}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.manager.unknownHostsPanel() );
SCV.mainContent.doLayout();
";

}

function DirectRead($DB, $Data){
global $conf;
$out = array();

$out['root'] = array();

$DB->Consulta("select count(*) from hosts where gid = {$conf->conf->defaultGroup};");
$t = $DB->SacaTupla();
$out['totalCount'] = $t[0];


$DB->Consulta("select id, name, ipaddr, cpus, mips, flops, last_contact as last,hits from hosts where gid = {$conf->conf->defaultGroup} order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");
while($t = $DB->SacaTupla(false)){
	$t['ipaddr'] = long2ip(sprintf("%u",$t['ipaddr']));
	$t['last'] = date('d/m/Y H:i', $t['last']);
	$t['uid'] = "0";
	$out['root'][] = $t;
	}

$out['success'] = true;

return $out;
}

function DirectUpdate($DB, $Data){
$out = array();
$out['root'][] = array();

$hid = intval($Data->root->id);
$uid = intval($Data->root->uid);
if(($hid > 0) && ($uid > 0)){
	$DB->Consulta("select group_default from users where id = $uid");
	list( $gid ) = $DB->SacaTupla();
	if($gid > 0){
		$DB->Consulta("select correo from usuarios where id = $uid");
		list( $correo ) = $DB->SacaTupla();

		$DB->Consulta("select cpid from hosts where id = $hid");
		list( $cpid ) = $DB->SacaTupla();

		$xcpid = $DB->EscapeString(md5($correo.$cpid));

		$DB->Consulta("update hosts set gid=$gid, xcpid='$xcpid' where id = $hid");
		$out['success'] = true;
		}
	else
		$out['success'] = false;
	}
else
	$out['success'] = false;

return $out;
}

function usersCombo($DB, $Data){
$out['root'] = array();
$out['totalCount'] = $DB->Consulta("select users.id, nombre,tipo from (users left join usuarios on (users.id = usuarios.id)) order by {$Data->sort} {$Data->dir};");

while($t = $DB->SacaTupla(false)){
	if($t['tipo'] & 2)/* list only providers */
		$out['root'][] = $t;
	}

$out['success'] = true;

return $out;
}

