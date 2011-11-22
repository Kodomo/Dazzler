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

$IdentificadorUsuario = 0;
if(isset($_SESSION['SesionId'])){

	require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Db.inc.php';
	$DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');
	$n = $DB->Consulta("select id from usuarios where sesion = {$_SESSION['SesionId']}");
	if($n){
		list ($IdentificadorUsuario) = $DB->Sacatupla();
		$now = time();
		$DB->Consulta("update sesiones set fin=$now where id = {$_SESSION['SesionId']}"); 
		}
	else{
		$n = $DB->Consulta("select estado from sesiones where id = {$_SESSION['SesionId']}");
		if($n){
			list ($estado) = $DB->Sacatupla();
			if($estado == 3)
				$LogedOn = true;
			}
		}
	unset( $DB );
	}
?>
