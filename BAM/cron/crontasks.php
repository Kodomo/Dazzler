<?php 
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

require_once '../lib/class/Db.inc.php';
require_once '../lib/class/XmlRequest.inc.php';

$DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');
$XmlRequest = new XmlRequest();

$DB->Consulta("select id from projects where estado <= 0;");
while($info = $DB->SacaTupla()){
	$XmlRequest->setProject($info[0]);
	$XmlRequest->createAccounts();
	$XmlRequest->deleteDetaching();
	$XmlRequest->getStats();
	$XmlRequest->saveStatus();
	}

$log = fopen("crontask.log","w");
$msg = implode("\n",$XmlRequest->Msg);
fwrite($log,$msg);
fclose($log);

?>
