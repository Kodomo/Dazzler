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
/* Panel administracion de contenido */

Dazzler.admin.contentPanel = function(config){
	this.contentTree = new Ext.tree.TreePanel({
		id:'contentMenu',
		region:'west',
		title: 'Menú del Sistema',
		width: 220,
		rootVisible:true,
		lines:false,
		autoScroll:true,
		collapsed: false,
		collapsible:true,
		selModel: new Ext.tree.DefaultSelectionModel({
			listeners: {
					'selectionchange': function(tree,node){
						//Clean stuff from previous loads
						Ext.getCmp('contentForm').getForm().reset();
						Ext.getCmp('contentForm').setDisabled(true);
						Ext.getCmp('contentAdminGroups').setDisabled(true);

					    Ext.getCmp('contentAddHijo').setDisabled(true);
					    Ext.getCmp('contentDelHijo').setDisabled(true);

						Ext.getCmp('contentGroupGrid').getStore().load({params:{'contentid':node.attributes.xid,start: 0, limit: 25}});
						Ext.getCmp('comboGroup').getStore().load({params:{'contentid':node.attributes.xid}});


						Ext.getCmp('contentForm').getForm().load({
									params:{ 'nodeid': node.id },

									success:function(){
									   //selected, enable buttons
									    Ext.getCmp('contentAddHijo').setDisabled(false);
									    Ext.getCmp('contentDelHijo').setDisabled(false);
										Ext.getCmp('contentForm').setDisabled(false);

										Ext.getCmp('contentAdminGroups').setDisabled(false);

										Ext.getCmp('btnQuitarGrupo').setDisabled(true);
										Ext.getCmp('btnAgregarGrupo').setDisabled(true);

										},
									failure:function(){
									
										}
									});
						}
					}	
			}),
		loader: new Ext.tree.TreeLoader({
			baseAttrs: {expanded: true},
			directFn: Dazzler.api.getTree,
			paramsAsHash: true,
			baseParams: {xid: %xid%},
			createNode: function(attr) {
					if(attr.xicon){
						attr.iconCls = Ext.ux.TDGi.iconMgr.getIcon(attr.xicon);
						}
					return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
					}
			}),
		root: new Ext.tree.AsyncTreeNode({ id: 'menunode.1', text: '/', expanded:true  }),
		bbar: [{
				id: 'refreshTree',
				text: 'Actualiza',
				iconCls: Ext.ux.TDGi.iconMgr.getIcon('reload'),
				handler: function(){
						Ext.getCmp('contentForm').getForm().reset();
						Ext.getCmp('contentForm').setDisabled(true);
						Ext.getCmp('contentAddHijo').setDisabled(true);
						Ext.getCmp('contentDelHijo').setDisabled(true);
						Ext.getCmp('contentAdminGroups').setDisabled(true);
		                Ext.getCmp('contentMenu').getRootNode().reload();
						}
			}],
		tbar: [{
				id: 'contentAddHijo',
				text: 'Agregar Hijo',
				iconCls: Ext.ux.TDGi.iconMgr.getIcon('folder_add'),
				disabled: true,
				handler: function(){
						var node = Ext.getCmp('contentMenu').getSelectionModel().getSelectedNode();
						Ext.MessageBox.prompt('Confirmación', 'Ingrese el nombre para el hijo del nodo \"'+node.text+'\"' , function(btn,text){
							if(btn == 'ok'){
								Dazzler.api.customFn({'xid': %xid%, 'customFn':'addNode','pid': node.id,'nombre': text},function(result){
									if(result.success){
										Ext.getCmp('contentForm').getForm().reset();
										Ext.getCmp('contentForm').setDisabled(true);
										Ext.getCmp('contentAddHijo').setDisabled(true);
										Ext.getCmp('contentDelHijo').setDisabled(true);
										Ext.getCmp('contentMenu').getRootNode().reload();
										}			
									else{
										Ext.Msg.alert('Error', 'Se produjo un error al agregar el nodo.'); 
										}						
									});
								}
							});
						}
				},{
				id: 'contentDelHijo',
				text: 'Quitar Nodo',
				iconCls: Ext.ux.TDGi.iconMgr.getIcon('folder_delete'),
				disabled: true,
				handler: function(){
						Ext.MessageBox.confirm('Confirmación', '¿Está seguro que desea eliminar el elemento seleccionado?' , function(btn){
							if(btn == 'yes'){
								var node = Ext.getCmp('contentMenu').getSelectionModel().getSelectedNode();
								Dazzler.api.customFn({'xid': %xid%, 'customFn':'delNode','nid': node.id},function(result){
									if(result.success){
										Ext.getCmp('contentForm').getForm().reset();
										Ext.getCmp('contentForm').setDisabled(true);
										Ext.getCmp('contentAddHijo').setDisabled(true);
										Ext.getCmp('contentDelHijo').setDisabled(true);
										Ext.getCmp('contentMenu').getRootNode().reload();
										}
									else{
										Ext.Msg.alert('Error', 'Se produjo un error al eliminar el nodo.'); 
										}						
									});
								}
							});
						}
				}]
			});

	this.dataPanel = new Ext.form.FormPanel({
		id:'contentForm',
		region:'center',
		title: 'Datos del nodo',
		baseParams: {xid: %xid%},
		frame:true,
		disabled: true,
		paramsAsHash: true,
		items: [{ //fielset con info
				 xtype:'fieldset',
				 title: 'Información sobre el nodo',
			     collapsible: true,
		         autoHeight:true,
		         defaultType: 'textfield',
 				 anchor: '100%',
	 			 defaults: {anchor: '90%'},
				 items:[
						{id: 'idDelNodo', name: 'id', xtype:'hidden'},
						{name: 'pid', fieldLabel: 'Padre', allowBlank: false},
						{name: 'pos', fieldLabel: 'Posicion', allowBlank: false},
						{name: 'tipo', fieldLabel: 'Tipo', allowBlank: false},
						{name: 'nombre', fieldLabel: 'Titulo', allowBlank: false},
						{name: 'icon', fieldLabel: 'Icono'}
						]
				},{ 
//				id:'contentEditor', hideLabel: true, xtype:'htmleditor', name: 'contenido', anchor: '100% -35', enableSourceEdit: true
				id:'contentEditor', hideLabel: true, xtype:'textarea', name: 'contenido', anchor: '100% -40'
				}],

		buttons: [
				{
				text: 'Guardar',
				formBind: true,
				handler:function(){
					//Disable other actions
					Ext.getCmp('contentForm').getForm().submit({
				            waitTitle:'Porfavor espere...', 
				            waitMsg:'Guardando...',
				            success:function(){
								//Reload menu
//					            Ext.getCmp('contentMenu').getRootNode().reload();
					            },

				            failure:function(form, action){
								//Enable again
			                    Ext.Msg.alert('Error', 'Se produjo un error al guardar los datos.'); 
				            }
						});
					}
				}
			],

		api: {
			load: Dazzler.api.loadForm,
			submit: Dazzler.api.submitForm
			}

		});

	this.dataSelectStore = new Ext.data.Store({
							id: 'groupComboStore',
							proxy: new Ext.data.DirectProxy({ directFn: Dazzler.api.customFn }),
							reader: new Ext.data.JsonReader({
								root: 'groups',
								totalProperty: 'totalCount',
								idProperty: 'id',
								messageProperty: 'msg',
								fields: ['id', 'nombre']
							}),
							baseParams: {'xid': %xid%, 'customFn': 'contentGroupCombo'},
							remoteSort: true,
							sortInfo: {field: 'nombre', direction: 'ASC'}
							});
	this.dataGridStore = new Ext.data.Store({
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
						baseParams: {'xid': %xid%, 'customFn': 'contentGroupGrid'},
						remoteSort: true,
						sortInfo: {field: 'nombre', direction: 'ASC'}
						});

	this.dataGroups = new Ext.Panel({
		region:'east',
		title: 'Grupos del nodo',
		layout: 'border',
		width: 300,
		collapsible: true,
		id: 'contentAdminGroups',
		listeners: {
				'afterlayout': {
				    fn: function(p){
				        p.disable();
				    	},
				    single: true // important, as many layouts can occur
					}
				},
		items : [
		new Ext.FormPanel({
			id: 'contentAddGroup',
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
					store: this.dataSelectStore,
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
						Ext.getCmp('contentAdminGroups').getEl().mask('Eliminando...','ext-el-mask-msg x-mask-loading');
						var SelContentId = Ext.getCmp('idDelNodo').getValue();
						var SelGroupId = Ext.getCmp('comboGroup').getValue();
						Ext.getCmp('comboGroup').clearValue();
						Ext.getCmp('btnQuitarGrupo').setDisabled(true);
						Ext.getCmp('btnAgregarGrupo').setDisabled(true);
						Dazzler.api.customFn({'xid': %xid%, 'customFn': 'addContentGroup', 'contentid':SelContentId, 'groupid':SelGroupId, },function(){
							Ext.getCmp('contentGroupGrid').getStore().load({params:{'contentid':SelContentId,start: 0, limit: 25}});
							Ext.getCmp('comboGroup').getStore().load({params:{'contentid':SelContentId}});
							Ext.getCmp('contentAdminGroups').getEl().unmask();
							});
						}
					}]
				}]
			}),
		new Ext.grid.GridPanel({
				id: 'contentGroupGrid',
				border:'false',
				region:'center',

				store: this.dataGridStore,

				colModel: new Ext.grid.ColumnModel({
					defaults: { sortable: true },
					columns: [
						{ dataIndex: 'id'   , width: 60, header: 'Id' },
						{ dataIndex: 'nombre', header: 'Nombre' } ]
					}),

				viewConfig: {forceFit: true },
				sm: new Ext.grid.RowSelectionModel({
						singleSelect:true,
						listeners:{
							'rowselect': function(){
								Ext.getCmp('btnQuitarGrupo').setDisabled(false);
								}
							}
						 }),
				loadMask: {msg:'Cargando datos...'},

				bbar: new Ext.PagingToolbar({
				    pageSize: 25,
				    store: this.dataGridStore,
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
						Ext.getCmp('contentAdminGroups').getEl().mask('Eliminando...','ext-el-mask-msg x-mask-loading');
						var SelContentId = Ext.getCmp('idDelNodo').getValue();
						var SelGroupId = Ext.getCmp('contentGroupGrid').getSelectionModel().getSelected().get('id');
						Ext.getCmp('comboGroup').clearValue();
						Ext.getCmp('btnQuitarGrupo').setDisabled(true);
						Ext.getCmp('btnAgregarGrupo').setDisabled(true);
						Dazzler.api.customFn({'xid': %xid%, 'customFn': 'delContentGroup', 'contentid':SelContentId, 'groupid':SelGroupId, },function(){
							Ext.getCmp('contentGroupGrid').getStore().load({params:{'contentid':SelContentId,start: 0, limit: 25}});
							Ext.getCmp('comboGroup').getStore().load({params:{'contentid':SelContentId}});
							Ext.getCmp('contentAdminGroups').getEl().unmask();
							});

						} }]
				})

				]//-items grupos de contenido
		});

	config = Ext.apply({

		layout: 'border',
		border: false,
		items: [ this.contentTree, this.dataPanel, this.dataGroups ]//-items panel editor de aplicacion


		}, config);
	Dazzler.admin.contentPanel.superclass.constructor.call(this,config);
	};

Ext.extend(Dazzler.admin.contentPanel, Ext.Panel, {});

";
}

function App_show(){

return "
SCV.mainContent.add(new Dazzler.admin.contentPanel() );
SCV.mainContent.doLayout();
";
}

function getTree($DB, $Data){
	list($crap,$nid) = explode('.',$Data->node);
	$tree = array();
	$DB->Consulta("select id as xid,hijos,nombre as text,icon as xicon, tipo from contenido where id > 1 and pid = {$nid} order by pos asc;");

	while($el = $DB->Sacatupla(false)){
		if ($el['hijos'] > 0)
			$el['leaf'] = false;
		else

			$el['leaf'] = true;

		$el['id'] = 'menunode.'.$el['xid'];

		$tree[$el['xid']] = $el;
		}
	return array_values($tree);
	}

function loadForm($DB, $Data){
	list($crap,$nid) = explode('.',$Data->nodeid);
	$out = array();

	$n = $DB->Consulta("select id, pid, pos ,nombre,tipo,icon, contenido from contenido where id = $nid");

	if($n == 1){
		$out['success'] = true;
		$t = $DB->SacaTupla(false);
		$out['data'] = $t;
		}
	else{
		$out['success'] = false;
		$out['data'] = array();
		}
	return $out;
	}

function submitForm($DB, $Data){
	$out = array();

	if($Data['tipo'] == 1)
		$Data['contenido'] = html_entity_decode($Data['contenido'],ENT_NOQUOTES,'UTF-8');

	$Esc = $DB->EscapeArray($Data,array('nombre','icon','contenido'));
	$DB->Consulta("update contenido set pid={$Data['pid']}, pos={$Data['pos']} ,nombre='{$Esc['nombre']}',tipo={$Data['tipo']},icon='{$Esc['icon']}', contenido='{$Esc['contenido']}'  where id = {$Data['id']};");

	if($DB->Estado){
		$out['success'] = true;
		}
	else{
		$out['success'] = false;
		$out['error']['reason'] = $DB->Error_debug;
		}
	return $out;
	}

function addNode($DB, $Data){
	$out = array();
	list($crap,$nid) = explode('.',$Data->pid);

	$Nombre = $DB->EscapeString($Data->nombre);

	$n = $DB->Consulta("select id from contenido where pid=$nid;")+1;

	$DB->Consulta("insert into contenido( pid, pos, tipo, icon, contenido, nombre) values($nid,$n,0,'folder','','$Nombre');");

	if($DB->Estado){
		$out['success'] = true;
		}
	else{
		$out['success'] = false;
		$out['error']['reason'] = $DB->Error_debug;
		}
	return $out;
	}

function delNode($DB, $Data){
	$out = array();
	list($crap,$nid) = explode('.',$Data->nid);


	$DB->Consulta("delete from contenido where id = $nid;");

	if($DB->Estado){
		$out['success'] = true;
		}
	else{
		$out['success'] = false;
		$out['error']['reason'] = $DB->Error_debug;
		}
	return $out;
	}

function contentGroupGrid($DB, $Data){
$out = array();
$out['groups'] = array();

$DB->Consulta("select grupos.id, grupos.nombre from (gcontenido
		left join grupos on (gcontenido.gid = grupos.id))
	    where gcontenido.cid = {$Data->contentid} order by grupos.{$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");
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

function contentGroupCombo($DB, $Data){
$out = array();
$out['groups'] = array();

$DB->Consulta("select id, nombre from grupos where id not in (select gid from gcontenido where cid = {$Data->contentid}) order by {$Data->sort} {$Data->dir};");

while($t = $DB->SacaTupla(false)){
	$out['groups'][] = $t;
	}
$out['success'] = true;

return $out;
}

function delContentGroup($DB, $Data){
$out = array();

$DB->Consulta("delete from gcontenido where cid={$Data->contentid} and gid={$Data->groupid};");

if(!$DB->Estado){
	$out['success'] = false;
	}
else{
	$out['success'] = true;
	}

return $out;
}

function addContentGroup($DB, $Data){
$out = array();

$DB->Consulta("insert into gcontenido(cid,gid) values({$Data->contentid},{$Data->groupid});");

if(!$DB->Estado){
	$out['success'] = false;
	}
else{
	$out['success'] = true;
	}

return $out;
}
