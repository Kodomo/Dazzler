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
Ext.ns('Dazzler.proveedor');
/* Panel administracion de grupos de maquinas */

Dazzler.proveedor.groupAdminPanel = Ext.extend(Ext.Container, {
	constructor: function(config){

	/* custom Stores for Forms Combo */
		this.projectsStore = new Ext.data.Store({
			ref			: 'ProjectsStore',
			proxy		: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
			reader		: new Ext.data.JsonReader({
						root: 'root',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'nombre']
						}),
			baseParams	: {'xid': %xid%, 'customFn': 'projectCombo'},
			remoteSort	: true,
			sortInfo	: {field: 'nombre', direction: 'ASC'}
			});

		this.groupsStore = new Ext.data.Store({
			proxy		: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
			reader		: new Ext.data.JsonReader({
						root: 'root',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'nombre']
						}),
			baseParams	: {'xid': %xid%, 'customFn': 'groupCombo'},
			remoteSort	: true,
			sortInfo	: {field: 'nombre', direction: 'ASC'}
			});
	/* Creacion de paneles */
		this.infoForm = new Ext.FormPanel({
		    frame			: true, 
		    title			:'Resumen', 
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('information'),
		    defaultType		:'displayfield',
			baseParams		: {xid: %xid%, 'form': 'info'},
			api				: {load: Dazzler.api.loadForm },
			paramsAsHash	: true,
			items			: this.buildInfoForm()
		});

		this.preferencesForm = new Ext.FormPanel({
		    frame			: true, 
		    title			:'Preferencias', 
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('application_form_edit'),
		    defaultType		:'displayfield',
			labelWidth		: 180,
			baseParams		: {xid: %xid%, 'form': 'pref'},
			api				: {load: Dazzler.api.loadForm, submit: Dazzler.api.submitForm },
			monitorValid	: true,
			paramsAsHash	: true,
			items			: this.buildPreferencesForm(),
			buttons			: this.buildPreferencesButtons()
		});

		this.hostGrid = new Ext.ux.crudGridPanel.cruPagingGrid({

			defaultDesc		: 'hosts',
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('computer'),
			title			: 'Equipos (hosts)',
			baseParams		: {xid: %xid%, 'store': 'hosts'},
			defaulPageSize	: 25,
			configStore		: { buildFields: this.buildStoreHosts, autoLoad: false, sortInfo	: {field: 'name', direction: 'ASC'} },
			configForm		: {
								items		: this.buildFormHosts(),
								labelWidth	: 80,
								height		: 150,
								width		: 400
								},
			buildColumns	: this.buildColumnsHosts,
			editIconCls		: Ext.ux.TDGi.iconMgr.getIcon('computer_edit'),

			editButtonText	: 'Cambiar de grupo',
			/* custom tbar, only for moving the host to other groups */
			buildTbar: function(){
				return [  '->', {
					text	: this.editButtonText,
					ref		: '../editBtn',
					iconCls	: this.editIconCls,
					disabled: true,
					scope	: this,
					handler	: this.onEdit
					} ];
				}
		});

		this.projectGrid = new Ext.ux.crudGridPanel.crudPagingGrid({
			defaultDesc		: 'proyectos',
			title			: 'Proyectos',
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('world'),
			baseParams		: {xid: %xid%, 'store': 'projects' },
			defaulPageSize	: 25,
			configStore		: { buildFields: this.buildStoreProject, autoLoad: false, sortInfo	: {field: 'name', direction: 'ASC'} },
			configForm		: {
								items		: this.buildFormProject(),
								labelWidth	: 150,
								height		: 150,
								width		: 400
								},
			configEditForm		: {
								items		: this.buildFormEditProject(),
								labelWidth	: 150,
								height		: 150,
								width		: 400
								},
			buildColumns	: this.buildColumnsProject,
			doDeleteProject	: this.doDeleteProject,
			onDelete		: this.onDeleteProject,

			addIconCls		: Ext.ux.TDGi.iconMgr.getIcon('world_add'),
			editIconCls		: Ext.ux.TDGi.iconMgr.getIcon('world_edit'),
			deleteIconCls	: Ext.ux.TDGi.iconMgr.getIcon('world_delete'),
			addButtonText	: 'Nuevo proyecto',
			editButtonText	: 'Editar proyecto',
			deleteButtonText: 'Eliminar proyecto',

			deleteMsg		: ''
		});

		this.groupGrid = new Ext.ux.crudGridPanel.crudPagingGrid({
			region:'west',
			width: 300,
			collapsible: false,

			defaultDesc		: 'grupos',
			title			: 'Grupos de Máquinas (Granjas)',
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('server'),
			baseParams		: {xid: %xid%, 'store': 'groups'},
			defaulPageSize	: 25,
			configStore		: { buildFields: this.buildStoreGroup,  sortInfo	: {field: 'id', direction: 'ASC'} },
			configForm		: {
								items		: this.buildFormGroup(),
								labelWidth	: 80,
								height		: 150,
								width		: 400
								},
			buildColumns	: this.buildColumnsGroup,

			addIconCls		: Ext.ux.TDGi.iconMgr.getIcon('server_add'),
			editIconCls		: Ext.ux.TDGi.iconMgr.getIcon('server_edit'),
			deleteIconCls	: Ext.ux.TDGi.iconMgr.getIcon('server_delete'),
			addButtonText	: 'Nuevo grupo',
			editButtonText	: 'Editar grupo',
			deleteButtonText: 'Eliminar grupo',

			deleteMsg		: 'Debe quitar todos los host existentes antes de realizar esta operación. ¿Está seguro que desea continuar con la eliminación el grupo?'


		});

		this.tabPanel = new Ext.TabPanel({
			activeTab: 0,
			plain:true,
			region:'center',
			items: [ this.infoForm, this.hostGrid, this.preferencesForm, this.projectGrid ]
		});

		config = Ext.apply({
			layout: 'border',
			border: false,
			items: [ this.groupGrid, this.tabPanel ]

			}, config);

		Dazzler.proveedor.groupAdminPanel.superclass.constructor.call(this,config);

		this.projectGrid.store.on('save',this.onUpdateProjects,this);
		this.hostGrid.store.on('update',this.onUpdateHosts,this);

		this.groupGrid.on('rowselect',this.onSelectGroup,this);

		this.groupGrid.store.on('datachanged',this.onViewReady,this);

	},
/* ************************* configuracion de los diferentes Stores ************************* */
	/* Group Grid Store definition */
	buildStoreGroup: function(){
		return ['id', 'name', 'info'];
		},
	/* Project Grid Store definition */
	buildStoreProject: function(){
		return ['id', 'name', 'url', 'resource_share', {name: 'suspend', type: 'boolean'}, {name: 'detach_when_done', type: 'boolean'} ];
		},
	/* Hosts Grid Store definition */
	buildStoreHosts: function(){
		return ['id', 'gid', 'name', 'ipaddr', 'cpus', 'mips', 'flops', 'last', 'hits' ];
		},


/* ************************* Configuracion de los diferentes Grid Columns ************************* */
	/* Group Grid Columns definition */
	buildColumnsGroup: function(){
		return  [{ dataIndex: 'name', header: 'Nombre'},
				{ dataIndex: 'info', header: 'Descrip'}	];
		},
	/* Project Grid Columns definition */
	buildColumnsProject: function(){
		return  [{ dataIndex: 'name', header: 'Nombre'},
				{ dataIndex: 'url', header: 'Url'},
				{ dataIndex: 'resource_share', header: 'Prioridad'},
				{ dataIndex: 'detach_when_done', header: 'Estado', renderer: function (value, metaData, record){
				var img;
				if(record.get('suspend'))
					img = '<div><img src=\"{$IconsURL}/world_night.png\" width=\"16\" height=\"16\" class=\"typeImg\"></div>';
				else if(record.get('detach_when_done'))
					img = '<div><img src=\"{$IconsURL}/world_dawn.png\" width=\"16\" height=\"16\" class=\"typeImg\"></div>';
				else
					img = '<div><img src=\"{$IconsURL}/world.png\" width=\"16\" height=\"16\" class=\"typeImg\"></div>';
				return img;
				}}	];
		},
	buildColumnsHosts: function(){
		return  [{ dataIndex: 'name', header: 'Nombre'},
				{ dataIndex: 'cpus', header: 'N° CPU'},
				{ dataIndex: 'mips', header: 'MIPS'},
				{ dataIndex: 'flops', header: 'Flops'},
				{ dataIndex: 'ipaddr', header: 'Ip'},
				{ dataIndex: 'hits', header: 'Contactos'},
				{ dataIndex: 'last', header: 'Último contacto'}	];
		},

/* ************************* Configuracion de los diferentes Grid Forms ************************* */
	buildFormGroup: function(){
		return [{ name: 'name', fieldLabel: 'Nombre', allowBlank: false },
				{ name: 'info', fieldLabel: 'Descripción', allowBlank: false } 	];
		},
	buildFormProject: function(){

		return [{ name: 'name', fieldLabel: 'Proyecto', xtype:'combo', allowBlank: false, store: this.projectsStore, mode: 'local',forceSelection: true, hiddenName: 'id',valueField: 'id',displayField: 'nombre',  triggerAction: 'all' },
				{ xtype: 'numberfield', name: 'resource_share', fieldLabel: 'Prioridad', maxValue: 1000,minValue: 0,allowDecimals: false },
				{ xtype: 'checkbox', name: 'suspend', fieldLabel: 'Pausado' },
				{ xtype: 'checkbox', name: 'detach_when_done', fieldLabel: 'Marcado para eliminación' } ];
		},
	buildFormEditProject: function(){
		return [{ xtype: 'displayfield', name: 'name', fieldLabel: 'Proyecto' },
				{ xtype: 'numberfield', name: 'resource_share', fieldLabel: 'Prioridad', maxValue: 1000,minValue: 0,allowDecimals: false },
				{ xtype: 'checkbox', name: 'suspend', fieldLabel: 'Pausado' },
				{ xtype: 'checkbox', name: 'detach_when_done', fieldLabel: 'Marcado para eliminación' } ];
		},

	buildFormHosts: function(){
		return [{ name: 'group', fieldLabel: 'Grupo', xtype:'combo', allowBlank: false, store: this.groupsStore, mode: 'local',forceSelection: true, hiddenName: 'gid',valueField: 'id',displayField: 'nombre',  triggerAction: 'all' } ];
		},
/* ************************* Configuracion de los otros Forms ************************* */
	buildInfoForm: function(){
		return [{
		        fieldLabel:'Nombre', 
		        name:'name'
			    },{ 
		        fieldLabel:'Descripción', 
		        name:'info'
			    },{ 
		        fieldLabel:'Equipos', 
		        name:'hosts'
			    },{ 
		        fieldLabel:'Proyectos', 
		        name:'projects'
			    },{ 
		        fieldLabel:'Procesadores', 
		        name:'proc'
			    },{ 
		        fieldLabel:'MIPS', 
		        name:'mips'
			    },{ 
		        fieldLabel:'Flops', 
		        name:'flops'
				}];
		},
	buildPreferencesForm: function(){
		return[{
				xtype:'fieldset',
				title: 'Preferencias del grupo',
				autoHeight:true,
				items: [{
						xtype: 'hidden',
						name: 'id'
					},{
						xtype: 'displayfield',
						fieldLabel: 'Última modificación',
						name: 'mod_time'
					},{
						xtype: 'checkbox',
						fieldLabel: 'Funcionar siempre',
						name: 'run_if_user_active'
					},{
						xtype: 'compositefield',
						fieldLabel: 'Horario de funcionamiento',
						items: [{
							xtype: 'timefield',
							format: 'H:i',
							width: 100,
							name: 'start_hour'
							},{
							xtype: 'timefield',
							width: 100,
							format: 'H:i',
							name: 'end_hour'
							}]
					},{
						xtype: 'compositefield',
						fieldLabel: 'Uso máximo de cpu',
						items: [{
							xtype: 'numberfield',
							name: 'cpu_usage_limit',
							width: 60,
							maxValue: 100,
							minValue: 1,
							invalidText: 'Debe ingresar un numero entre 1 y 100',
							allowDecimals: false
							},{
							xtype: 'displayfield',
							value: '%'
							}]
					},{
						xtype: 'compositefield',
						fieldLabel: 'Iniciar si esta inactivo',
						items: [{
							xtype: 'numberfield',
							name: 'idle_time_to_run',
							width: 60,
							maxValue: 60,
							minValue: 1,
							invalidText: 'Debe ingresar un numero entre 1 y 60',
							allowDecimals: false
							},{
							xtype: 'displayfield',
							value: 'minutos'
							}]

					}]
			},{
				xtype: 'buttongroup',
				columns: 3,
				width: 400,
				height: 50,
				title: 'Configuraciones predefinidas',
				items: [{
						text: 'Sin restricciones',
						iconCls: Ext.ux.TDGi.iconMgr.getIcon('play_green'),
						handler: this.prefAllways,
						scope: 	this
						},{
						text: 'Usar solo si está inactivo',
						iconCls: Ext.ux.TDGi.iconMgr.getIcon('computer_off'),
						handler: this.prefInactive,
						scope: 	this
						},{
						text: 'Recuros limitados',
						iconCls: Ext.ux.TDGi.iconMgr.getIcon('play_blue'),
						handler: this.prefLimit,
						scope: 	this
						}]
				}];
		},
/* ************************* preference pre-settings ************************* */
	prefAllways: function(){
		this.preferencesForm.getForm().setValues({
			 run_if_user_active: 1, 
			 start_hour:'00:00', 
			 end_hour:'00:00', 
			 cpu_usage_limit: 100, 
			 idle_time_to_run: 1 
			});
		},
	prefInactive: function(){
		this.preferencesForm.getForm().setValues({
			 run_if_user_active: 0, 
			 start_hour:'00:00', 
			 end_hour:'00:00', 
			 cpu_usage_limit: 100, 
			 idle_time_to_run: 5 
			});
		},
	prefLimit: function(){
		this.preferencesForm.getForm().setValues({
			 run_if_user_active: 1, 
			 start_hour:'00:00', 
			 end_hour:'00:00', 
			 cpu_usage_limit: 75, 
			 idle_time_to_run: 1 
			});
		},

/* ************************* preference controls ************************* */
	buildPreferencesButtons: function(){
		return [{
		            text:'Deshacer cambios',
					iconCls: Ext.ux.TDGi.iconMgr.getIcon('arrow_undo'),
		            formBind: true,	 
					scope: this,
		            handler: this.undoPrefs
				},{
		            text:'Guardar',
					iconCls: Ext.ux.TDGi.iconMgr.getIcon('disk'),
		            formBind: true,	 
					scope: this,
		            handler: this.savePrefs
				}];
		},

	savePrefs: function(){
		var GroupId = this.groupGrid.getSelectionModel().getSelected().get('id');
		this.preferencesForm.getForm().submit({ 
                waitTitle:'Guardando Preferencias', 
                waitMsg:'Enviando...',
				params: {'gid': GroupId},
                success:function(form, action){
	                form.load({params: {'gid': GroupId}});
                	},
                failure:function(form, action){
	                Ext.Msg.alert('Error', 'Se produjo un error al enviar las preferencias.'); 
                	}
	            });
		},
	undoPrefs: function(){
		var GroupId = this.groupGrid.getSelectionModel().getSelected().get('id');
		this.preferencesForm.getForm().load({params: {'gid': GroupId}});
		},

/* ************************* custom project deletion ************************* */
	onDeleteProject: function(){
		Ext.MessageBox.show({
			closable: false,
			title	: 'Confirmacion',
			msg		: 'Desea eliminar el projecto de inmediato?\\nYes: Lo elimina de inmediato\\nNo: Espera que termine los trabajos actuales y elimina.\\nCancel: Cancela la operaci&oacute;n y vuelve al menu.' ,
			buttons: Ext.MessageBox.YESNOCANCEL,
			fn		: this.doDeleteProject,
			scope	: this
			});
		},
	doDeleteProject: function(Button){
		if(Button == 'yes'){
			this.store.remove(this.selModel.getSelected());

			/* Call method to disable buttons (now no row is selected)*/
			this.onRowDeselect(this.selModel);
			}
		else if(Button == 'no'){
			this.selModel.getSelected().set('detach_when_done',1);
			}
		},

/* ************************* event on Group Select ************************* */
	onUpdateProjects: function(){
		this.projectsStore.reload({});
		},
	onUpdateHosts: function(){
		this.hostGrid.store.reload({});
		},
	onSelectGroup: function(SelectionModel){
		var GroupId = SelectionModel.getSelected().get('id');
		if(GroupId){
			this.projectGrid.store.setBaseParam('gid',GroupId);
			this.hostGrid.store.setBaseParam('gid',GroupId);
			this.projectsStore.setBaseParam('gid',GroupId);

			this.infoForm.getForm().load({params: {'gid': GroupId}});
			this.preferencesForm.getForm().load({params: {'gid': GroupId}});

			this.projectsStore.reload({});
			this.projectGrid.store.reload({params:{start: 0, limit: 25}});
			this.hostGrid.store.reload({params:{start: 0, limit: 25}});
			}
		},
	onViewReady: function(){
		this.groupGrid.getSelectionModel().selectFirstRow();
		this.groupsStore.reload({});
	}
});
";

}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.proveedor.groupAdminPanel() );
SCV.mainContent.doLayout();
";

}

function DirectRead($DB, $Data){
$out = array();

if($Data->store == 'groups'){
	$out['root'] = array();
	$DB->Consulta("select count(*) from groups where uid = %uid%;");
	$t = $DB->SacaTupla();
	$out['totalCount'] = $t[0];
		
	$DB->Consulta("select id, name, info from groups where uid = %uid% order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

	while($t = $DB->SacaTupla(false)){
		$out['root'][] = $t;
		}
	$out['success'] = true;
	}
else if($Data->store == 'hosts'){
	$out['root'] = array();
	$gid = intval($Data->gid);
	if($gid > 0){
		$DB->Consulta("select count(*) from hosts where gid = $gid;");
		$t = $DB->SacaTupla();
		$out['totalCount'] = $t[0];


		$DB->Consulta("select id, gid, name, ipaddr, cpus, cpus*mips as mips, cpus*flops as flops, last_contact as last, hits from hosts where gid = $gid order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");
		while($t = $DB->SacaTupla(false)){
			$t['ipaddr'] = long2ip(sprintf("%u",$t['ipaddr']));
			$t['last'] = date('d/m/Y H:i', $t['last']);
			$out['root'][] = $t;
			}
		}
	$out['success'] = true;
	}
else if($Data->store == 'projects'){
	$out['root'] = array();
	$gid = intval($Data->gid);
	if($gid > 0){
		$DB->Consulta("select count(*) from configProjects where gid = $gid;");
		$t = $DB->SacaTupla();
		$out['totalCount'] = $t[0];

		$DB->Consulta("select projects.id, name, url, resource_share, suspend, LEAST(detach_when_done,1) as detach_when_done from (configprojects left join projects on (configprojects.pid = projects.id)) where gid = $gid order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

		while($t = $DB->SacaTupla(false)){

			$out['root'][] = $t;
			}
		}
	$out['success'] = true;
	}
return $out;

}

function DirectCreate($DB, $Data){
$out = array();

$out['root'] = array();

if($Data->store == 'groups'){
	$DB->Consulta("select nextval('groups_id_seq'::regclass);");
	list($nextid) = $DB->SacaTupla();

	$Escaped = $DB->EscapeObject($Data->root,array('name','info'));
	
	$now = time()+43200;

	$DB->Consulta("insert into groups( id,uid,name,info,mod_time ) values($nextid,%uid%,'{$Escaped['name']}','{$Escaped['info']}',$now);");

	if($DB->Estado){
		$out['success'] = true;
		$out['root'] =  array('id'=>$nextid, 'name'=>$Data->root->name, 'info'=>$Data->root->info );
		}
	else{
		$out['success'] = false;
		$out['root'] = array();
		$out['msg'] = "Error al crear el Grupo, verifique que el nombre no exista y vuelva a intentarlo";
		}
	}
else if($Data->store == 'projects'){
	$gid = intval($Data->gid);
	if($gid > 0){

		$now = time();
		if($Data->root->suspend)
			$suspend = 1;
		else
			$suspend = 0;

		if($Data->root->detach_when_done)
			$dwd = $now+14*24*3600;
		else
			$dwd = 0;

		$pid = intval($Data->root->id);
		$rs = intval ($Data->root->resource_share);

		$DB->MostrarConsultas = 1;
		$hasAccount = $DB->Consulta("select authenticator from authenticators where pid=$pid and uid=%uid%;");

		$DB->Consulta("begin;");
		if(!$hasAccount)
			$DB->Consulta("insert into authenticators( uid,pid ) values(%uid%,$pid);");


		$DB->Consulta("insert into configprojects( gid,pid,resource_share,suspend,detach_when_done,mod_time ) values( $gid,$pid,$rs,$suspend,$dwd,$now );");
		$DB->Consulta("commit;");
		if($DB->Estado){
			$dwd = $dwd && 1;
			$out['success'] = true;
			$out['root'] =  array('id'=>$pid, 'resource_share'=>$rs, 'suspend'=>$suspend, 'detach_when_done'=>$dwd );
			}
		else{
			$out['success'] = false;
			$out['root'] = array();
			$out['msg'] = "Error al crear el Proyecto";
			}
		}
	}
return $out;
}

function DirectUpdate($DB, $Data){
$out = array();
$out['root'] =  array();

if($Data->store == 'groups'){
	$Escaped = $DB->EscapeObject($Data->root,array('name','info'));
	$gid = intval($Data->root->id);

	$DB->Consulta("update groups set name='{$Escaped['name']}', info='{$Escaped['info']}' where id = $gid");

	if($DB->Estado){
		$out['success'] = true;
		$out['root'] =  array('id'=>$Data->root->id, 'name'=>$Data->root->name, 'info'=>$Data->root->info  );
		}
	else{
		$out['success'] = false;
		$out['msg'] = "Error al actualizar el Grupo.";
		}
	}
else if($Data->store == 'hosts'){

	$hid = intval($Data->root->id);
	$gid = intval($Data->root->gid);
	if(($hid > 0) && ($gid > 0)){
	
		$DB->Consulta("update hosts set gid=$gid where id = $hid");
		$DB->Consulta("select id, gid, name, ipaddr, cpus, cpus*mips as mips, cpus*flops as flops, last_contact as last,hits from hosts where id = $hid;");

		$t = $DB->SacaTupla(false);
		$t['ipaddr'] = long2ip(sprintf("%u",$t['ipaddr']));
		$t['last'] = date('d/m/Y H:i', $t['last']);

		$out['root'][] = $t;
		$out['success'] = true;

		}
	else
		$out['success'] = false;
	}
else if($Data->store == 'projects'){
	$gid = intval($Data->gid);
	if($gid > 0){
		$DB->Consulta("select detach_when_done from configprojects where gid=$gid and pid=$pid;");
		list( $ldwd ) = $DB->SacaTupla();
		$now = time();

		if($Data->root->suspend)				
			$suspend = 1;
		else
			$suspend = 0;

		if($Data->root->detach_when_done){ 
			if($ldwd > 0)
				$dwd = $ldwd;
			else
				$dwd = $now+14*24*3600;
			}
		else
			$dwd = 0;

		$pid = intval($Data->root->id);
		$rs = intval ($Data->root->resource_share);

		$DB->Consulta("update configprojects set resource_share=$rs,suspend=$suspend,detach_when_done=$dwd,mod_time=$now where gid=$gid and pid=$pid;");
		if($DB->Estado){
			$dwd = $dwd && 1;
			$out['success'] = true;
			$out['root'] =  array('id'=>$pid,'name'=>$Data->root->name,'url'=>$Data->root->url, 'resource_share'=>$rs, 'suspend'=>$suspend, 'detach_when_done'=>$dwd );
			}
		else{
			$out['success'] = false;
			$out['root'] = array();
			$out['msg'] = "Error al actualizar proyecto";
			}
		}
	}

return $out;
}

function DirectDestroy($DB, $Data){
$out = array();
if($Data->store == 'groups'){
	$out['root'] =  array();
	$out['success'] = true;

	$Gdel = intval($Data->root);

	$DB->Consulta("select group_default from users where id = %uid%;");
	list( $dg ) = $DB->SacaTupla();

	$greenlight = $DB->Consulta("select id from groups where id=$Gdel and uid = %uid%;");

	if($dg == $Gdel){
		$out['success'] = false;
		$out['msg'] = "No se puede elimitar el grupo.";
		}
	else if($greenlight){
		$DB->Consulta("delete from groups where gid = $Gdel;");
		if(!$DB->Estado){
			$out['success'] = false;
			$out['msg'] = "Error al eliminar el grupo, debe vaciarlo antes de borrarlo.";
			}
		}
	else {
		$out['success'] = false;
		$out['msg'] = "Error de permisos.";
		}
	}
else if($Data->store == 'projects'){
	$gid = intval($Data->gid);
	if($gid > 0){
		$greenlight = $DB->Consulta("select id from groups where id=$gid and uid = %uid%;");
		if($greenlight){
			$pid = intval($Data->root);
			$DB->Consulta("delete from configprojects where gid=$gid and pid=$pid;");
			}
		else {
			$out['success'] = false;
			$out['msg'] = "Error de permisos.";
			}
		}
	}
return $out;
}

function submitForm($DB, $Data){
$out = array();

$id = intval($Data['id']);
$gid = intval($Data['gid']);

if(($id == 0) || ($gid == 0) || ($id != $gid)){
	$out['success'] = false;
	}
else{
	$now = time();

	list($horaStr, $minutosStr) = explode(':',$Data['start_hour']);
	$hora = intval($horaStr);
	$minutos = intval($minutosStr);
	$startH = $hora + $minutos / 60;

	list($horaStr, $minutosStr) = explode(':',$Data['end_hour']);
	$hora = intval($horaStr);
	$minutos = intval($minutosStr);
	$endH = $hora + $minutos / 60;
	
	$cpuUsage = intval($Data['cpu_usage_limit']);
	$idleTime = intval($Data['idle_time_to_run']);

	if($Data['run_if_user_active'] == 'on')
		$runActive = 1;
	else
		$runActive = 0;


	$DB->Consulta("update groups set mod_time=$now,start_hour=$startH,end_hour=$endH,cpu_usage_limit=$cpuUsage,run_if_user_active=$runActive,idle_time_to_run=$idleTime where id = $gid;");
	$out['success'] = true;
	}

return $out;
}

function loadForm($DB, $Data){
$out = array();
if($Data->form == 'pref'){
	$out['data'] =  array();
	$gid = intval($Data->gid);
	$DB->Consulta("select id,mod_time, start_hour,end_hour,cpu_usage_limit,run_if_user_active,idle_time_to_run from groups where id = $gid;");
	$pref = $DB->SacaTupla(false);

	$hora = intval($pref['start_hour']);
	$minutos = intval(($pref['start_hour'] - $hora) * 60);
	$pref['start_hour'] =   sprintf("%02d:%02d", $hora,$minutos);

	$hora = intval($pref['end_hour']);
	$minutos = intval(($pref['end_hour'] - $hora) * 60);
	$pref['end_hour'] =   sprintf("%02d:%02d", $hora,$minutos);

	$pref['mod_time'] =  date('d/m/Y H:i', $pref['mod_time'] );

	$out['data'] = $pref;
	$out['success'] = true;
	}
else if($Data->form == 'info'){
	$out['data'] =  array();
	$twoweeks = time() - 13.5 * 24 * 3600; 
	$gid = intval($Data->gid);

	$DB->Consulta("select name, info from groups where id = $gid;");
	$Grupos = $DB->SacaTupla(false);

	$DB->Consulta("select count(*) as hosts, sum(cpus) as proc, sum(cpus*mips) as mips, sum(cpus*flops) as flops from hosts where gid = $gid and last_contact >= $twoweeks;");
	$Hosts = $DB->SacaTupla(false);
	if($Hosts['hosts'] == 0){
		$Hosts = array('hosts'=>'0','proc'=>'0','mips'=>'0','flops'=>'0');
		}

	$DB->Consulta("select count(*) as hosts, sum(cpus) as proc, sum(cpus*mips) as mips, sum(cpus*flops) as flops  from hosts where gid = $gid and last_contact < $twoweeks;");
	$InactiveHosts = $DB->SacaTupla();
	if($InactiveHosts['hosts'] > 0){
		$Hosts['hosts'] .= " (" . $InactiveHosts['hosts'] . " inactivos)";
		$Hosts['proc'] .= " (" . $InactiveHosts['proc'] . " inactivos)";
		$Hosts['mips'] .= " (" . $InactiveHosts['mips'] . " inactivos)";
		$Hosts['flops'] .= " (" . $InactiveHosts['flops'] . " inactivos)";
		}

	$Proyectos = $DB->Consulta("select pid from configprojects where gid = $gid;");
	$POut = $DB->Consulta("select pid from configprojects where gid = $gid and detach_when_done > 0;");
	$PDetenidos = $DB->Consulta("select pid from (configprojects left join projects on (projects.id = configproject.pid)) where gid = $gid and detach_when_done = 0 and (configproject.suspend > 0 OR projects.estado > 0);");

	$Pactivos = $Proyectos - $PDetenidos - $POut;

	$Proj['projects'] = "$Pactivos activos";

	if($PDetenidos > 0)
		$Proj['projects'] .= " / $PDetenidos pausados";

	if($POut > 0)
		$Proj['projects'] .= " / $POut en eliminacion";

	$out['data'] = array_merge($Grupos, $Hosts, $Proj);
	$out['success'] = true;
	}
return $out;
}

function groupCombo($DB, $Data){
$out['root'] = array();
$out['totalCount'] = $DB->Consulta("select id, name as nombre from groups where uid = %uid% order by {$Data->sort} {$Data->dir};");

while($t = $DB->SacaTupla(false)){
	$out['root'][] = $t;
	}

$out['success'] = true;

return $out;
}

function projectCombo($DB, $Data){
$out['root'] = array();

$gid = intval($Data->gid);

$out['totalCount'] = $DB->Consulta("select id, name as nombre from projects where id not in (select pid from configprojects where gid={$gid}) and estado < 2 order by {$Data->sort} {$Data->dir};");

while($t = $DB->SacaTupla(false)){
	$out['root'][] = $t;
	}

$out['success'] = true;

return $out;
}
