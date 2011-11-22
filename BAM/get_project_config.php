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

$dom = new DOMDocument('1.0', 'utf-8');
$dom->formatOutput = true;

$xml = $dom->createElement('project_config');
$dom->appendChild($xml);

//////////////////Encabezado(top)/////////////////////////

$element = $dom->createElement('name',$conf->account_manager->name);
$xml->appendChild($element);		
$element = $dom->createElement('min_passwd_length',$conf->account_manager->min_passwd_length);
$xml->appendChild($element);	
$element = $dom->createElement('account_manager');
$xml->appendChild($element);
$element = $dom->createElement('uses_username');
$xml->appendChild($element);
$element = $dom->createElement('client_acount_creation_disabled');
$xml->appendChild($element);

echo $dom->saveXML();	 
?>		
