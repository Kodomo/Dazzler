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


Ext.ns('Ext.ux', 'Ext.ux.crudGridPanel');

/* Basic Read Store - no write capabilities */ 
Ext.ux.crudGridPanel.rStore = Ext.extend(Ext.data.Store, {

	constructor: function(config){
		if(config.defaultLimit)
			this.defaultLimit = config.defaultLimit;

		if(config.buildFields)
			this.buildFields = config.buildFields;

		config = Ext.apply({
			proxy		: this.buildProxy(),
		    reader		: this.buildReader(),
			remoteSort	: true,
		    sortInfo	: {field: 'id', direction: 'DESC'},
		    autoLoad	: {params:{start: 0, limit: this.defaultLimit}}
			}, config);

		Ext.ux.crudGridPanel.rStore.superclass.constructor.call(this,config);
		},

	defaultLimit: 25,

	buildFields:  function(){
		return ['id','name'];
		},

	buildReader:  function(){
		return new Ext.data.JsonReader({
            root			: 'root',
            totalProperty	: 'totalCount',
            idProperty		: 'id',
			messageProperty	: 'msg',
			fields			: this.buildFields()
	        });

		},

	buildProxy: function(){
		return new Ext.data.DirectProxy({
			api: {
				read: Dazzler.api.DirectRead
				}
			});
		}
});

/* Read/Create/Update Store - no delete capabilities */ 
Ext.ux.crudGridPanel.cruStore = Ext.extend(Ext.ux.crudGridPanel.rStore, {
	constructor: function(config){
		config = Ext.apply({
			proxy	: this.buildProxy(),
			writer	: this.buildWriter()
			}, config);
		Ext.ux.crudGridPanel.cruStore.superclass.constructor.call(this,config);
	},

	buildProxy: function(){
		return new Ext.data.DirectProxy({
			api: {
				read	: Dazzler.api.DirectRead, 
				update	: Dazzler.api.DirectUpdate, 
				create	: Dazzler.api.DirectCreate
				}
			});
		},

	buildWriter: function(){
		return new Ext.data.JsonWriter({encode: false, writeAllFields: true	});
		}

});

/* Full Store */ 
Ext.ux.crudGridPanel.crudStore = Ext.extend(Ext.ux.crudGridPanel.cruStore, {
	constructor: function(config){

		config = Ext.apply({
			proxy: this.buildProxy()
			}, config);

		Ext.ux.crudGridPanel.crudStore.superclass.constructor.call(this,config);
		},

	buildProxy: function(){
		return new Ext.data.DirectProxy({
			api: {
				read	: Dazzler.api.DirectRead, 
				update	: Dazzler.api.DirectUpdate, 
				destroy	: Dazzler.api.DirectDestroy, 
				create	: Dazzler.api.DirectCreate
				}
			});
		}
});


/* Basic Add/Edit Form */ 
/* A simple form for creation and edit of the records */
Ext.ux.crudGridPanel.baseForm = Ext.extend(Ext.FormPanel, {
	constructor: function(config){
		this.backIconCls = config.backIconCls ? config.backIconCls : Ext.ux.TDGi.iconMgr.getIcon('bullet_left');
		this.saveIconCls = config.saveIconCls ? config.saveIconCls : Ext.ux.TDGi.iconMgr.getIcon('disk');
		this.previewIconCls = config.previewIconCls ? config.previewIconCls : Ext.ux.TDGi.iconMgr.getIcon('page_white_magnify');

		if(config.buildFields)
			this.buildFields = config.buildFields;

		if(config.buildButtons)
			this.buildButtons = config.buildButtons;

		if(config.buildPreview)
			this.buildPreview = config.buildPreview;

		if(config.backButtonText)
			this.backButtonText = config.backButtonText;
		if(config.saveButtonText)
			this.saveButtonText = config.saveButtonText;
		if(config.previewButtonText)
			this.previewButtonText = config.previewButtonText;

		configForm = Ext.apply({
			}, config.configForm);

	/* Form setup */
		config = Ext.apply({
//			frame			: true,
			border			: false,
			width			: 400,
			height			: 90,
			defaultType		: 'textfield',
			defaults		: {anchor: '100%'},
			buttonAlign		: 'left',
			bodyStyle		: "background-color: transparent",
			padding			: 10,
//			trackResetOnLoad: false,
			items			: this.buildFields(),
			buttons			: this.buildButtons()
			}, config);

		Ext.ux.crudGridPanel.baseForm.superclass.constructor.call(this,config);

		this.addEvents('savebtn');
		this.addEvents('closebtn');
		this.addEvents('previewbtn');
		},

/* default form definition */
	buildFields: function() {
			return  [{
				name		: 'name', 
				fieldLabel 	: 'Nombre'
				}];
		},

	buildButtons: function() {
	if(this.buildPreview)
			return [{
				text    : this.backButtonText,
	        	scope   : this,
	            handler : this.onBack,
				iconCls : this.backIconCls
			},'->',{
				text    : this.previewButtonText,
	            scope   : this,
	            handler : this.onPreview,
				iconCls : this.previewIconCls
			},{
				text    : this.saveButtonText,
	            scope   : this,
	            handler : this.onSave,
				iconCls : this.saveIconCls

	        }];
		else
			return [{
				text    : this.backButtonText,
	        	scope   : this,
	            handler : this.onBack,
				iconCls : this.backIconCls
			},'->',{
				text    : this.saveButtonText,
	            scope   : this,
	            handler : this.onSave,
				iconCls : this.saveIconCls

	        }];
		},

/* Form Actions*/
	onSave: function() {
			this.fireEvent('savebtn', this);
		},
	onPreview: function() {
			this.fireEvent('previewbtn', this);
		},
	onBack:	function() {
			this.fireEvent('closebtn', this);
		},
	buildPreview		: false,

	backButtonText		: 'Volver',
	saveButtonText		: 'Guardar',
	previewButtonText	: 'Vista previa',
	previewIconCls		: '',
	backIconCls			: '',
	saveIconCls			: ''

 });

/* Window container of the form for modal presentation */
Ext.ux.crudGridPanel.baseWindowForm = Ext.extend(Ext.Window, {
	constructor: function(config){

		configForm = Ext.apply({
			}, config.configForm);

		this.form = new Ext.ux.crudGridPanel.baseForm(configForm);

		delete config.configForm;

/* setup default listeners */
		listeners = Ext.apply({
			scope	: this,
			closebtn: this.onClose
			}, config.listeners);

		delete config.listeners;

		config = Ext.apply({
			autoDestroy	: false,
			closable	: false, 
			resizable	: false, 
			modal		: true,
			layout		: 'fit',
			listeners	: listeners,
			items		: [ this.form ]
			}, config);

		Ext.ux.crudGridPanel.baseWindowForm.superclass.constructor.call(this,config);

		this.relayEvents(this.form, ['savebtn','closebtn','previewbtn']);
	},
/* behave like the formPanel, returning the basicForm directly */
	getForm: function (){
		return this.form.getForm();
		},
	currentRecord: null
 });


/* Basic Customizable Grid */ 
/* it creates a series of funcion for building for future overloading */

Ext.ux.crudGridPanel.baseGrid = Ext.extend(Ext.grid.GridPanel, {
	constructor: function(config) {
		this.selModel = config.selModel ? config.selModel : this.buildSelModel();
		this.buildColumns = config.buildColumns ? config.buildColumns : this.defaultColumns();

		if(config.buildTbar)
			this.buildTbar = config.buildTbar;

		if(config.buildBbar)
			this.buildBbar = config.buildBbar;

		if(config.buildColModel)
			this.buildColModel = config.buildColModel;

		if(config.buildViewConf)
			this.buildViewConf = config.buildViewConf;

		config = Ext.apply({
		    colModel	: this.buildColModel(),
			viewConfig	: this.buildViewConf(),
			selModel	: this.selModel,
			tbar		: this.buildTbar(),
			bbar		: this.buildBbar(),
			loadMask	: {msg:'Cargando datos...'}
			}, config);

		Ext.ux.crudGridPanel.baseGrid.superclass.constructor.call(this,config);

		this.relayEvents(this.selModel, ['selectionchange','rowdeselect','rowselect']);
		},
/* simple default methods for future overloading */
	buildSelModel: function() {
		return new Ext.grid.RowSelectionModel( {singleSelect:true } );
		},

	buildColumns: function() {
		return [{ dataIndex: 'id',header: 'Id'},{ dataIndex: 'name', header: 'Name'}];
		},

	buildColModel: function() {
		return new Ext.grid.ColumnModel({defaults: { sortable: true }, columns: this.buildColumns() });
		},

	buildViewConf: function() {
		return new Ext.grid.GridView( {forceFit: true});
		},

	buildTbar: function() {
		return null;
		},

	buildBbar: function() {
		return null;
		}
});

/* GridPanel read only */
/* It creates the base GridPanel w Paging toolbar attached */

/* 
	These are the new parameters add by the class:

	defaulPageSize		: Number of records/page (default: 25)
	defaultDesc			: Default description of the records (default: 'Records')
	configStore	  		: Configuration object for the store creation 
						  (Store can be provided directly by 'store' parameter as usual)
	configPagingToolbar	: Configuration object for the Paging Toolbar

overload functions: 

	buildStoreFields	: function that returns the field parameter for the store Reader object (default: ['id','name'])
	buildColumns		: function thar returns the columns parameter for the ColumnModel object
*/


Ext.ux.crudGridPanel.rPagingGrid = Ext.extend(Ext.ux.crudGridPanel.baseGrid, {
	constructor: function(config){

		this.baseParams = config.baseParams;

		if(config.defaultDesc)
			this.defaultDesc = config.defaultDesc;

		if(config.defaulPageSize)
			this.defaulPageSize = config.defaulPageSize;

	/* configuration of the Store */
		configStore = Ext.apply({
			defaultLimit: this.defaulPageSize,
			baseParams	: this.baseParams
			}, config.configStore);

		this.store = config.store ? config.store : this.buildStore ( configStore );

	/* configuration of the Pagin Toolbar */
		configPagingToolbar = Ext.apply({
		    pageSize	: this.defaulPageSize,
		    store		: this.store,
		    displayInfo	: true,
		    displayMsg	: 'Mostrando '+this.defaultDesc+' {0} al {1} de {2}',
		    emptyMsg	: 'No existen '+this.defaultDesc
			}, config.configPagingToolbar);


	/* Grid Configuration */
		config = Ext.apply({
			store	: this.store,
			bbar	: this.buildBbar(configPagingToolbar)
			}, config);

		Ext.ux.crudGridPanel.rPagingGrid.superclass.constructor.call(this,config);

		this.relayEvents(this.store, ['datachanged']);
		},

	buildBbar: function(configPagingToolbar){
		return new Ext.PagingToolbar(configPagingToolbar);
		},
	buildStore: function(configStore){
		return new Ext.ux.crudGridPanel.rStore(configStore);
		},

	defaultDesc		: "Records",
	defaulPageSize	: 25,
	baseParams		: {}

});


/* GridPanel update/create mode enabled */

/* 
	inherits rPagingGrid configuration parameters. These are added by the class:


	configForm			: Configuration object for the Form creation  
	configEditForm		: Custom form, for update values

	invalidTitle		: Title of the Error msgBox form data is invalid (defult: 'Error al inrgesar')
	invalidMsg			: Msg of the Error msgBox form data is invalid (defult: 'Los datos ingresados no son validos')

	addWindowTitle		: Title of the Form Window when Adding an item (defult: 'Nuevo elemento')
	addButtonText		: Text of the Gridpanel Add button (defult: 'Agregar')
	addIconCls			: iconCls of the Add button and Add Form Window (default: TDGi.iconMgr 'add' )

	editWindowTitle		: Title of the Form Window when Adding an item (defult: 'Editar elemento')
	editButtonText		: Text of the Gridpanel Add button (defult: 'Editar')
	editIconCls			: iconCls of the Add button and Add Form Window (default: TDGi.iconMgr 'bullet_edit' )

*/
Ext.ux.crudGridPanel.cruPagingGrid = Ext.extend(Ext.ux.crudGridPanel.rPagingGrid, {
	constructor: function(config){
		this.addIconCls = config.addIconCls ? config.addIconCls : Ext.ux.TDGi.iconMgr.getIcon('add');
		this.editIconCls = config.editIconCls ? config.editIconCls : Ext.ux.TDGi.iconMgr.getIcon('bullet_edit');

		if(config.addButtonText)
			this.addButtonText = config.addButtonText;
		if(config.editButtonText)
			this.editButtonText = config.editButtonText;


	/* Grid Configuration */
		config = Ext.apply({
			}, config);

		Ext.ux.crudGridPanel.cruPagingGrid.superclass.constructor.call(this,config);

		if(!config.listeners){
				this.addListener( this.setListeners() );
				}

		this.formAdd = this.buildFormAdd(config.configForm);
		if(config.configEditForm)
			this.formEdit = this.buildFormEdit(config.configEditForm);
		else
			this.formEdit = this.buildFormEdit(config.configForm);

		},
	buildFormAdd: function(config){
		configWindow = {
			title		: this.addWindowTitle,
			iconCls		: this.addIconCls,
			listeners	: {
					scope		: this,
					savebtn		: this.onCreate,
					closebtn	: this.onCloseCreate
					},
			configForm: config
			};

		return new Ext.ux.crudGridPanel.baseWindowForm(configWindow);
		},
	buildFormEdit: function(config){
		configWindow = {
			title		: this.editWindowTitle,
			iconCls		: this.editIconCls,
			listeners	: {
					scope		: this,
					savebtn		: this.onUpdate,
					closebtn	: this.onCloseEdit
					},
			configForm: config
			};

		return new Ext.ux.crudGridPanel.baseWindowForm(configWindow);
		},
	onCloseCreate: function(){
		this.formAdd.hide();
		},
	onCloseEdit: function(){
		this.formEdit.hide();
		},
	/* default top bar in the cru mode */
	buildTbar: function(){
		return [ {
			text	: this.addButtonText,
			iconCls	: this.addIconCls,
			scope	: this,
			handler	: this.onAdd
			} , '->', {
			text	: this.editButtonText,
			ref		: '../editBtn',
			iconCls	: this.editIconCls,
			disabled: true,
			scope	: this,
			handler	: this.onEdit
			} ];
		},
	/* manually destroy the form window */
	onDestroy: function(){
		this.formAdd.destroy();
		this.formEdit.destroy();
		},
	cleanSaveListener: function(){
		},
	/* show a clean form to create a new record */
	onAdd: function(){
		/* Cleanup! */
		this.formAdd.getForm().reset();
		this.formAdd.show();
		},
	/* Take te form values and add the record to the storage (if valid)*/
	onCreate: function(){
		if (!this.formAdd.getForm().isValid()){
			Ext.Msg.show({
			    title	: this.invalidTitle,
			    msg		: this.invalidMsg,
			    icon	: Ext.MessageBox.ERROR,
			    buttons	: Ext.Msg.OK
				});
			return false;
			}
		else{
			var record = new this.store.recordType(this.formAdd.getForm().getValues());
			this.store.add(record);
			this.store.reload();
			this.formAdd.hide();
			}
		},
	/* Show the current record values in the form */
	onEdit: function(){
		/* verify that a valid record is selected */
		var record = this.selModel.getSelected();
        if (!record) {
            return false;
        	}
		this.formEdit.currentRecord = record;
		this.formEdit.getForm().loadRecord(record);
		this.formEdit.show();
		},
	/* Modify the record values to the ones in the form (if valid)*/
	onUpdate: function(){
		if (!this.formEdit.getForm().isValid()){
			Ext.Msg.show({
			    title	: this.invalidTitle,
			    msg		: this.invalidMsg,
			    icon	: Ext.MessageBox.ERROR,
			    buttons	: Ext.Msg.OK
				});
			return false;
			}
		else{
			/* update the record information */
			this.formEdit.getForm().updateRecord(this.formEdit.currentRecord);
			this.formEdit.hide();
			}
		},
	/* enable disable edit button */
	onRowSelect: function(SelectionModel){
		this.editBtn.setDisabled(false);
		},
	onRowDeselect: function(SelectionModel){
		this.editBtn.setDisabled(true);
		},
	/* overload of the storage creation method */
	buildStore: function(configStore){
		return new Ext.ux.crudGridPanel.cruStore(configStore);
		},
	setListeners: function(){
		return {
			scope			: this,
			rowselect		: this.onRowSelect,
			datachanged		: this.onRowDeselect,
			rowdeselect		: this.onRowDeselect,
			beforedestroy	: this.onDestroy
			};
		},
	/* Basic parameters of the object */
	invalidTitle	: 'Error al inrgesar',
	invalidMsg		: 'Los datos ingresados no son validos',
	addWindowTitle	: 'Nuevo elemento',
	editWindowTitle	: 'Editar elemento',
	addButtonText	: 'Agregar',
	editButtonText	: 'Editar',
	addIconCls		: '',
	editIconCls		: '',

});


/* GridPanel update/create/delete mode enabled */
/* 
	inherits cruPagingGrid configuration parameters. These are added by the class:


	deleteTitle			: Title of the Delete msgBox confirmation dialog (defult: 'Confirmación')
	deleteMsg			: Msg of the Delete msgBox confirmation dialog (defult: '¿Está seguro que desea eliminar el registro seleccionado?')

	deleteButtonText	: Text of the Gridpanel Delete button (defult: 'Eliminar')
	deleteIconCls		: iconCls of the Delete button default: TDGi.iconMgr 'delete' )

*/
Ext.ux.crudGridPanel.crudPagingGrid = Ext.extend(Ext.ux.crudGridPanel.cruPagingGrid, {
	constructor: function(config){
		this.deleteIconCls = config.deleteIconCls ? config.deleteIconCls : Ext.ux.TDGi.iconMgr.getIcon('delete');

		if(config.deleteButtonText)
			this.deleteButtonText = config.deleteButtonText;
		if(config.onDelete)
			this.onDelete = config.onDelete;

		/* Grid Configuration */
		config = Ext.apply({

			}, config);

		Ext.ux.crudGridPanel.crudPagingGrid.superclass.constructor.call(this,config);
		},
	/* default top bar in the crud mode */
	buildTbar: function(){
		return [ {
			text	: this.addButtonText,
			iconCls	: this.addIconCls,
			scope	: this,
			handler	: this.onAdd
			} , '->', {
			text	: this.editButtonText,
			ref		: '../editBtn',
			iconCls	: this.editIconCls,
			disabled: true,
			scope	: this,
			handler	: this.onEdit
			},{
			text	: this.deleteButtonText,
			ref		: '../deleteBtn',
			iconCls	: this.deleteIconCls,
			disabled: true,
			scope	: this,
			handler	: this.onDelete
			} ];
		},
	onDelete: function(){
		Ext.MessageBox.confirm(this.deleteTitle, this.deleteMsg , this.doDelete, this);
		},
	doDelete: function(Button){
		if(Button == 'yes'){
			this.store.remove(this.selModel.getSelected());

			/* Call method to disable buttons (now no row is selected)*/
			this.onRowDeselect(this.selModel);
			}
		},

	/* enable disable edit button */
	onRowSelect: function(SelectionModel){
		this.deleteBtn.setDisabled(false);
		Ext.ux.crudGridPanel.crudPagingGrid.superclass.onRowSelect.call(this);
		},
	onRowDeselect: function(SelectionModel){
		this.deleteBtn.setDisabled(true);
		Ext.ux.crudGridPanel.crudPagingGrid.superclass.onRowDeselect.call(this);
		},
	/* overload of the storage creation method */
	buildStore: function(configStore){
		return new Ext.ux.crudGridPanel.crudStore(configStore);
		},
	/* Basic parameters of the object */
	deleteTitle		: 'Confirmación',
	deleteMsg		: '¿Está seguro que desea eliminar el registro seleccionado?',
	deleteButtonText: 'Eliminar',
	deleteIconCls	: ''

});

/* GridPanel create mode enabled and special nullified w/o delete the record */

/* 

	inherits rPagingGrid configuration parameters. These are added by the class:


	configForm			: Configuration object for the Form creation  

	invalidTitle		: Title of the Error msgBox form data is invalid (defult: 'Error al inrgesar')
	invalidMsg			: Msg of the Error msgBox form data is invalid (defult: 'Los datos ingresados no son validos')

	addWindowTitle		: Title of the Form Window when Adding an item (defult: 'Nuevo elemento')
	addButtonText		: Text of the Gridpanel Add button (defult: 'Agregar')
	addIconCls			: iconCls of the Add button and Add Form Window (default: TDGi.iconMgr 'add' )

	cancelButtonText	: Text of the Gridpanel Cancel/Null button (defult: 'Anular')
	cancelIconCls		: iconCls of the Cancel button (default: TDGi.iconMgr 'error' )

	cancelTitle			: Title of the Cancel msgBox confirmation (defult: 'Confirmación')
	cancelMsg			: Msg of the Cancel msgBox confirmation (defult: '¿Está seguro que desea anular el registro seleccionado?')

	validFielName		: Field of the record where the valid bool parameter is stored (default: 'valid')
	canceledCls			: Aditional CSS class for the invalid records (default: '')

*/
Ext.ux.crudGridPanel.crPagingGrid = Ext.extend(Ext.ux.crudGridPanel.rPagingGrid, {
	constructor: function(config){
		this.addIconCls = config.addIconCls ? config.addIconCls : Ext.ux.TDGi.iconMgr.getIcon('add');
		this.cancelIconCls = config.editIconCls ? config.editIconCls : Ext.ux.TDGi.iconMgr.getIcon('error');

		if(config.validFieldName)
			this.validFieldName = config.validFieldName;
		if(config.canceledCls)
			this.canceledCls = config.canceledCls;

		if(config.addButtonText)
			this.addButtonText = config.addButtonText;
		if(config.cancelButtonText)
			this.cancelButtonText = config.cancelButtonText;
	/* Grid Configuration */
		config = Ext.apply({
			listeners	: this.setListeners()
			}, config);

		Ext.ux.crudGridPanel.crPagingGrid.superclass.constructor.call(this,config);

		this.form = this.buildForm(config.configForm);

		},
	buildForm: function(config){
		configWindow = {
			title		: this.addWindowTitle,
			iconCls		: this.addIconCls,
			listeners	: {
					scope		: this,
					savebtn		: this.onCreate,
					previewbtn	: this.onPreview,
					closebtn	: this.onClose
					},
			configForm: config
			};

		return new Ext.ux.crudGridPanel.baseWindowForm(configWindow);
		},
	/* default top bar in the cru mode */
	buildTbar: function(){
		return [ {
			text	: this.addButtonText,
			iconCls	: this.addIconCls,
			scope	: this,
			handler	: this.onAdd
			} , '->', {
			text	: this.cancelButtonText,
			ref		: '../cancelBtn',
			iconCls	: this.cancelIconCls,
			disabled: true,
			scope	: this,
			handler	: this.onCancel
			} ];
		},
	/* manually destroy the form window */
	onDestroy: function(){
		this.form.destroy();
		},
	onPreview: Ext.emptyFn,
	/* show a clean form to create a new record */
	onAdd: function(){
		/* Cleanup! */
		this.form.show();
		this.form.getForm().reset();
		},
	/* Take te form values and add the record to the storage (if valid)*/
	onCreate: function(){
		if (!this.form.getForm().isValid()){
			Ext.Msg.show({
			    title	: this.invalidTitle,
			    msg		: this.invalidMsg,
			    icon	: Ext.MessageBox.ERROR,
			    buttons	: Ext.Msg.OK
				});
			return false;
			}
		else{
	/* force each new creation to be valid */
			var record = new this.store.recordType(this.form.getForm().getValues());
			record.set(this.validFieldName,"on");
			this.store.add(record);
			this.store.reload();
			this.form.hide();
			}
		},
	onCancel: function(){
		Ext.MessageBox.confirm(this.cancelTitle, this.cancelMsg , this.doCancel, this);
		},
	doCancel: function(Button){
		if(Button == 'yes'){
			var record = this.selModel.getSelected();
			if(!record)
				return false;

			record.set(this.validFieldName,false);
			record.commit();

			/* Call method to disable buttons */
			this.onRowDeselect();
			}
		},
	/* customize the viewConf to give the canceled records a special class */
	buildViewConf: function() {

		return new Ext.grid.GridView({
				forceFit		: true,
				validFieldName	: this.validFieldName,
				canceledCls		: this.canceledCls,
				getRowClass		: this.getRowClass
				});

		},
	getRowClass: function(Record){
		if(!Record.get(this.validFieldName))
			return this.canceledCls;
		},
	/* back button pressed, changes dissmised*/
	onClose: function(){
		this.form.hide();
		},
	/* enable/disable buttons */
	onRowSelect: function(SelectionModel){
		var record = this.selModel.getSelected();
		if(!record){
			this.cancelBtn.setDisabled(true);
			return false;
			}

		if(!record.get(this.validFieldName))
			this.cancelBtn.setDisabled(true);
		else
			this.cancelBtn.setDisabled(false);

		},
	onRowDeselect: function(SelectionModel){
		this.cancelBtn.setDisabled(true);
		},
	/* overload of the storage creation method */
	buildStore: function(configStore){
		return new Ext.ux.crudGridPanel.cruStore(configStore);
		},
	setListeners: function(){
		return {
			scope			: this,
			datachanged		: this.onRowDeselect,
			rowselect		: this.onRowSelect,
			rowdeselect		: this.onRowDeselect,
			beforedestroy	: this.onDestroy
			};
		},
	/* Basic parameters of the object */
	invalidTitle	: 'Error al inrgesar',
	invalidMsg		: 'Los datos ingresados no son validos',
	addWindowTitle	: 'Nuevo elemento',
	addButtonText	: 'Agregar',
	cancelButtonText: 'Anular',

	cancelTitle		: 'Confirmación',
	cancelMsg		: '¿Está seguro que desea anular el registro seleccionado?',

	addIconCls		: '',
	cancelIconCls	: '',
	validFielName	: 'valid',
	canceledCls		: ''

});
