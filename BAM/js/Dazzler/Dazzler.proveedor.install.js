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

Dazzler.manager.installPanel = Ext.extend(Ext.Panel, {

	constructor: function(config){

	config = Ext.apply({
		}, config);

	Dazzler.manager.installPanel.superclass.constructor.call(this,config);
	},

	title: 'Información sobre la Instalacion de nuevos nodos',

	html: '<h1>Metodo de instalación de BOINC</h1>\
		  <p>Esta es la manera recomendada para agregar nuevos nodos a su cuenta de SCV. Este procedimiento es compatible con las versiones de windows 2000, XP, Vista y 7</p>\
		<ul>\
		<li> Descarge la última version del cliente de BOINC <a href=\"http://boinc.berkeley.edu/download.php\" >aqui</a>.\
		<li> Descargue los scripts de instalación <a href=\"/BAM/download/Instalador_BOINC.zip\">aqui</a>.\
		<li> Descarque el archivo de dazzler <a href=\"/BAM/download/acct_mgr_url.php\">aqui</a>.\
		<li> Descarque el archivo de autentificación de su cuenta <a href=\"/BAM/download/acct_mgr_login.php\">aqui</a>.\
		</ul>\
		<p>Descomprima los scripts de instalación y copie el archivo de autentificación descargado. Luego copie el archivo de instalación del cliente de boinc cambiando su nombre (ej: boinc_6.10.60_windows_intelx86.exe ) por boinc_windows.exe</p>\
		<p>Ejecute el archivo de Instalar.bat, que se encargará de instalar y configurar de manera automatica el cliente de boinc al sistema, podrá ver de inmediato el nuevo equipo en el sistema.</p>\
		<p>Para informacion adicional de instalaciones personalizadas o de instalación en otras plataformas contactarse con scv@ing.udec.cl.</p>'
});
";

}

function App_show(){

return "
SCV.mainContent.add( new Dazzler.manager.installPanel() );
SCV.mainContent.doLayout();
";
}

