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

$conf = simplexml_load_file("lib/Dazzler.conf");
require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/XmlReply.inc.php';

/* ********************************************************************************************* */
/* **************************** Create Reply Object ******************************************** */
/* ********************************************************************************************* */
$XmlReply = new XmlReply();

/* ********************************************************************************************* */
/* **************************** Check for valid RPC (XML Request) ****************************** */
/* ********************************************************************************************* */
if(!$XmlReply->loadXml( file_get_contents('php://input') )){
	die( $XmlReply->getXml() );
	}
/* ********************************************************************************************* */
/* **************************** Check for host/user account ************************************ */
/* ********************************************************************************************* */
$XmlReply->checkHost();

/* ********************************************************************************************* */
/* *********************************** Building response *************************************** */
/* ********************************************************************************************* */
				
/* ******************************* global preferences ************************************ */
$XmlReply->addPreferences();

/* **************************** projects related reply *********************************** */
$XmlReply->addProjects();

/* ************************************* opaque ****************************************** */
$XmlReply->addOpaque();


echo $XmlReply->getXml();
?>		
