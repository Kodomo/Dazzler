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
/* Panel administracion de usuarios */

Dazzler.admin.userData = function(config){
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
            root: 'users',
            totalProperty: 'totalCount',
            idProperty: 'id',
			messageProperty: 'msg',
			fields: ['id','login','clave', 'nombre', 'correo', {name: 'activo', type: 'boolean' }]
        }),
		writer: new Ext.data.JsonWriter({
				encode: false, writeAllFields: true
				}),

		baseParams: {xid: %xid%},
		remoteSort: true,
        sortInfo: {field: 'id', direction: 'ASC'},
        autoLoad: {params:{start: 0, limit: 25}}
		}, config);

	Dazzler.admin.userData.superclass.constructor.call(this,config);
	};

Ext.extend(Dazzler.admin.userData, Ext.data.Store, {});

Dazzler.admin.userGrid = function(config){
	this.ds = new Dazzler.admin.userData({id:'storeAdminUser'});
	this.msm = new Ext.grid.RowSelectionModel( {	singleSelect:true });

	this.onAddUser = config.onAddUser ? config.onAddUser : function(){},
	this.onEditUser = config.onEditUser ? config.onEditUser : function(){},
	this.onDeleteUser = config.onDeleteUser ? config.onDeleteUser : function(){},

	config = Ext.apply({
		store: this.ds,
        colModel: new Ext.grid.ColumnModel({
			defaults: { sortable: true },
			columns: [
				{ dataIndex: 'id'   , width: 60, header: 'Id' },
				{ dataIndex: 'login' , width: 150, header: 'Login' },
				{ dataIndex: 'nombre', header: 'Nombre' },
				{ dataIndex: 'correo', header: 'Correo electronico'},
				{ dataIndex: 'activo', width: 80, header: 'Estado', xtype: 'booleancolumn', falseText: 'Desactivada', trueText: 'Activada', align: 'center', width: 50} ]
        	}),
		viewConfig: {forceFit: true },
		sm: this.msm,
		loadMask: {msg:'Cargando datos...'},

		tbar: [{
			text: 'Agregar usuario',
			iconCls: Ext.ux.TDGi.iconMgr.getIcon('user_add'),
			handler: this.onAddUser
			} , '->', {
			text: 'Editar Usuario',
			ref: '../EdtButton',
			iconCls: Ext.ux.TDGi.iconMgr.getIcon('user_edit'),
			disabled: true,
			handler: this.onEditUser
			} , '-', {
			text: 'Quitar Usuario',
			ref: '../DelButton',
			iconCls: Ext.ux.TDGi.iconMgr.getIcon('user_delete'),
			disabled: true,
			handler: this.onDeleteUser
			} ],

        bbar: new Ext.PagingToolbar({
            pageSize: 25,
            store: this.ds,
            displayInfo: true,
            displayMsg: 'Mostrando usuarios {0} al {1} de {2}',
            emptyMsg: 'No existen usuarios'
	        })
		}, config);

	Dazzler.admin.userGrid.superclass.constructor.call(this,config);

	this.msm.on('rowselect', 
		function(sm){
			var SelUserId = this.getSelectionModel().getSelected().get('id');
			this.EdtButton.setDisabled(false);
			this.DelButton.setDisabled(false);
			Ext.getCmp('userAdminGroups').setDisabled(false);

			Ext.getCmp('userGroupGrid').getStore().load({params:{'userid':SelUserId,start: 0, limit: 25}});
			Ext.getCmp('comboGroup').getStore().load({params:{'userid':SelUserId}});
			Ext.getCmp('btnQuitarGrupo').setDisabled(true);
			Ext.getCmp('btnAgregarGrupo').setDisabled(true);
		} , this);

	this.msm.on('rowdeselect', 
		function(sm){
			Ext.getCmp('userAdminGrid').EdtButton.setDisabled(true);
			Ext.getCmp('userAdminGrid').DelButton.setDisabled(true);
			Ext.getCmp('userAdminGroups').setDisabled(true);
		} , this)

	};

Ext.extend(Dazzler.admin.userGrid, Ext.grid.GridPanel, {
/*
	onAdd : function(){},//funciones auxiliares para comunicarse con los otros paneles.
	onEdit : function(){},
	onDelete : function(){}
*/
});


Dazzler.admin.userEditForm = function(config){
// funciones auxiliares para comunicarse con los otros paneles.

	this.onSaveUser = config.onSaveUser ? config.onSaveUser : function() {},
	this.onBackToGrid = config.onBackToGrid ? config.onBackToGrid : function() {},
	this.userRecord = null,

	config = Ext.apply({
		frame: true,
		items: [{
			xtype:'fieldset',
			title: 'Datos de usuario',
			defaultType: 'textfield',
			labelWidth: 150,
			anchor: '99%',
			defaults: {anchor: '90%'},
			items: [
	//			{ name: 'uid'   , header: 'Id' },
				{ name: 'login' , fieldLabel: 'Login', allowBlank: false },
				{ name: 'nombre', fieldLabel: 'Nombre', allowBlank: false },
				{ name: 'clave', fieldLabel: 'Clave', allowBlank: false, 
					inputType: 'password',
					minLengthText: 'La clave debe tener de 6 a 20 caracteres',
					minLength: 6,
					maxLengthText: 'La clave debe tener de 6 a 20 caracteres',
					maxLength: 20 },
				{ name: 'correo', fieldLabel: 'Correo electronico', allowBlank: false, vtype: 'email'},
				{ name: 'activo', fieldLabel: 'Cuenta activa', xtype: 'checkbox'} ]
			}],
		buttons: [{ text: 'Guardar', iconCls: Ext.ux.TDGi.iconMgr.getIcon('disk'), handler: this.onSaveUser },
				  { text: 'Volver', iconCls: Ext.ux.TDGi.iconMgr.getIcon('bullet_left'), handler: this.onBackToGrid }]

		}, config);

	Dazzler.admin.userEditForm.superclass.constructor.call(this,config);
	};
Ext.extend(Dazzler.admin.userEditForm, Ext.FormPanel, { });

/* Window container of the form */
Dazzler.admin.userEditWindow = function(config){

	config = Ext.apply({
		id: 'userEditWindow',
		closable: false, 
		resizable: false, 
		modal: true,
		closable: false,
		resizable: false,
		items: [ new Dazzler.admin.userEditForm({
		id: 'userEditForm',
		
		onBackToGrid: function(){
			Ext.getCmp('userEditWindow').close();
			},
		onSaveUser: function(){
			var form = Ext.getCmp('userEditForm');
			if (!form.getForm().isValid()) {
				Ext.Msg.show({
				    title: 'Error al modificar',
				    msg: 'Los datos ingresados no son validos, intentelo nuevamente',
				    icon: Ext.MessageBox.ERROR,
				    buttons: Ext.Msg.OK
					});
				return false;
				}
			form.getForm().updateRecord(form.userRecord);
			Ext.getCmp('userEditWindow').close();
			}
		}) ]

		}, config);

	Dazzler.admin.userEditWindow.superclass.constructor.call(this,config);
}

Ext.extend(Dazzler.admin.userEditWindow, Ext.Window, { });

/* Window container of the form */
Dazzler.admin.userAddWindow = function(config){

	config = Ext.apply({
		id: 'userAddWindow',
		closable: false, 
		resizable: false, 
		modal: true,
		items: [ new Dazzler.admin.userEditForm({
		id: 'userAddForm',
		
		onBackToGrid: function(){
			Ext.getCmp('userAddWindow').close();
			},
		onSaveUser: function(){
			var form = Ext.getCmp('userAddForm');
			if (!form.getForm().isValid()) {
				Ext.Msg.show({
				    title: 'Error al ingresar',
				    msg: 'Los datos del usuario ingresados no son validos, intentelo nuevamente',
				    icon: Ext.MessageBox.ERROR,
				    buttons: Ext.Msg.OK
					});
				return false;
				}
			var store = Ext.getCmp('userAdminGrid').getStore();
			var record = new store.recordType(form.getForm().getValues());
			store.add(record);
//			form.getForm().updateRecord(form.userRecord);
			Ext.getCmp('userAddWindow').close();
			store.reload();
			}
		}) ]

		}, config);

	Dazzler.admin.userAddWindow.superclass.constructor.call(this,config);
}

Ext.extend(Dazzler.admin.userAddWindow, Ext.Window, { });

/* Panel de administracion de usuario (contenedor) */

Dazzler.admin.userGroups = function(config){

	var userAddGroup = new Ext.FormPanel({
			id: 'userAddGroup',
			region:'north',
			frame:true,
			height:120,
			labelWidth: 45,
			items:[{
				xtype: 'fieldset',
				title: 'Agregar grupos',
				items: [{
					id: 'comboGroup',
					xtype: 'combo',
					fieldLabel: 'Grupos',
					name: 'grupos',
					store: new Ext.data.Store({
							id: 'groupComboStore',
							proxy: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
							reader: new Ext.data.JsonReader({
								root: 'groups',
								totalProperty: 'totalCount',
								idProperty: 'id',
								messageProperty: 'msg',
								fields: ['id', 'nombre']
							}),
							baseParams: {'xid': %xid%, 'customFn': 'userGroupCombo'},
							remoteSort: true,
							sortInfo: {field: 'nombre', direction: 'ASC'}
							}),
					mode: 'local',
					forceSelection: true,
					valueField: 'id',
					displayField: 'nombre',
					editable: false,
					triggerAction: 'all',
					listeners:{
						'select': function(){
							Ext.getCmp('btnAgregarGrupo').setDisabled(false);
						}
					}
					 }],
				buttons: [{ 
					id: 'btnAgregarGrupo',
					text: 'Agregar',
					iconCls: Ext.ux.TDGi.iconMgr.getIcon('add'),
					handler: function(){
						Ext.getCmp('userAdminGroups').getEl().mask('Eliminando...','ext-el-mask-msg x-mask-loading');
						var SelUserId = Ext.getCmp('userAdminGrid').getSelectionModel().getSelected().get('id');
						var SelGroupId = Ext.getCmp('comboGroup').getValue();
						Ext.getCmp('comboGroup').clearValue();
						Ext.getCmp('btnQuitarGrupo').setDisabled(true);
						Ext.getCmp('btnAgregarGrupo').setDisabled(true);
						Dazzler.api.customFn({'xid': %xid%, 'customFn': 'addUserGroup', 'userid':SelUserId, 'groupid':SelGroupId, },function(){
							Ext.getCmp('userGroupGrid').getStore().load({params:{'userid':SelUserId,start: 0, limit: 25}});
							Ext.getCmp('comboGroup').getStore().load({params:{'userid':SelUserId}});
							Ext.getCmp('userAdminGroups').getEl().unmask();
							});
						}
					}]
				}]
			});

	var userGroupStore = new Ext.data.Store({
		    proxy: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
					reader: new Ext.data.JsonReader({
						root: 'groups',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'nombre']
					}),
					writer: new Ext.data.JsonWriter({
							encode: false, writeAllFields: true
							}),
					baseParams: {'xid': %xid%, 'customFn': 'userGroupGrid'},
					remoteSort: true,
					sortInfo: {field: 'nombre', direction: 'ASC'}
					});

	var userGroupGrid = new Ext.grid.GridPanel({
			id: 'userGroupGrid',
		    border:'false',
			region:'center',

			store: userGroupStore,

		    colModel: new Ext.grid.ColumnModel({
				defaults: { sortable: true },
				columns: [
					{ dataIndex: 'id'   , width: 60, header: 'Id' },
					{ dataIndex: 'nombre', header: 'Nombre' } ]
		    	}),

			viewConfig: {forceFit: true },
			sm: new Ext.grid.RowSelectionModel( {
					singleSelect:true,
					listeners:{
						'rowselect': function(){
							Ext.getCmp('btnQuitarGrupo').setDisabled(false);
							}
						}
					 } ),
			loadMask: {msg:'Cargando datos...'},

		    bbar: new Ext.PagingToolbar({
		        pageSize: 25,
		        store: userGroupStore,
		        displayInfo: true,
		        displayMsg: 'Mostrando grupos {0} al {1} de {2}',
		        emptyMsg: 'No existen grupos'
			    }),

			tbar: [{ 
				id:'btnQuitarGrupo',
				text: 'Quitar',
				iconCls: Ext.ux.TDGi.iconMgr.getIcon('delete'),
				disabled: true,
				handler: function(){
					Ext.getCmp('userAdminGroups').getEl().mask('Eliminando...','ext-el-mask-msg x-mask-loading');
					var SelUserId = Ext.getCmp('userAdminGrid').getSelectionModel().getSelected().get('id');
					var SelGroupId = Ext.getCmp('userGroupGrid').getSelectionModel().getSelected().get('id');
					Ext.getCmp('comboGroup').clearValue();
					Ext.getCmp('btnQuitarGrupo').setDisabled(true);
					Ext.getCmp('btnAgregarGrupo').setDisabled(true);
					Dazzler.api.customFn({'xid': %xid%, 'customFn': 'delUserGroup', 'userid':SelUserId, 'groupid':SelGroupId, },function(){
						Ext.getCmp('userGroupGrid').getStore().load({params:{'userid':SelUserId,start: 0, limit: 25}});
						Ext.getCmp('comboGroup').getStore().load({params:{'userid':SelUserId}});
						Ext.getCmp('userAdminGroups').getEl().unmask();
						});

					} }]
			});

	config = Ext.apply({
		layout: 'border',
		width: 300,
		collapsible: true,
		id: 'userAdminGroups',
		disabled: true,
		items : [userAddGroup, userGroupGrid]
		}, config);
	Dazzler.admin.userGroups.superclass.constructor.call(this,config);
}
Ext.extend(Dazzler.admin.userGroups, Ext.Panel, { });


Dazzler.admin.userPanel = function(config){

	var UserGrid = new Dazzler.admin.userGrid({
		id: 'userAdminGrid',
		region:'center',
		title: 'Usuarios del sistema',
		onEditUser: function(){
			var rec = Ext.getCmp('userAdminGrid').getSelectionModel().getSelected();
	        if (!rec) {
	            return false;
	        }
			var mywin = new Dazzler.admin.userEditWindow({
				title: 'Modificacion de usuario', 
				width: 500
				});

			Ext.getCmp('userEditForm').getForm().loadRecord(rec);
			Ext.getCmp('userEditForm').userRecord = rec;

			mywin.show();
			},
		onAddUser: function(){
			var mywin = new Dazzler.admin.userAddWindow({
				title: 'Agregar de usuario', 
				width: 500
				});

			mywin.show();
			},
		onDeleteUser: function(){
			Ext.MessageBox.confirm('Confirmación', '¿Está seguro que desea eliminar al usuario seleccionado?' , function(btn){
				if(btn == 'yes'){
					var usergrid = Ext.getCmp('userAdminGrid');
					usergrid.getStore().remove(usergrid.getSelectionModel().getSelected());
					usergrid.EdtButton.setDisabled(true);
					usergrid.DelButton.setDisabled(true);
					}
				});
			}
		});

	var UserGroup = new Dazzler.admin.userGroups({region:'east',title: 'Grupos del usuario'});

	config = Ext.apply({
		id: 'userAdminPanel',
		layout: 'border',
		border: false,
		items: [ UserGrid, UserGroup ]

		}, config);

	Dazzler.admin.userPanel.superclass.constructor.call(this,config);
	};

Ext.extend(Dazzler.admin.userPanel, Ext.Panel, {});
";
}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.admin.userPanel() );
SCV.mainContent.doLayout();
";

}

function DirectRead($DB, $Data){
$out = array();
$out['users'] = array();

$DB->Consulta("select id, login, clave, activo, nombre, correo from usuarios order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

while($t = $DB->SacaTupla(false)){
	$out['users'][] = $t;
	}
$out['success'] = true;

return $out;

}

function DirectCreate($DB, $Data){
$out = array();
$Esc = $DB->EscapeObject($Data->users,array('login','clave','nombre','correo'));

if($Data->users->activo == 'on')
	$activo = 1;
else
	$activo = 0;

$DB->Consulta("insert into usuarios( login, clave, activo, nombre, correo) values('{$Esc['login']}','{$Esc['clave']}',$activo,'{$Esc['nombre']}','{$Esc['correo']}');");
if($DB->Estado){
	$out['success'] = true;
	$out['users'] =  array('id'=>$DB->UltimoId, 'activo'=>$activo,'login'=>$Data->users->login,'clave'=>$Data->users->clave,'nombre'=>$Data->users->nombre,'correo'=>$Data->users->correo );
	}
else{
	$out['success'] = false;
	$out['users'] = array();
	$out['msg'] = "Error al crear el usuario, verifique que el login no exista y vuelva a intentarlo";
	}
return $out;
}

function DirectUpdate($DB, $Data){
$out = array();
$out['users'] =  array();
$Esc = $DB->EscapeObject($Data->users,array('login','clave','nombre','correo'));

if($Data->users->activo)
	$activo = 1;
else
	$activo = 0;

$DB->Consulta("update usuarios set login='{$Esc['login']}', clave='{$Esc['clave']}', correo='{$Esc['correo']}', nombre='{$Esc['nombre']}', activo=$activo where id = {$Data->users->id}");

if($DB->Estado){
	$out['success'] = true;
	$out['users'] =  array('id'=>$Data->users->id, 'activo'=>$activo,'login'=>$Data->users->login,'clave'=>$Data->users->clave,'nombre'=>$Data->users->nombre,'correo'=>$Data->users->correo );
	}
else{
	$out['success'] = false;
	$out['msg'] = "Error al actualizar el usuario.";
	}

return $out;
}

function DirectDestroy($DB, $Data){
$out = array();
$out['users'] =  array();
$out['success'] = true;

$DB->Consulta("delete from usuarios where id = {$Data->users};");

if(!$DB->Estado){
	$out['success'] = false;
	$out['msg'] = "Error al eliminar el usuario.";
	}

return $out;
}

function userGroupGrid($DB, $Data){
$out = array();
$out['groups'] = array();

$DB->Consulta("select grupos.id, grupos.nombre from (gusuarios
		left join grupos on (gusuarios.gid = grupos.id))
	    where gusuarios.uid = {$Data->userid} order by grupos.{$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");
if(!$DB->Estado){
	$out['success'] = false;
	$out['msg'] = $DB->Error_debug;
	}
else{
	while($t = $DB->SacaTupla(false)){
		$out['groups'][] = $t;
		}
	$out['success'] = true;
	}
return $out;
}

function userGroupCombo($DB, $Data){
$out = array();
$out['groups'] = array();

$DB->Consulta("select id, nombre from grupos where id not in (select gid from gusuarios where uid = {$Data->userid}) order by {$Data->sort} {$Data->dir};");

while($t = $DB->SacaTupla(false)){
	$out['groups'][] = $t;
	}
$out['success'] = true;

return $out;
}

function delUserGroup($DB, $Data){
$out = array();

$DB->Consulta("delete from gusuarios where uid={$Data->userid} and gid={$Data->groupid};");

if(!$DB->Estado){
	$out['success'] = false;
	}
else{
	$out['success'] = true;
	}

return $out;
}

function addUserGroup($DB, $Data){
$out = array();

$DB->Consulta("insert into gusuarios(uid,gid) values({$Data->userid},{$Data->groupid});");

if(!$DB->Estado){
	$out['success'] = false;
	}
else{
	$out['success'] = true;
	}

return $out;
}
