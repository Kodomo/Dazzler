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
return "
Ext.ns('Dazzler.admin');
/* Panel administracion de grupos */

Dazzler.admin.groupData = function(config){
	config = Ext.apply({
		 proxy: new Ext.data.DirectProxy({
			api: {
				read: Dazzler.api.DirectRead,
				create: Dazzler.api.DirectCreate,
				update: Dazzler.api.DirectUpdate,
				destroy: Dazzler.api.DirectDestroy
				},
			listeners: {
				exception : function(proxy, type, action, options, res, arg) {
					var vMsg = '';
					if(type == 'response'){
						vMsg = 'Ocurrio un error al comunicarse al servidor, verifique la conexión de red e intente la operación nuevamente';
						}
					else{
						vMsg = res.msg;
						}
	                Ext.Msg.show({title: 'Error',msg: vMsg,icon: Ext.MessageBox.ERROR,  buttons: Ext.Msg.OK});
					}

				}
//			baseParams: {type: 'dataquery'},
//			method: 'POST',
//            directFn: Dazzler.api.DirectFn
        }),
        reader: new Ext.data.JsonReader({
            root: 'groups',
            totalProperty: 'totalCount',
            idProperty: 'id',
			messageProperty: 'msg',
			fields: ['id','nombre','usuarios','contenido']
        }),
		writer: new Ext.data.JsonWriter({
				encode: false, writeAllFields: false
				}),

		baseParams: {xid: %xid%},
		remoteSort: true,
        sortInfo: {field: 'id', direction: 'ASC'},
        autoLoad: {params:{start: 0, limit: 25}}
		}, config);

	Dazzler.admin.groupData.superclass.constructor.call(this,config);
	};

Ext.extend(Dazzler.admin.groupData, Ext.data.Store, {});

Dazzler.admin.groupGrid = function(config){
	this.ds = new Dazzler.admin.groupData({id:'storeAdminGroup'});
	this.msm = new Ext.grid.RowSelectionModel( {	singleSelect:true });

	this.onAddGroup = config.onAddGroup ? config.onAddGroup : function(){},
	this.onEditGroup = config.onEditGroup ? config.onEditGroup : function(){},
	this.onDeleteGroup = config.onDeleteGroup ? config.onDeleteGroup : function(){},

	config = Ext.apply({
		store: this.ds,
        colModel: new Ext.grid.ColumnModel({
			defaults: { sortable: true },
			columns: [
				{ dataIndex: 'id'   , width: 60, header: 'Id' },
				{ dataIndex: 'nombre', header: 'Nombre' },
				{ dataIndex: 'usuarios', header: 'Usuarios', sortable: false },
				{ dataIndex: 'contenido', header: 'Paginas', sortable: false }]
        	}),
		viewConfig: {forceFit: true },
		sm: this.msm,
		loadMask: {msg:'Cargando datos...'},

		tbar: [{
			text: 'Agregar Grupo',
			iconCls: Ext.ux.TDGi.iconMgr.getIcon('group_add'),
			handler: this.onAddGroup
			} , '->', {
			text: 'Editar Grupo',
			ref: '../EdtButton',
			iconCls: Ext.ux.TDGi.iconMgr.getIcon('group_edit'),
			disabled: true,
			handler: this.onEditGroup
			} , '-', {
			text: 'Quitar Grupo',
			ref: '../DelButton',
			iconCls: Ext.ux.TDGi.iconMgr.getIcon('group_delete'),
			disabled: true,
			handler: this.onDeleteGroup
			} ],

        bbar: new Ext.PagingToolbar({
            pageSize: 25,
            store: this.ds,
            displayInfo: true,
            displayMsg: 'Mostrando grupos {0} al {1} de {2}',
            emptyMsg: 'No existen grupos'
	        })
		}, config);

	Dazzler.admin.groupGrid.superclass.constructor.call(this,config);

	this.msm.on('rowselect', 
		function(sm){
			var SelGroupId = this.getSelectionModel().getSelected().get('id');
			this.EdtButton.setDisabled(false);
			this.DelButton.setDisabled(false);

		} , this);

	this.msm.on('rowdeselect', 
		function(sm){
			Ext.getCmp('groupAdminGrid').EdtButton.setDisabled(true);
			Ext.getCmp('groupAdminGrid').DelButton.setDisabled(true);
		} , this)

	};

Ext.extend(Dazzler.admin.groupGrid, Ext.grid.GridPanel, {
/*
	onAdd : function(){},//funciones auxiliares para comunicarse con los otros paneles.
	onEdit : function(){},
	onDelete : function(){}
*/
});


Dazzler.admin.groupEditForm = function(config){
// funciones auxiliares para comunicarse con los otros paneles.

	this.onSaveGroup = config.onSaveGroup ? config.onSaveGroup : function() {},
	this.onBackToGrid = config.onBackToGrid ? config.onBackToGrid : function() {},
	this.groupRecord = null,

	config = Ext.apply({
		frame: true,
		items: [{
			xtype:'fieldset',
			title: 'Datos de Grupo',
			defaultType: 'textfield',
			labelWidth: 150,
			anchor: '99%',
			defaults: {anchor: '90%'},
			items: [{ name: 'nombre', fieldLabel: 'Nombre', allowBlank: false } ]
			}],
		buttons: [{ text: 'Guardar', iconCls: Ext.ux.TDGi.iconMgr.getIcon('disk'), handler: this.onSaveGroup },
				  { text: 'Volver', iconCls: Ext.ux.TDGi.iconMgr.getIcon('bullet_left'), handler: this.onBackToGrid }]

		}, config);

	Dazzler.admin.groupEditForm.superclass.constructor.call(this,config);
	};
Ext.extend(Dazzler.admin.groupEditForm, Ext.FormPanel, { });

/* Window container of the form */
Dazzler.admin.groupEditWindow = function(config){

	config = Ext.apply({
		id: 'groupEditWindow',
		closable: false, 
		resizable: false, 
		modal: true,
		closable: false,
		resizable: false,
		items: [ new Dazzler.admin.groupEditForm({
		id: 'groupEditForm',
		
		onBackToGrid: function(){
			Ext.getCmp('groupEditWindow').close();
			},
		onSaveGroup: function(){
			var form = Ext.getCmp('groupEditForm');
			if (!form.getForm().isValid()) {
				Ext.Msg.show({
				    title: 'Error al modificar',
				    msg: 'Los datos ingresados no son validos, intentelo nuevamente',
				    icon: Ext.MessageBox.ERROR,
				    buttons: Ext.Msg.OK
					});
				return false;
				}
			form.getForm().updateRecord(form.groupRecord);
			Ext.getCmp('groupEditWindow').close();
			}
		}) ]

		}, config);

	Dazzler.admin.groupEditWindow.superclass.constructor.call(this,config);
}

Ext.extend(Dazzler.admin.groupEditWindow, Ext.Window, { });

/* Window container of the form */
Dazzler.admin.groupAddWindow = function(config){

	config = Ext.apply({
		id: 'groupAddWindow',
		closable: false, 
		resizable: false, 
		modal: true,
		items: [ new Dazzler.admin.groupEditForm({
		id: 'groupAddForm',
		
		onBackToGrid: function(){
			Ext.getCmp('groupAddWindow').close();
			},
		onSaveGroup: function(){
			var form = Ext.getCmp('groupAddForm');
			if (!form.getForm().isValid()) {
				Ext.Msg.show({
				    title: 'Error al ingresar',
				    msg: 'Los datos del Grupo ingresados no son validos, intentelo nuevamente',
				    icon: Ext.MessageBox.ERROR,
				    buttons: Ext.Msg.OK
					});
				return false;
				}
			var store = Ext.getCmp('groupAdminGrid').getStore();
			var record = new store.recordType(form.getForm().getValues());
			store.add(record);
//			form.getForm().updateRecord(form.groupRecord);
			Ext.getCmp('groupAddWindow').close();
			store.reload();
			}
		}) ]

		}, config);

	Dazzler.admin.groupAddWindow.superclass.constructor.call(this,config);
}

Ext.extend(Dazzler.admin.groupAddWindow, Ext.Window, { });

/* Panel de administracion de Grupo (contenedor) */


Dazzler.admin.groupPanel = function(config){

	var GroupGrid = new Dazzler.admin.groupGrid({
		id: 'groupAdminGrid',
		region:'center',
		title: 'Grupos del sistema',
		onEditGroup: function(){
			var rec = Ext.getCmp('groupAdminGrid').getSelectionModel().getSelected();
	        if (!rec) {
	            return false;
	        }
			var mywin = new Dazzler.admin.groupEditWindow({
				title: 'Modificacion de Grupo', 
				width: 500
				});

			Ext.getCmp('groupEditForm').getForm().loadRecord(rec);
			Ext.getCmp('groupEditForm').groupRecord = rec;

			mywin.show();
			},
		onAddGroup: function(){
			var mywin = new Dazzler.admin.groupAddWindow({
				title: 'Agregar de Grupo', 
				width: 500
				});

			mywin.show();
			},
		onDeleteGroup: function(){
			Ext.MessageBox.confirm('Confirmación', '¿Está seguro que desea eliminar al Grupo seleccionado?' , function(btn){
				if(btn == 'yes'){
					var groupgrid = Ext.getCmp('groupAdminGrid');
					groupgrid.getStore().remove(groupgrid.getSelectionModel().getSelected());
					groupgrid.EdtButton.setDisabled(true);
					groupgrid.DelButton.setDisabled(true);
					}
				});
			}
		});

	config = Ext.apply({
		id: 'groupAdminPanel',
		layout: 'border',
		border: false,
		items: [ GroupGrid ]

		}, config);

	Dazzler.admin.groupPanel.superclass.constructor.call(this,config);
	};

Ext.extend(Dazzler.admin.groupPanel, Ext.Panel, {});
";
}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.admin.groupPanel() );
SCV.mainContent.doLayout();
";

}

function DirectRead($DB, $Data){
$out = array();
$out['groups'] = array();

$DB->Consulta("select id, nombre from grupos order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

while($t = $DB->SacaTupla(false)){
	$out['groups'][] = $t;
	}

foreach($out['groups'] as $k => $grupo){
		$out['groups'][$k]['usuarios'] = $DB->Consulta("select uid from gusuarios where gid = {$grupo['id']};");
		$out['groups'][$k]['contenido'] = $DB->Consulta("select cid from gcontenido where gid = {$grupo['id']};");
		}
$out['success'] = true;

return $out;

}

function DirectCreate($DB, $Data){
$out = array();

$DB->Consulta("select nextval('grupos_id_seq'::regclass);");
list($nextid) = $DB->SacaTupla();

$DB->Consulta("insert into grupos( id,nombre ) values($nextid,'{$Data->groups->nombre}');");
if($DB->Estado){
	$out['success'] = true;
	$out['groups'] =  array('id'=>$nextid, 'nombre'=>$Data->groups->nombre );
	}
else{
	$out['success'] = false;
	$out['groups'] = array();
	$out['msg'] = "Error al crear el Grupo, verifique que el nombre no exista y vuelva a intentarlo";
	}
return $out;
}

function DirectUpdate($DB, $Data){
$out = array();
$out['groups'] =  array();

$DB->Consulta("update grupos set nombre='{$Data->groups->nombre}' where id = {$Data->groups->id}");

if($DB->Estado){
	$out['success'] = true;
	$out['groups'] =  array('id'=>$Data->groups->id, 'nombre'=>$Data->groups->nombre );
	}
else{
	$out['success'] = false;
	$out['msg'] = "Error al actualizar el Grupo.";
	}

return $out;
}

function DirectDestroy($DB, $Data){
$out = array();
$out['groups'] =  array();
$out['success'] = true;

$DB->Consulta("delete from grupos where id = {$Data->groups};");

if(!$DB->Estado){
	$out['success'] = false;
	$out['msg'] = "Error al eliminar el grupo.";
	}

return $out;
}

