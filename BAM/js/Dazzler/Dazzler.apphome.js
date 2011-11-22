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
Ext.ns('Dazzler');
/* Panel administracion de contenido */

Dazzler.appHome = Ext.extend(Ext.Panel, {
	title: 'SCV Home',
	autoScroll: true,
	autoLoad: '/BAM/js/Welcome.html'
	});
";
}

function App_show(){

return "
SCV.mainContent.add(new Dazzler.appHome() );
SCV.mainContent.doLayout();
";
}

