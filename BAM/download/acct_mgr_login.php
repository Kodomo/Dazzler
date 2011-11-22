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

require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Db.inc.php';
$DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');

$n = $DB->Consulta("select users.id,login,weakhash from (usuarios left join users on(users.id = usuarios.id)) where sesion = {$_SESSION['SesionId']}");
if(!$n)
	die("SSID: {$_SESSION['SesionId']}");

list($id,$login,$weak) = $DB->SacaTupla();

$weakHash = "{$id}_{$weak}";

$rand = md5 (time()); //random string

ob_end_clean();

header("Cache-Control: no-store, no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Content-Disposition: attachment; filename=\"acct_mgr_login.xml\"");
echo "<acct_mgr_login>
<login>$weakHash</login>
<password_hash>$rand</password_hash>
<next_rpc_time>0</next_rpc_time>
</acct_mgr_login>";

?>
