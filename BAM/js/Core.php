<?
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

$conf = simplexml_load_file("../lib/Dazzler.conf");

session_start();
session_name($conf->conf->session_name);
ob_start();

require("../lib/RegistraVisita.inc.php");

header("Cache-Control: no-store, no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Content-Type: application/x-javascript; charset=UTF-8");

if($IdentificadorUsuario == 0){
	?>
	Ext.onReady(function(){

		Ext.QuickTips.init();
        Ext.Direct.addProvider({
			"type":"remoting",
			"url":"\/BAM\/js\/rpc.php",
			"actions": {"Remote":[{"name":"login","len":1, "formHandler":true}]}
			});

	 
		Dazzler.logWin = new Dazzler.core.loginWindow({});
	});

	<?
	}
else{
	?>
	Ext.onReady(function(){
		Ext.QuickTips.init();

		Ext.Direct.addProvider({
			"type"			:"remoting",
			"url"			:"\/BAM\/js\/rpc.php",
			"timeout"		: 90000,
			"enableBuffer"	: 100,
			"actions"		: {
							"core":[{"name":"getTree","len":1},{"name":"Logout","len":0},{"name":"show","len":2},{"name":"userGroups","len":1},{"name":"userSession","len":1},{"name":"UserLoad","len":1},{"name":"UserSave","len":1, "formHandler":true}],
							"api":[{"name":"customFn","len":1},{"name":"submitForm","len":1, "formHandler":true},{"name":"loadForm","len":1},{"name":"getTree","len":1},{"name":"DirectRead","len":1},{"name":"DirectCreate","len":1},{"name":"DirectUpdate","len":1},{"name":"DirectDestroy","len":1},{"name":"show","len":2}]
							},
			"namespace"		: "Dazzler"
		});


		Ext.Direct.on('lpc',function(e){
			if(e.data == 'login'){
				Ext.Msg.alert('Conexión', 'La conexión ha expirado, debe identificarse nuevamente para utilizar el sistema.',function(){window.location = '/BAM/';});
				}
			else if(e.data == 'machine'){
				Ext.Msg.alert('Conexión', 'Ha ingresado desde otra ubicación. Sólo se permite una sessión activa por usuario.',function(){window.location = '/BAM/';});
				}
			else{
				Ext.Msg.alert('Advertencia', e.data);
				}
			});

		SCV = new Dazzler.core.aplication({
			titleId	    : 'Dazzler-header',
			titleContent: '<img style="width:31px;height:31px;margin-top:1px;float:left;margin-left:5px;margin-right:10px;" src="<? echo $conf->conf->logo ?>"><div id="Dazzler-Title" class="Dazzler-title">Dazzler - <? echo $conf->account_manager->name ?></div>'
			});

		});
	<?
	}
ob_end_flush();
?>
