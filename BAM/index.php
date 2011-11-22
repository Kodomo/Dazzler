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

$conf = simplexml_load_file("lib/Dazzler.conf");
?>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Dazzler - VCSC Manager</title>

	<link rel="stylesheet" type="text/css" href="/BAM/css/dazzler.css" />
	<link rel="stylesheet" type="text/css" href="<? echo $conf->conf->ext_base_url ?>/resources/css/ext-all.css" />
</head>
<body>
<div id="header"></div>
<div id="loading"></div>
	<!-- EXT -->
 	<script type="text/javascript" src="<? echo $conf->conf->ext_base_url ?>/adapter/ext/ext-base-debug.js"></script>
	<script type="text/javascript" src="<? echo $conf->conf->ext_base_url ?>/ext-all-debug.js"></script>
 	<!-- LIBS -->
	<script type="text/javascript" src="<? echo $conf->conf->iconMgr_url ?>/TDGi.iconMgr.js"></script>
	<script type="text/javascript" src="<? echo $conf->conf->ext_ux_base_url ?>/ux-all-debug.js"></script>
	<link rel="stylesheet" type="text/css" href="<? echo $conf->conf->ext_ux_base_url ?>/css/ux-all.css" />

 	<!-- PROJECT SPECIFIC LIBS -->
	<script type="text/javascript" src="/BAM/js/crudGridPanel.js"></script>
	<script type="text/javascript" src="/BAM/js/Dazzler.core.js"></script>
 	<!-- ENDLIBS -->

	<script type="text/javascript" src="js/Core.php"></script>
</body>
</html>
