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
require ('../lib/class/Response.inc.php');
$IconsURL = $conf->conf->iconMgr_base_url;
session_start();
session_name($conf->conf->session_name);

ob_start();

require("../lib/RegistraVisita.inc.php");
$Respuesta = new Response($HTTP_RAW_POST_DATA,$_POST, $_FILES);

if($IdentificadorUsuario == 0){//Usuario no autentificado, acceso solo a rutinas de logeo
	$Respuesta->guestRequests();
	}
else{
	$Respuesta->userRequest();
	}
$warnings = ob_get_clean();
if(!empty($warnings)){
	$event = array('type'=>'exception','where'=>'dummy','message'=>$warnings);
	$Respuesta->addResponse($event);
	}
if(!empty($LogedOn)){
	$event = array('type'=>'event','name'=>'lpc','data'=>'machine');
	$Respuesta->addResponse($event);
	}

$Respuesta->echoResponse();
?>
