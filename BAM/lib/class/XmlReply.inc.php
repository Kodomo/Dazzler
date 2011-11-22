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

class XmlReply{

	public $xmlIn;
    public $xmlOut;
    public $xmlAcc;


	public $hInfo;
    public $pInfo;

	public $Valido;

	public $strReq;
	public $debugXml;
	public $debug;

	protected $DB;
    function __construct(){
		global $conf;
		$this->DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');
		$this->debug = true;
		$this->initXmlOut();
		}

	function loadXml($rawdata){

		$this->xmlIn = simplexml_load_string($rawdata);
		if(!$this->xmlIn){
			$this->addError('Invalid RPC, see http://boinc.berkeley.edu/trac/wiki/AccountManagement for details.');
			return false;
			}
		else{
			$this->strReq = $rawdata;
			return true;
			}
		}

	function initXmlOut(){
		global $conf;
		$this->xmlOut = new DOMDocument('1.0', 'utf-8');
		$this->xmlOut->formatOutput = true;

		$this->xmlAcc = $this->xmlOut->createElement('acct_mgr_reply');
		$this->xmlOut->appendChild($this->xmlAcc);
	
		$element = $this->xmlOut->createElement('name',$conf->account_manager->name);
		$this->xmlAcc->appendChild($element);

		$element = $this->xmlOut->createElement('version',"0.1");
		$this->xmlAcc->appendChild($element);

		$element = $this->xmlOut->createElement('signing_key',$conf->account_manager->public_signature);
		$this->xmlAcc->appendChild($element);

		/* add some random delay to te request */
		list($u, $s) = explode(' ',microtime());
		$repeatSec = $conf->account_manager->repeat_sec + round(900 * $u) - 450; //+- 15 min

		$element = $this->xmlOut->createElement("repeat_sec",$repeatSec); 
		$this->xmlAcc->appendChild($element);

		if($this->debug){
			$this->debugXml = $this->xmlOut->createElement("debug");
			$this->xmlAcc->appendChild($this->debugXml);
			}
		}

	function checkHost(){

		/* **************************** gather host info ************************************ */

		$now = time();
		$cpid 	= $this->DB->EscapeString($this->xmlIn->host_cpid);
		$lcpid 	= $this->DB->EscapeString($this->xmlIn->previous_host_cpid);

		$flops 	= round(floatval($this->xmlIn->host_info->p_fpops)/1000000.0);
		$mips 	= round(floatval($this->xmlIn->host_info->p_iops)/1000000.0);

		if (!empty($this->xmlIn->host_info->ip_addr)){
			$ip = ip2long($this->xmlIn->host_info->ip_addr);
		}else{
			$ip = ip2long($_SERVER["REMOTE_ADDR"]);
			}

		if (!empty($this->xmlIn->host_info->domain_name)){
			$name 	= $this->DB->EscapeString($this->xmlIn->host_info->domain_name);
		}else{
			$name 	= $this->DB->EscapeString($this->xmlIn->domain_name);
			}

		if (!empty($this->xmlIn->host_info->p_ncpus)){
			$cpus 	= intval($this->xmlIn->host_info->p_ncpus);
		}else{
			$cpus 	= 1;
			}

		$ereq = $this->DB->EscapeString($this->strReq);

		/* **************************** get DB host info ************************************ */
		$dazzlerId 	= intval($this->xmlIn->opaque->dazzlerid);
		if($dazzlerId > 0){
			$hValid = $this->DB->Consulta("select hosts.id, gid, uid, mod_time, start_hour, end_hour ,cpu_usage_limit, run_if_user_active, idle_time_to_run,hits,last_contact from (hosts left join groups on (groups.id = hosts.gid)) where hosts.id=$dazzlerId;");
			if($hValid){
				$this->hInfo = $this->DB->SacaTupla();
				}
			}

		if(!$dazzlerId || !$hValid){
			$hValid = $this->DB->Consulta("select hosts.id, gid, uid, mod_time, start_hour, end_hour ,cpu_usage_limit, run_if_user_active, idle_time_to_run,hits,last_contact from (hosts left join groups on (groups.id = hosts.gid)) where cpid='$cpid';");
			if($hValid){
				$this->hInfo = $this->DB->SacaTupla();
				}
			}

		if(!$hValid && strcmp($lcpid,$cpid)){
			$hValid = $this->DB->Consulta("select hosts.id, gid, uid, mod_time, start_hour, end_hour ,cpu_usage_limit, run_if_user_active, idle_time_to_run,hits,last_contact from (hosts left join groups on (groups.id = hosts.gid)) where cpid='$lcpid';");
			if($hValid){ 
				$this->hInfo = $this->DB->SacaTupla();
				}
			}


		if(!$hValid){
			/* **************************** host doesn't exist, create an entry for it ************************************ */


			/* **************************** search for user ************************************ */
			$uValid = 0;
			/* Try Weak Authentifier first */ 

			if(!strpos($this->xmlIn->name,"_") === false){

				list($weakId, $weakHash) = explode("_", $this->xmlIn->name,2);

				$weakId 	= intval($weakId);
				$weakHash 	= $this->DB->EscapeString($weakHash);

				$uValid = $this->DB->Consulta("select users.id,group_default,correo from (usuarios left join users on (usuarios.id = users.id)) where users.id=$weakId and users.weakhash='$weakHash';");
				if($uValid == 1){
					list($uId, $defaultGroup, $correo) = $this->DB->SacaTupla();
					}
				}

			/* if not authentified, try something else */
			if($uValid != 1){
				$userName 		= $this->DB->EscapeString($this->xmlIn->name);
				$passwordHash 	= $this->DB->EscapeString($this->xmlIn->password_hash);

				$uValid = $this->DB->Consulta("select users.id,group_default,correo from (usuarios left join users on (usuarios.id = users.id)) where login='$userName' and md5(clave)='$passwordHash';");
				if($uValid != 1){
					global $conf;
					$uId 			= $conf->conf->adminUid;
					$defaultGroup 	= $conf->conf->defaultGroup;
					$correo			= 'noemail@foo.bar';
					}
				else{
					/* **************************** user valid, check for host ************************************ */
					list($uId, $defaultGroup, $correo) = $this->DB->SacaTupla();
					}
				}

			$xcpid = $this->DB->EscapeString(md5($this->xmlIn->host_cpid.$correo));
		/* **************************** create host info ************************************ */
			$this->DB->Consulta("select nextval('hosts_id_seq'::regclass);");
			list($nextid) = $this->DB->SacaTupla();

			$this->DB->Consulta("insert into hosts(id,gid,name,cpus,mips,flops,ipaddr,cpid,xcpid,first_contact,last_contact,last_request,hits) Values($nextid,$defaultGroup,'$name',$cpus,$mips,$flops,$ip,'$cpid','$xcpid',$now,$now,'$ereq',1);");

			$hValid = $this->DB->Consulta("select hosts.id, gid, uid, mod_time, start_hour, end_hour ,cpu_usage_limit, run_if_user_active, idle_time_to_run,hits,last_contact from (hosts left join groups on (groups.id = hosts.gid)) where hosts.id=$nextid;");
			$this->hInfo = $this->DB->SacaTupla();

		}
	else{
		/* **************************** update host info ************************************ */

		if(strcmp($lcpid,$cpid)){/* cpid updated */
			$this->DB->Consulta("select correo from usuarios where id = (select uid from groups where id = {$this->hInfo['gid']});");
			list ( $correo ) = $this->DB->SacaTupla();
			$xcpid = $this->DB->EscapeString(md5($this->xmlIn->host_cpid.$correo));

			$this->DB->Consulta("update hosts set name='$name',cpus=$cpus,mips=$mips,flops=$flops,ipaddr=$ip,cpid='$cpid',xcpid='$xcpid',last_contact=$now,last_request='$ereq',hits=hits+1 where id={$this->hInfo['id']};");
			}
		else{
			$this->DB->Consulta("update hosts set name='$name',cpus=$cpus,mips=$mips,flops=$flops,ipaddr=$ip,last_contact=$now,last_request='$ereq',hits=hits+1 where id={$this->hInfo['id']};");
			}
		}

	/* **************************** get client version  ************************************ */
	list($mayor, $minor, $none) = explode('.',$this->xmlIn->client_version,3);
	$this->hInfo['client_version'] = intval($mayor)*100+intval($minor);

	/* **************************** get project information for the group/host ************************************ */
	$this->pInfo = array();

	$this->DB->Consulta("select * from configprojects left join (select * from myprojects where uid = {$this->hInfo['uid']}) as my on (configprojects.pid = my.id) where gid = {$this->hInfo['gid']} and authenticator notnull;");
	while($projData = $this->DB->SacaTupla()){
		$this->pInfo[$projData['url']] = $projData;
		}

	$this->addMsg("hId: ".$this->hInfo['id']);
	$this->addMsg("Contactos: ".$this->hInfo['hits']);

	$this->addDebug("uId: ".$this->hInfo['uid']);
	$this->addDebug("gId: ".$this->hInfo['gid']);
	$this->addDebug("hId: ".$this->hInfo['id']);

	$this->addDebug("mtime: ".$this->hInfo['mod_time']);
	$this->addDebug("proj: ".count($this->pInfo));

	}

	function addPreferences(){

		$mod_time = intval ($this->xmlIn->global_preferences->mod_time);
		if($mod_time < $this->hInfo['mod_time']){
			global $conf;

			$global_preferences = $this->xmlOut->createElement('global_preferences');
			$this->xmlAcc->appendChild($global_preferences);

		/* ************* group defined preferences ********** */
			$userDefined = array('mod_time','run_if_user_active','idle_time_to_run','cpu_usage_limit','start_hour','end_hour');
			foreach($userDefined as $pref){
				$element = $this->xmlOut->createElement($pref,$this->hInfo[$pref]);
				$global_preferences->appendChild($element);
				}

		/* ************* fixed preferences ********** */
			$element = $this->xmlOut->createElement('host_specific');
			$global_preferences->appendChild($element);

			$element = $this->xmlOut->createElement('source_project',$conf->account_manager->master_url);
			$global_preferences->appendChild($element);

			//general	           
			$element = $this->xmlOut->createElement('cpu_scheduling_period_minutes',$conf->base_preferences->cpu_scheduling_period_minutes);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('max_cpus',$conf->base_preferences->max_cpus);
			$global_preferences->appendChild($element); 	
			$element = $this->xmlOut->createElement('run_on_batteries',$conf->base_preferences->run_on_batteries);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('work_buf_min_days',$conf->base_preferences->work_buf_min_days);
			$global_preferences->appendChild($element);

			//resources
			$element = $this->xmlOut->createElement('ram_max_used_busy_pct',$conf->base_preferences->ram_max_used_busy_pct);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('ram_max_used_idle_pct',$conf->base_preferences->ram_max_used_idle_pct);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('max_bytes_sec_up',$conf->base_preferences->max_bytes_sec_up);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('max_bytes_sec_down',$conf->base_preferences->max_bytes_sec_down);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('net_start_hour',$conf->base_preferences->net_start_hour);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('net_end_hour',$conf->base_preferences->net_end_hour);
			$global_preferences->appendChild($element); 			
			$element = $this->xmlOut->createElement('vm_max_used_pct',$conf->base_preferences->vm_max_used_pct);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('disk_max_used_gb',$conf->base_preferences->disk_max_used_gb);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('disk_min_free_gb',$conf->base_preferences->disk_min_free_gb);
			$global_preferences->appendChild($element);

			$element = $this->xmlOut->createElement('leave_apps_in_memory',$conf->base_preferences->leave_apps_in_memory);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('confirm_before_connecting',$conf->base_preferences->confirm_before_connecting);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('hangup_if_dialed',$conf->base_preferences->hangup_if_dialed);
			$global_preferences->appendChild($element);
			$element = $this->xmlOut->createElement('disk_interval',$conf->base_preferences->disk_interval);
			$global_preferences->appendChild($element);
			}
		}

	function addProjects($fullSync = false){
		$toDeletion = array();


		foreach($this->xmlIn->project as $ProjIn){

			$Url = strval($ProjIn->url);

			if(empty($Url))
				continue;

			$this->addDebug("ProjIn: ".$Url);
			/* Project is in current project list */
			if (!empty($this->pInfo[$Url])){

				if(!empty($this->pInfo[$Url]['weak']) && ($this->hInfo['client_version'] > 612)){
					$this->pInfo[$Url]['authenticator'] = $this->pInfo[$Url]['weak'];
					}

				/* check if project parameters are OK */
				$projectSync = true;

				/* marked for deletion */
				if((($this->pInfo[$Url]['detach_when_done'] > 0) || ($this->pInfo[$Url]['estado'] == 2)) xor ($ProjIn->detach_when_done > 0)){
					$projectSync = false;
					}

				/* project paused */
				if((($this->pInfo[$Url]['suspend'] > 0) || ($this->pInfo[$Url]['estado'] == 1)) xor ($ProjIn->suspend > 0)){
					$projectSync = false;
					}

				if(!$projectSync){
					$this->addDebug("attNoSync: ".$Url);
					$this->addProject($this->pInfo[$Url]);
					}
				else{
				/* project updated */
					if($this->pInfo[$Url]['mod_time'] > $this->hInfo['last_contact']){

						$diff = $this->pInfo[$Url]['mod_time'] - $this->hInfo['last_contact'];
						$this->addDebug("attUpd:[$diff] ".$Url);

						$this->addProject($this->pInfo[$Url]);
						}
					else{
						$this->addDebug("attSync: ".$Url);
						}
					}

				unset ( $this->pInfo[$Url] );
				}
			else{
				$toDeletion[$Url] = strval($ProjIn->account_key);
				}
			}

		/* Attach to project if it isn't marked for detach */
		foreach($this->pInfo as $url => $ProjIn){
			$this->addDebug("noAtt: ".$url);
			if(($ProjIn['detach_when_done'] == 0) && ($ProjIn['estado'] < 2)){
				$this->addProject( $ProjIn );
				}
			}

		/* Forcefull detach */
		if(!empty($toDeletion)){
			foreach($toDeletion as $url => $auth){
				$eurl = $this->DB->EscapeString($url);
				$exist = $this->DB->Consulta("select url_signature from projects where estado < 10 and url='$eurl';");
				if($exist){
					list( $sig ) = $this->DB->SacaTupla();
					$projDel = array();
					$projDel['url']						= $url;
					$projDel['url_signature']			= $sig;
					$projDel['authenticator']			= $auth;
					$projDel['dont_request_more_work']	= 1;
					$projDel['abort_not_started']		= 1;
					$projDel['detach_when_done']		= 1;
					$this->addProject($projDel);
					$this->addDebug("ForceDetach: ".$url);
					}
				else{
					/* unknown project, add to project list to create signature */
					$eauth = $this->DB->EscapeString($auth);
					$this->DB->Consulta("insert into projects (nombre,url,url_signature,uid,estado) values('$eurl','$eurl','$eauth',{$conf->conf->adminUid},10);");
					$this->addDebug("unkProj: ".$url);
					}
				}
			}
		}

	function addProject($projectArray){
		if(!isset($projectArray['url']))
			return false;
		if(!isset($projectArray['url_signature']))
			return false;

		$account = $this->xmlOut->createElement('account');
		$this->xmlAcc->appendChild($account);

		$elementos = array('url','url_signature','authenticator','resource_share','suspend','detach_when_done','dont_request_more_work','abort_not_started','detach');

		foreach($elementos as $elemento){
			if(isset($projectArray[$elemento])){
				$element = $this->xmlOut->createElement($elemento,$projectArray[$elemento]);
				$account->appendChild($element);
				}
			}
		return true;
		}

	function addOpaque(){
		$opaque = $this->xmlOut->createElement('opaque');
		$this->xmlAcc->appendChild($opaque);

		$hostid = $this->xmlOut->createElement('dazzlerid',$this->hInfo['id']);
		$opaque->appendChild($hostid);
		}
	function addError($msg = ""){
		$this->addMsg("Error: ".$msg);
		}
	function addDebug($msg = ""){
		$element = $this->xmlOut->createElement('message', $msg);
		$this->debugXml->appendChild($element);
		}
	function addMsg($msg = ""){
		$element = $this->xmlOut->createElement('message', $msg);
		$this->xmlAcc->appendChild($element);
		}
	function getXml(){
		return $this->xmlOut->saveXML();
		}

}
?>
