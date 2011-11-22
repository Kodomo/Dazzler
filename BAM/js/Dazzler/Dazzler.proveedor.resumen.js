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

Dazzler.proveedor.resumenPanel = Ext.extend(Ext.TabPanel, {
	constructor: function(config){


	/* Creacion de paneles */
		this.infoForm = new Ext.FormPanel({
		    frame			: true, 
		    title			:'Resumen', 
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('information'),
		    defaultType		:'displayfield',
			baseParams		: {xid: %xid%, 'form': 'info'},
			listeners		: {afterrender : this.afterrender, scope: this.infoForm },
			api				: {load: Dazzler.api.loadForm },
			paramsAsHash	: true,
			items			: this.buildInfoForm()
		});


		this.projectGrid = new Ext.ux.crudGridPanel.rPagingGrid({
			defaultDesc		: 'proyectos',
			title			: 'Recursos por proyecto',
			iconCls			: Ext.ux.TDGi.iconMgr.getIcon('world'),
			baseParams		: {xid: %xid%, 'store': 'projects' },
			defaulPageSize	: 25,
			configStore		: { buildFields: this.buildStoreProject },

			buildColumns	: this.buildColumnsProject

		});


		config = Ext.apply({
			activeTab: 0,
			plain:true,
			region:'center',
			items: [ this.infoForm, this.projectGrid ]
			}, config);

		Dazzler.proveedor.resumenPanel.superclass.constructor.call(this,config);
	},
/* ************************* configuracion de los diferentes Stores ************************* */
	/* Project Grid Store definition */
	buildStoreProject: function(){
		return ['id', 'name', 'url', 'resource_share', {name: 'suspend', type: 'boolean'}, {name: 'detach_when_done', type: 'boolean'} ];
		},

/* ************************* Configuracion de los diferentes Grid Columns ************************* */
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
/* ************************* Configuracion de los otros Forms ************************* */
	afterrender: function(){
		this.getForm().load({ });
	},
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
		}

});
";

}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.proveedor.resumenPanel() );
SCV.mainContent.doLayout();
";

}

function DirectRead($DB, $Data){
$out = array();

$out['root'] = array();

$DB->Consulta("select count(distinct(pid)) from configProjects where gid in (select id from groups where uid = %uid%);");
$t = $DB->SacaTupla();
$out['totalCount'] = $t[0];

$DB->Consulta("select distinct(projects.id), name, url from (configprojects left join projects on (configprojects.pid = projects.id)) where gid in (select id from groups where uid = %uid%) order by {$Data->sort} {$Data->dir} offset {$Data->start} limit {$Data->limit};");

while($t = $DB->SacaTupla(false)){

	$out['root'][] = $t;
	}

$out['success'] = true;
return $out;

}

function loadForm($DB, $Data){
$out = array();

$out['data'] =  array();
$twoweeks = time() - 13.5 * 24 * 3600; 

$AH = $DB->Consulta("select count(*) as hosts, sum(cpus) as proc, sum(cpus*mips) as mips, sum(cpus*flops) as flops from hosts where gid in (select id from groups where uid = %uid%) and last_contact >= $twoweeks;");
if($AH > 0){
	$Hosts = $DB->SacaTupla(false);
	}
else{
	$Hosts = array('hosts'=>'0','proc'=>'0','mips'=>'0','flops'=>'0');
	}

$DB->Consulta("select count(*) as hosts, sum(cpus) as proc, sum(cpus*mips) as mips, sum(cpus*flops) as flops  from hosts where gid in (select id from groups where uid = %uid%) and last_contact < $twoweeks;");
$InactiveHosts = $DB->SacaTupla();
if($InactiveHosts['hosts'] > 0){
	$Hosts['hosts'] .= " (" . $InactiveHosts['hosts'] . " inactivos)";
	$Hosts['proc'] .= " (" . $InactiveHosts['proc'] . " inactivos)";
	$Hosts['mips'] .= " (" . $InactiveHosts['mips'] . " inactivos)";
	$Hosts['flops'] .= " (" . $InactiveHosts['flops'] . " inactivos)";
	}

$Proyectos = $DB->Consulta("select distinct(pid) from configprojects where gid in (select id from grupos where uid = %uid%);");
$Proj['projects'] = "$Proyectos activos";


$out['data'] = array_merge($Hosts, $Proj);
$out['success'] = true;

return $out;
}
