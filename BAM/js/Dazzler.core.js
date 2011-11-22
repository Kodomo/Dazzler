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

Ext.ns('Dazzler.core');

Dazzler.core.aplication = Ext.extend(Ext.Viewport, {

	constructor: function(config){

		this.LoadedClass = new Array();
/* *********************** Tabpanel 1: Informacion de la Cuenta ******************** */
	/* custom Stores  */
		this.groupsStore = new Ext.data.Store({
			proxy		: new Ext.data.DirectProxy({ directFn: Dazzler.core.userGroups }),
			reader		: new Ext.data.JsonReader({
						root: 'groups',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'nombre']
						}),
			remoteSort	: true,
			sortInfo	: {field: 'nombre', direction: 'ASC'}
			});

		this.userSessionDataStore = new Ext.data.Store({
			proxy		: new Ext.data.DirectProxy({ directFn: Dazzler.core.userSession }),
			reader		: new Ext.data.JsonReader({
						root: 'sessions',
						totalProperty: 'totalCount',
						idProperty: 'id',
						messageProperty: 'msg',
						fields: ['id', 'inicio','fin','ip','iptxt','ipcls','resolucion','sotxt','socls','navegadortxt','navegadorcls', 'useragent','duracion', 'estado', 'estadotxt']
						}),
			remoteSort	: true,
			sortInfo	: {field: 'id', direction: 'DESC'}
			});

		this.userSessionGrid = new Ext.ux.crudGridPanel.rPagingGrid({
			region			: 'center',

			title			: 'Conexiones del usuario',
			defaultDesc		: 'sesiones',
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('server'),

			defaulPageSize	: 10,
			store			: this.userSessionDataStore,

			buildColumns	: this.builSessionColumns
		});

		this.userSessionForm = new Ext.form.FormPanel({
			title			: 'Detalle de la conexi&oacute;n',
			region			: 'east',
			frame			: true,
			monitorValid	: true,
			width			: 550,
			defaultType		: 'displayfield',
			defaults		: { anchor: '95%' },
			paramsAsHash	: true,
			items			: this.buildSessionFormItems()
			});

		this.userSessionData = new Ext.Container({
			border			: false,
			region			: 'south',
			title			: 'Conexiones',
			height			: 300,
			layout			: 'border',
			items: [ this.userSessionGrid, this.userSessionForm ]
		});


		this.userGroupGrid = new Ext.ux.crudGridPanel.rPagingGrid({
			region			: 'east',
			title			: 'Grupos del usuario',
			width			: 350,
			defaultDesc		: 'grupos',
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('server'),

			defaulPageSize	: 25,
			store			: this.groupsStore,

			buildColumns	: this.buildGroupColumns
		});

		this.userFormData = new Ext.form.FormPanel({
			title		: 'Informa&oacute;n del usuario',
			region		: 'center',
			frame		: true,
			monitorValid: true,
			paramsAsHash: true,
			items		: this.buildUserFormItems(),
			buttons		: this.buildUserFormButtons(),
			api			: {	load: Dazzler.core.UserLoad, submit: Dazzler.core.UserSave	}
			});

		this.userPanel = new Ext.Container({
			title		: 'Datos de usuario',
			iconCls		: Ext.ux.TDGi.iconMgr.getIcon('user_magnify'),
			layout		: 'border',
			border		: false,
			items		: [this.userFormData, this.userSessionData, this.userGroupGrid]
			});
/* *********************** Tabpanel 0: Contenido ******************** */
		this.treeSelModel = new Ext.tree.DefaultSelectionModel();
		this.rootTreeNode = new Ext.tree.AsyncTreeNode({ id: 'menunode.1', text: 'MenuRoot', expanded:true  });

		this.mainMenu = new Ext.tree.TreePanel({
			region		: 'west',
			title		: 'Menu',
			width		: 220,
			rootVisible	: false,
			lines		: false,
			autoScroll	: true,

			loader		: this.buildTreeNode(),	
			selModel	: this.treeSelModel,

			root 		: this.rootTreeNode
			});

		this.mainContent = new Ext.Container({
			layout		: 'fit',
			region		:'center',
			border		: false
			});

		this.contenido = new Ext.Container({
			layout		: 'border',
			title		: 'Aplicaci&oacute;n',
			iconCls		: Ext.ux.TDGi.iconMgr.getIcon('application_side_tree'),
			border		: false,
			items		: [this.mainMenu, this.mainContent]
			});

/* *********************** Estructura base titulo y contenido ******************** */
		this.titulo =  new Ext.BoxComponent({
			id			: config.titleId,
			border		: false,
			height		: 39,
			html		: config.titleContent
			});
	
		this.tabContent = new Ext.TabPanel({
			activeTab	: 0,
			anchor		:'100% -41',
			items		: [this.contenido, this.userPanel, {title: 'Cerrar sessi&oacute;n', id:'logoutab', iconCls: Ext.ux.TDGi.iconMgr.getIcon('disconnect')} ]
		});


		config = Ext.apply({
			layout		: 'anchor',
			items		: [this.titulo, this.tabContent]
			}, config);

		Dazzler.core.aplication.superclass.constructor.call(this,config);

		this.tabContent.on('beforetabchange',this.logoutTab,this);
		this.treeSelModel.on('selectionchange',this.selectTreeNode,this)


		this.userSessionGrid.on({
			'rowselect' 	: this.sessionSelect,
			'rowdeselect'	: this.sessionDeselect,
			'datachanged' 	: this.sessionDeselect,
			 scope			: this
			});

		Ext.get("Dazzler-Title").on('click',this.showDazzler,this);

		this.mainMenu.getLoader().on('load',this.initData,this,{single: true});
		},

/* *********************** About Dazzler ******************** */
showDazzler: function(){
		window.open('http://en.wikipedia.org/wiki/Dazzler','dazzlerWindow','width=800,height=600,toolbar=yes,location=yes,directories=yes,status=yes,menubar=yes,scrollbars=yes,copyhistory=yes,resizable=yes');
},

/* ************************* funciones ************************* */
buildTreeNode:	function(){
	return new Ext.tree.TreeLoader({
				baseAttrs	: { expanded: true },
				directFn	: Dazzler.core.getTree,

				createNode	: function(attr) {
						if(attr.xicon){
							attr.iconCls = Ext.ux.TDGi.iconMgr.getIcon(attr.xicon);
							}
						return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
						}
				});
	},
/* ************************* funciones ************************* */
buildUserFormItems : function(config){
	return [{ 	name	: 'id', 
				xtype	: 'hidden'
			},{ 
				xtype	: 'fieldset',
			 	title	: 'Datos de usuario',
				defaults: {anchor: '95%'},
				items	:[{
							name		: 'login',
							fieldLabel	: 'Usuario',
							xtype		: 'displayfield'
						},{
							name		: 'nombre',
							fieldLabel	: 'Nombre',
							xtype		: 'textfield',
							allowBlank	: false
						},{
							name		: 'correo',
						 	fieldLabel	: 'Correo', 
						 	xtype		: 'displayfield'
						}]
			},{
				 xtype	: 'fieldset',
			 	 title	: 'Cambio de clave de usuario',
	 			 defaults: {anchor: '90%'},
				 items	:[{
							ref			: '../fnclave',
							name		: 'nclave',
							xtype		: 'textfield',
							inputType	: 'password',
							fieldLabel	: 'Nueva Clave',
							validator	: this.passFunc
						},{
							ref			: '../fcclave',
							name		: 'cclave',
							xtype		: 'textfield',
							inputType	: 'password',
							fieldLabel	: 'Confirmaci&oacute;n',
							validator	: this.passFunc 
						}]

			},{
	 			xtype		: 'textfield',
	 			ref			: '../faclave',
	 			name		: 'aclave',
	 			inputType	: 'password',
	 			fieldLabel	: 'Clave actual',
	 			anchor		: '40%',
	 			allowBlank	: false,
	 			invalidText	: 'Debe ingresar la clave actual para realizar cualquier modificaci&oacute;n'
			}];

		 
	},
buildUserFormButtons : function(config){
	return [{
			text	: 'Guardar',
			formBind: true,
			scope	: this,
			handler	: this.saveUserForm
		}];
	},
buildSessionFormItems: function(){
	return [{
			name		: 'id',
			fieldLabel	: 'Id de Sesi&oacute;n'
		},{ 
			name		: 'inicio',
			fieldLabel	: 'Inicio sesi&oacute;n'
		},{ 
			name		: 'fin',
			fieldLabel	: '&Uacute;ltima acci&oacute;n'
		},{ 
			name		: 'duracion',
			fieldLabel	: 'Duraci&oacute;n'
		},{ 
			name		: 'estadotxt',
			fieldLabel	: 'Estado'
		},{ 
			name		: 'ip',
			fieldLabel	: 'Ip'
		},{ 
			name		: 'navegadortxt',
			fieldLabel	: 'Navegador'
		},{ 
			name		: 'sotxt',
			fieldLabel	: 'S.O.'
		},{ 
			name		: 'resolucion',
			fieldLabel	: 'Resoluci&oacute;n'
		},{ 
			name		: 'useragent',
			fieldLabel	: 'Agente'
		}];
	},
builSessionColumns: function(){
	return [{ 
			dataIndex	: 'id', 
			header		: 'Sid' 
		},{ 
			dataIndex	: 'inicio',
		 	header		: 'Inicio' 
		},{ 
		 	dataIndex	: 'fin',
		 	header		: '&Uacute;ltimo' 
		},{ 
		 	dataIndex	: 'ip',
		 	header		: 'Ip' 
		 }];
	},
buildGroupColumns: function(){
	return [{ 
			dataIndex: 'nombre',
			header: 'Nombre' 
			}];
	},
/* ************************* utilitarios ************************* */
checkPass:  function(value){
	if(value.length > 0){
	   var pwda = Ext.getCmp('fnclave').getValue();
	   var pwdb = Ext.getCmp('fcclave').getValue();

		if(value.length <= 4)
			return "La clave debe tener almenos 5 caracteres";
		else if(value.length >= 20)
			return "La clave debe tener 20 caracteres como m&aacute;ximo";
		else if(pwda.length > 0 && pwdb.length > 0){
		   if(pwda != pwdb)
				return "Las claves ingresadas deben ser id&eacute;nticas";
			else{
				Ext.getCmp('fnclave').clearInvalid();
				Ext.getCmp('fcclave').clearInvalid();
				}
			}
	   }
	return true;
	},
errorPopUp: function(msg){
	if(msg)
		Ext.Msg.alert('Error', msg);
	else
		Ext.Msg.alert('Error', 'Se produjo un error al comuncarse con el servidor, verifique su conexi&oacute;n e intentelo nuevamente.');
	},
/* ************************* eventos ************************* */
initData:	function(){
	this.treeSelModel.select(this.rootTreeNode.firstChild);
	this.userFormData.getForm().load({});
	this.userSessionDataStore.load({params: {start: 0, limit: 10}});
	this.groupsStore.load({params: {start: 0, limit: 25}});
	},
aboutWin:	function(){
	this.aboutWin.show();
	},
aboutClose:	function(){
	this.aboutWin.hide();
	},
selectTreeNode: function(tree,node){
	if(node.attributes.tipo > 0){
		this.mainContent.getEl().mask('Cargando contenido...','ext-el-mask-msg x-mask-loading');

		var full = this.LoadedClass.indexOf(node.id) == -1;

		this.mainContent.removeAll();

		Dazzler.core.show(node.attributes.xid,full,this.showCallback,this);
		}
	},

showCallback:	function(result,e){
	if(result.success){
		var full = this.LoadedClass.indexOf(result.nodeid) == -1;
		if(full)
			this.LoadedClass.push(result.nodeid);

		this.mainContent.update(result.show,true);
		}
	else{
		this.mainContent.getEl().unmask();
		this.errorPopUp();
		}
	},

sessionDeselect: function(){
	this.userSessionForm.getForm().reset();
	},
sessionSelect: function(sm){
	var record = sm.getSelected();
	this.userSessionForm.getForm().loadRecord(record);
	},
saveUserForm: function(){
	this.userFormData.getForm().submit({
		waitTitle:'Porfavor espere...', 
		waitMsg:'Guardando...',
		scope: this,
		success:function(form){
			form.reset();
			form.load({}); 
			},
		failure:function(form,action){
			this.errorPopUp(action.result.error.reason);
			form.reset(); 
			form.load({}); 
			}
		});
	},
logoutTab: function(t,n,c){
	if(n.id == 'logoutab'){
		Dazzler.core.Logout(
			function(result,e){
				Ext.Msg.alert('Fin de sessi&oacute;n', 'Sessi&oacute;n cerrada, presione OK para continuar.',function(){
					window.location = '/';
					}); 
				}
			);
		return false;
		}
	else{
		return true;
		}
	}

	});


Dazzler.core.loginWindow = Ext.extend(Ext.Window, {
	constructor: function(config){
		this.loginForm = new Ext.form.FormPanel({
		    labelWidth	: 80,
		    iconCls		: Ext.ux.TDGi.iconMgr.getIcon('application_key'), 
		    frame		: true, 
		    title		: 'Por favor identifiquese para continuar', 
		    defaultType	: 'textfield',
			monitorValid: true,

		    items		: this.buildFormItems(),
	 		api			: { submit: Remote.login },
			keys		: [{
						key		: [ Ext.EventObject.ENTER ],
						ctrl	: false,
						scope	: this,
						handler	: this.gogoLogin
						}],
		    buttons		:[{
				        text	: 'Ingresar',
				        formBind: true,	 
						scope	: this,
				        handler	: this.gogoLogin
				    	}] 
			});

		config = Ext.apply({
		    layout		: 'fit',
		    width		: 300,
		    height		: 150,
		    closable	: false,
		    resizable	: false,
		    plain		: true,
		    border		: false,
			initHidden	: false,
		    items		: [ this.loginForm ]
			}, config);

		Dazzler.core.loginWindow.superclass.constructor.call(this,config);

	},
buildFormItems: function(){
	return [{ 
		    fieldLabel:'Usuario', 
		    name:'loginUsername', 
		    allowBlank:false, 
			blankText: 'Debe ingresar un nombre de usuario'
		},{ 
		    fieldLabel:'Clave', 
		    name:'loginPassword', 
		    inputType:'password', 
		    allowBlank:false , 
			blankText: 'La clave no puede estar vac&iacute;a'
		},{ 
		    name:'spixels', 
		    inputType:'hidden', 
			value: screen.width * screen.height
		},{ 
		    name:'swidth', 
		    inputType:'hidden', 
			value: screen.width
		}];
	},

gogoLogin: function(){
	this.loginForm.getForm().submit({ 
		waitTitle	: 'Verificando credenciales', 
		waitMsg		: 'Autentificando...',
		success		: function(){
		    window.location = '/BAM/';
		    },
		failure		: function(form, action){
		    if(action.failureType === Ext.form.Action.SERVER_INVALID){ 
		        Ext.Msg.alert('Error de autentificaci&oacute;n', action.result.error.reason); 
		    }else{ 
		        Ext.Msg.alert('Error', 'Se produjo un error al comuncarse con el servidor, verifique su conexi&oacute;n e intentelo nuevamente.'); 
		    }
		    this.loginForm.getForm().reset(); 
		}
		}); 
	}
});

