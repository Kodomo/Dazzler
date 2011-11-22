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


require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Db.inc.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Usuario.inc.php';
class BogusAction {
	public $action;
	public $method;
	public $data;
	public $tid;
}

class Response{

	public $Peticiones;

    public $dataout;
    public $datain;

	public $Loaded;

    public $Error;
	public $isForm;
	public $isUpload;
	public $Valido;
    
// Conexiones a Bases de Datos
    protected $User;
    protected $DB; //Conexion de Base de datos del Objeto.

    // Crear un objeto usuario, criterios Login, Rut.
    function __construct($rawdata,$post, $files){
		global $IdentificadorUsuario;
		global $conf;
        $this->DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');
        $this->User = new Usuario($IdentificadorUsuario);
		$this->Loaded = array();

		$this->Load($rawdata,$post, $files);
        
		return $this->Valido;
    }

	function Load($rawdata,$post=array(), $files=array()){

		if(isset($rawdata)){
//			header('Content-Type: text/javascript');
			$this->datain = json_decode($rawdata);

			$this->isForm = false;
			$this->isUpload = false;
			$this->Valido = true;
			$this->Peticiones = count($this->datain);
			$this->dataout = null;

		}else if(isset($post['extAction'])){ // form post
			$this->datain = new BogusAction();
			$this->datain->action = $post['extAction'];
			$this->datain->method = $post['extMethod'];
			$this->datain->tid = isset($post['extTID']) ? $post['extTID'] : null; // not set for upload
			$this->datain->data = array_merge($post, $files);

			$this->dataout = null;
			$this->isUpload = $post['extUpload'] == 'true';
			$this->isForm = true;
			$this->Valido = true;
			$this->Peticiones = 1;
		}else{
			$this->dataout = null;
	        $this->Valido = false;
	        $this->Error = "Invalid Request";
			$this->Peticiones = 0;
		}

	}
	function addResponse($res){
	if($this->dataout == null)
		$this->dataout = $res;
	elseif(!isset($this->dataout[0])){
		$this->dataout = array($this->dataout);
		$this->dataout[] = $res;	
		}
	else{
		$this->dataout[] = $res;
		}
	}

	function echoResponse(){
		header("Cache-Control: no-store, no-cache");
		echo json_encode($this->dataout);
		}

    function guestRequests(){
		if($this->Peticiones == 1)
			$this->doGuestRPC($this->datain);
		else{
			foreach($this->datain as $datain){
				$this->doGuestRPC($datain);
				}
			}
        }

    function userRequest(){
		if($this->Peticiones == 1)
			$this->doUserRPC($this->datain);
		else{
			foreach($this->datain as $datain){
				$this->doUserRPC($datain);
				}
			}
        }

	function doGuestRPC($request){
		global $IdentificadorUsuario;
		$response = array('type'=>'rpc','tid'=>$request->tid,'action'=>$request->action,'method'=>$request->method,'level'=>'Guest' );
		if(!strcmp($request->action, 'Remote')){ /* Accion unica */
			if(!strcmp($request->method, 'login')){/* Metodo único, logueo */

				$params = isset($request->data) && is_array($request->data) ? $request->data : array();
				$loginUsername = isset($params["loginUsername"]) ? $params["loginUsername"] : "";
				$elogin = $this->DB->EscapeString($loginUsername);
				$epass = $this->DB->EscapeString($params["loginPassword"]);

				$n = $this->DB->Consulta("select id,activo from usuarios where login = '{$elogin}' and clave = '{$epass}'");
				if ($n == 1){
					list ($IdentificadorUsuario,$activo)  = $this->DB->Sacatupla();
	// Check for current sessions
	$this->DB->Consulta("select sesion from usuarios where id = {$IdentificadorUsuario}");
	list ($lasSSID) = $this->DB->SacaTupla();
	if(	$lasSSID > 0){ //- dirty logout!
		$this->DB->Consulta("select fin,estado from sesiones where id = {$lasSSID}");
		list ($UltimoT, $EstadoF) = $this->DB->SacaTupla();
		$Delta = $UltimoT - time();
		if(($EstadoF == 0) && ($Delta < 900)){
			//- conectado y ultimo acceso hace menos de 15 minutos
			//- Considera desconexion por logeo de otra ubicacion
			$this->DB->Consulta("update sesiones set estado=3 where id = {$lasSSID}"); 
			}
		elseif($EstadoF == 0){ 
			//- conectado y ultimo acceso hace +15 minutos
			//- Considera timeout
			$this->DB->Consulta("update sesiones set estado=2 where id = {$lasSSID}"); 
			}
		else{
			//- no conectado? 
			//- Considera error 
			}
		}


	//Fill session data!
    if (!empty($HTTP_SERVER_VARS["HTTP_X_FORWARDED_FOR"])){
        $Ip = $HTTP_SERVER_VARS["HTTP_X_FORWARDED_FOR"];
    }else{
        $Ip = $_SERVER["REMOTE_ADDR"];
    }
    require($_SERVER['DOCUMENT_ROOT'].'/BAM/lib/GeoIp/geoip.inc.php');

    $gi = geoip_open($_SERVER['DOCUMENT_ROOT']."/BAM/lib/GeoIp/GeoIP.dat",GEOIP_STANDARD);
    $cid = geoip_country_id_by_addr($gi, $Ip);
	
	require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Plataforma.inc.php';
	$Plat = new Plataforma($_SERVER['HTTP_USER_AGENT']);

	$pixels = intval($params["spixels"]);
	$ancho = intval($params["swidth"]);
	
	$IpL = ip2long($Ip);
	$EUA = $this->DB->EscapeString($_SERVER['HTTP_USER_AGENT']);

    $Ahora = time();
    $this->DB->Consulta("select nextval('sesiones_id_seq'::regclass)");
	list($nextid) = $this->DB->SacaTupla();
					if($activo == 0){
    $this->DB->Consulta("insert into sesiones (id,inicio,fin,usuario,estado,ip,useragent,so,navegador,pais,p,w) Values($nextid,$Ahora,$Ahora,$IdentificadorUsuario,5,$IpL,'$EUA',{$Plat->NumOs},{$Plat->NumBrow},$cid,$pixels,$ancho)");
	$this->DB->Consulta("update usuarios set sesion=0 where id = {$IdentificadorUsuario}");
						$response['result']["success"] = false;
						$response['result']["error"]["reason"] = "Esta cuenta ha sido desactivada por el administrador del sistema.";
						}
					else{
    $this->DB->Consulta("insert into sesiones (id,inicio,fin,usuario,estado,ip,useragent,so,navegador,pais,p,w) Values($nextid,$Ahora,$Ahora,$IdentificadorUsuario,0,$IpL,'$EUA',{$Plat->NumOs},{$Plat->NumBrow},$cid,$pixels,$ancho)");
    
	$_SESSION['SesionId'] = $nextid;
	$this->DB->Consulta("update usuarios set sesion=$nextid where id = {$IdentificadorUsuario}");

						$response['result']["success"] = true;
						}
					}
				else {
					$response['result']["success"] = false;
					$response['result']["error"]["reason"] = "Nombre de usuario o clave incorrecta. Inténtelo nuevamente.";
					}
				}
			else{
				$response['result']["success"] = false;
				$response['result']["error"]["reason"] = "Método desconocido: ".$request->action.".".$request->method;
				}
			}
		elseif(!strcmp($request->action, 'core')){ /* Acciones de la aplicacion */
			if(!strcmp($request->method, 'Logout')){
					unset($_SESSION);
					$response['result']["success"] = true;
					}
			else{
				/* Cualquier otro evento indica que el usuario esta realmente deslogueado */

				$event = array('type'=>'event','name'=>'lpc','data'=>'login');
				$this->addResponse($event);
				$response['result']["success"] = false;
				$response['result']["error"]["reason"] = "Método desconocido: ".$request->action.".".$request->method;
				}
			}
		else{
			$response['result']["success"] = false;
			$response['result']["error"]["reason"] = "Acción desconocida: ".$request->action;

			/* Se asume que intento acceder una RPC de usuario logueado, envia evento de logeo */

			$event = array('type'=>'event','name'=>'lpc','data'=>'login');
			$this->addResponse($event);
			}
	$this->addResponse($response);
	}

	function doUserRPC($request){
		
		$response = array('type'=>'rpc','tid'=>$request->tid,'action'=>$request->action,'method'=>$request->method,'level'=>'User' );

		if(!strcmp($request->action, 'core')){ /* Acciones de la aplicacion */
			if(!strcmp($request->method, 'getTree')){/* Metodo para obtener los nodos del Treepanel */
				list($crap,$nid) = explode('.',$request->data[0]);
				$tree = array();
				$this->DB->Consulta("select contenido.id as xid,contenido.tipo,contenido.hijos,contenido.nombre as text,contenido.icon as xicon from 
				(contenido 
					left join gcontenido on (contenido.id = gcontenido.cid))
				where contenido.id > 1 and contenido.pid = {$nid} and gcontenido.gid in (select gid from gusuarios where uid = {$this->User->Uid}) order by contenido.pos asc;");

				while($el = $this->DB->Sacatupla(false)){
					if ($el['hijos'] > 0)
						$el['leaf'] = false;
					else
						$el['leaf'] = true;

					$el['id'] = 'menunode.'.$el['xid'];

	            	$tree[$el['xid']] = $el;
					}
				$response['result'] = array_values($tree);
				}
			elseif(!strcmp($request->method, 'show')){
					$contentId = intval($request->data[0]);
					if($contentId > 0){
						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}
						if(function_exists ( "App_show" )){
							$show = App_show();
							$response['result']["success"] = true;
							$response['result']["nodeid"] = $contentId;

							if($request->data[1]){
								if(function_exists ( "App_define" )){
									$define = App_define();
									}
								$response['result']['show'] = "<script>$define $show</script>";					

								}
							else{
								$response['result']['show'] = "<script>$show</script>";				
								}
							}
						else{
							$response['result']["success"] = false;
							$response['result']["error"]["reason"] = "Show is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["error"]["reason"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'Logout')){
					$now = time();
					$this->DB->Consulta("update sesiones set fin=$now,estado=1 where id = {$_SESSION['SesionId']}");
					$this->DB->Consulta("update usuarios set sesion=0 where id = {$this->User->Uid}");
					session_destroy();
					$response['result']["success"] = true;
					}
			elseif(!strcmp($request->method, 'userGroups')){
					$response['result'] = array();
					$response['result']['groups'] = array();
					$this->DB->Consulta("select count(*) from gusuarios where uid={$this->User->Uid}");
					list ($response['result']['totalCount']) = $this->DB->SacaTupla();

					$this->DB->Consulta("select id,nombre from grupos where id in (select gid from gusuarios where uid = {$this->User->Uid}) order by {$request->data[0]->sort} {$request->data[0]->dir} offset {$request->data[0]->start} limit {$request->data[0]->limit};");

					while($t = $this->DB->SacaTupla(false)){
						$response['result']['groups'][] = $t;
						}
					$response['result']['success'] = true;

					}
			elseif(!strcmp($request->method, 'userSession')){
					$response['result'] = array();
					$response['result']['sessions'] = array();
					$this->DB->Consulta("select count(*) from sesiones where usuario={$this->User->Uid}");
					list ($response['result']['totalCount']) = $this->DB->SacaTupla();
					require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Plataforma.inc.php';
					$Plat = new Plataforma();

					$this->DB->Consulta("select id,inicio,fin,ip, estado, useragent,so,navegador,pais,p,w from sesiones where usuario={$this->User->Uid} order by {$request->data[0]->sort} {$request->data[0]->dir} offset {$request->data[0]->start} limit {$request->data[0]->limit};");

					while($t = $this->DB->SacaTupla(false)){
						$o['ip'] = long2ip($t['ip']);
						$o['iptxt'] = $Plat->GEOIP_COUNTRY_NAMES[$t['pais']] . " ({$o['ip']})";
						$o['ipcls'] = $Plat->GEOIP_COUNTRY_CODES[$t['pais']];
						
						$o['inicio'] = date('H:i:s d/m/Y',$t['inicio']);
						$o['fin'] = date('H:i:s d/m/Y',$t['fin']);

						$duracion = $t['fin']-$t['inicio'];
						$o['duracion'] = '';
						$d=$h=$m=0;
						if($duracion > 86400){
							$d = floor($duracion / 86400);
							$duracion -= $d * 86400;
							}
						if($duracion > 3600){
							$h = floor($duracion / 3600);
							$duracion -= $h * 3600;
							}
						if($duracion > 60){
							$m = floor($duracion / 60);
							$duracion -= $m * 60;
							}

						if($d>1)
							$o['duracion'] .= "$d días, ";
						elseif($d)
							$o['duracion'] .= "1 día, ";
						if($h>1)
							$o['duracion'] .= "$h horas, ";
						elseif($h)
							$o['duracion'] .= "1 hora, ";
						if($m>1)
							$o['duracion'] .= "$m minutos, ";
						elseif($m)
							$o['duracion'] .= "1 minuto, ";

						if($duracion!=1)
							$o['duracion'] .= "$duracion segundos";
						else
							$o['duracion'] .= "1 segundo";


						$o['resolucion'] = $t['w'].'x'.$t['p']/$t['w'];

						$o['sotxt'] = $Plat->SO[$t['so']];
						$o['socls'] = $Plat->SO_ico[$t['so']];
						$tmp = 100* intval($t['navegador']/100);
						$o['navegadortxt'] = $Plat->Navegador[$tmp];
						$o['navegadorcls'] = $Plat->Navegador_ico[$tmp];

						$o['useragent'] = $t['useragent'];

						$o['estado'] = $t['estado'];
						if($t['estado'] == '0'){
							$o['estadotxt'] = "Conectado";
							}
						elseif($t['estado'] == '1'){
							$o['estadotxt'] = "Desconectado";
							}
						elseif($t['estado'] == '2'){
							$o['estadotxt'] = "Timeout";
							}
						elseif($t['estado'] == '3'){
							$o['estadotxt'] = "Inicio desde otra ubicación";
							}
						elseif($t['estado'] == '5'){
							$o['estadotxt'] = "Usuario desactivado";
							}


						$o['id'] = $t['id'];
				
						$response['result']['sessions'][] = $o;
						}
					$response['result']['success'] = true;
					}
			elseif(!strcmp($request->method, 'UserLoad')){
					$response['result'] = array();
					$response['result']['data'] = array();
					$response['result']['data']['login'] = $this->User->Login;
					$response['result']['data']['nombre']= $this->User->Nombre;
					$response['result']['data']['cargo']= $this->User->Cargo;
					$response['result']['data']['correo']= $this->User->Correo;
					$response['result']['success'] = true;
					}
			elseif(!strcmp($request->method, 'UserSave')){
					if(!strcmp($request->data['aclave'],$this->User->Contrasena)){
						$Escaped  = $this->DB->EscapeArray($request->data,array('nclave','nombre','correo','cargo'));
						if(!strcmp($request->data['cclave'],$request->data['nclave']) && (strlen($request->data['nclave']) >= 6 )){
							$this->DB->Consulta("update usuarios set clave='{$Escaped['nclave']}', nombre='{$Escaped['nombre']}' where id = {$this->User->Uid}");
							}
						else{
							$this->DB->Consulta("update usuarios set nombre='{$Escaped['nombre']}' where id = {$this->User->Uid}");
							}
						$response['result'] = array();
						$response['result']['success'] = true;
						}
					else{
						$response['result'] = array();
						$response['result']["error"]["reason"] = "La clave ingresada es incorrecta.";
						$response['result']['success'] = false;
						}
					}
			else{
				$response['result']["success"] = false;
				$response['result']["error"]["reason"] = "Método desconocido: ".$request->action.".".$request->method;
				}
			}
		elseif(!strcmp($request->action, 'api')){ /* Acciones de la API */
			if(!strcmp($request->method, 'DirectRead')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){
						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "DirectRead" )){
							$response['result'] = DirectRead($this->DB,$request->data[0]);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "DirectRead is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'DirectCreate')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "DirectCreate" )){
							$response['result'] = DirectCreate($this->DB,$request->data[0]);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "DirectCreate is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'DirectUpdate')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "DirectUpdate" )){
							$response['result'] = DirectUpdate($this->DB,$request->data[0]);

							}
						else{
							$response['result']["users"] = array();
							$response['result']["success"] = false;
							$response['result']["msg"] = "DirectUpdate is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'DirectDestroy')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);

							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "DirectDestroy" )){
							$response['result'] = DirectDestroy($this->DB,$request->data[0]);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "DirectDestroy is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'getTree')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "getTree" )){
							$response['result'] = getTree($this->DB,$request->data[0]);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "getTree is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'loadForm')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "loadForm" )){
							$response['result'] = loadForm($this->DB,$request->data[0]);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "loadForm is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'submitForm')){
					$contentId = intval($request->data['xid']);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido,tipo from contenido where id = $contentId;");
							list($code,$tipo) = $this->DB->SacaTupla();
							if($tipo == 2){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( "submitForm" )){
							$response['result'] = submitForm($this->DB,$request->data);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "submitForm is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			elseif(!strcmp($request->method, 'customFn')){
					$contentId = intval($request->data[0]->xid);
					if($contentId > 0){

						if(!in_array($contentId,$this->Loaded)){
							$this->DB->Consulta("select contenido from contenido where id = $contentId;");
							list($code) = $this->DB->SacaTupla();
							if($tipo == 0){
								$code = @file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/BAM/js/Dazzler/'.$code , null, null, 0, 1024*500 );
								}
							$code = str_replace(array("%xid%","%uid%"), array($contentId,$this->User->Uid), $code);
							eval( $code );
							$this->Loaded[] = $contentId;
							}

						if(function_exists ( $request->data[0]->customFn )){
							$response['result'] = call_user_func($request->data[0]->customFn, $this->DB,$request->data[0]);

							}
						else{
							$response['result']["success"] = false;
							$response['result']["msg"] = "{$request->data[0]->customFn} is undefined for $contentId";
							}
						}
					else{
						$response['result']["success"] = false;
						$response['result']["msg"] = "Invalid Id:".$contentId;
						}
					}
			else{
				$response['result']["success"] = false;
				$response['result']["error"]["reason"] = "Método desconocido: ".$request->action.".".$request->method;
				}
			}
		else{
			$response['result']["success"] = false;
			$response['result']["error"]["reason"] = "Acción desconocida: ".$request->action ;

			/* Se asume que intento acceder una RPC de usuario logueado, envia evento de logeo */

			$event = array('type'=>'event','name'=>'lpc','data'=>'login');
			$this->addResponse($event);
			}
	$this->addResponse($response);
	}

}
?>
