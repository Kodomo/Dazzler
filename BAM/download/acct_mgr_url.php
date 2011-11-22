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


header("Cache-Control: no-store, no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Content-Disposition: attachment; filename=\"acct_mgr_url.xml\"");
echo "<acct_mgr>
<name>{$conf->account_manager->name}</name>
<url>{$conf->account_manager->master_url}</url>
</acct_mgr>";

?>
