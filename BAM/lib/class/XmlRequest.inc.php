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

//require_once $_SERVER['DOCUMENT_ROOT'].'/BAM/lib/class/Db.inc.php';

class XmlRequest{

	public $ProjectId;
	public $ProjectUrl;
	public $XmlUrl;

    public $ProjectData;
    public $ProjectConfig;


	public $hInfo;
    public $pInfo;

	public $Valido;
	public $Online;
	public $ErrNum;

	public $Msg;
	public $Timestamp;
	public $Error;

	protected $DB;
    function __construct(){
		global $conf;
		$this->DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');

//-		$this->DB->MostrarConsultas = 1;
		$this->ProjectId = 0;
		$this->ProjectUrl = '';
		$this->Valido = false;
		$this->Online = false;
		$this->Msg = array();
		$this->timeStamp = time();
		$this->dayStamp = intval($this->timeStamp/86400); //- days since unix epoch!
		}

	function currentRAC($avg, $avg_time){ //- push avg to current timestamp
//-		static $M_LN2 = 0.693147180559945309417;
//-		static $credit_half_life = 86400 * 7;

		$diff = $avg_time - $this->timeStamp;
		if($diff > 0) $diff = 0;
		$avg *= exp($diff * 1.146076687e-6 );

		return round($avg);
		}
	function setProject($Id){
		$this->Online = false;
		$this->Valido = false;
		$Id = intval($Id);
		$n = $this->DB->Consulta("select id,url from projects where id = $Id;");
		if($n == 1){
			list( $this->ProjectId, $this->ProjectUrl ) = $this->DB->SacaTupla();
			$this->Valido = true;
			$this->ProjectConfig = simplexml_load_string( file_get_contents( $this->ProjectUrl.'get_project_config.php' ) );

			if(!$this->ProjectConfig){/* Html / Xml error... project down ?*/
				$this->Msg[] = $this->Error = "[Project Config] Respuesta del proyecto '{$this->ProjectUrl}' invalida.";
				$this->ErrNum = -1;
				}
//			else if(!empty($this->ProjectConfig->client_account_creation_disabled) || !empty($this->ProjectConfig->account_creation_disabled)){
//				$this->Msg[] = "El proyecto '{$this->ProjectUrl}' no permite la creacion de cuentas.";
//				}
			else if(!empty($this->ProjectConfig->account_manager)){/* not a project ?*/
				$this->Msg[] = $this->Error = "[Project Config] La dirección '{$this->ProjectUrl}' no contiene un proyecto BOINC.";
				$this->ErrNum = -2;
				}
			else if(!empty($this->ProjectConfig->error_num)){/* Project has problems ?*/
				$this->Msg[] = $this->Error = "[Project Config] El proyecto '{$this->ProjectUrl}' dio el error {$projectConfig->error_num}.";
				$this->ErrNum = $this->ProjectConfig->error_num;
				}
			else{/* No problem, can continue */
				if(!empty($this->ProjectConfig->rpc_prefix))
					$this->XmlUrl = $this->ProjectConfig->rpc_prefix;
				else
					$this->XmlUrl = $this->ProjectUrl;

				$this->Online = true;
				$this->ErrNum = 0;
				}
			}
		else{
			$this->ProjectId = 0;
			$this->ProjectUrl = '';
			$this->Valido = false;
			$this->Online = false;
			}
		}

	function getStats(){ /* User/Host Statistic retrieval */
		if(!$this->Online)
			return 1;

		$users = array();/* get all users with account in this project */
		$this->DB->Consulta("select uid, authenticator, opaque from authenticators where authenticator notnull and pid = {$this->ProjectId}; ");
		while($temp = $this->DB->SacaTupla())
			$users[$temp['uid']] = $temp;

		$lastweek = $this->timeStamp - 7 * 86400;
		foreach($users as $uid => $user){

			$hosts = array();
			$groups = array(); /* get all active host of the user */
			$this->DB->Consulta("select id,gid,xcpid,cpus,mips,flops from hosts where last_contact > $lastweek and gid in (select id from groups where uid = $uid);");
			while($temp = $this->DB->SacaTupla()){
				$hosts[$temp['xcpid']] = $temp;
				$groups[] = $temp['gid'];
				}
			$groups = array_unique($groups);

			$gCount = 0;
			foreach($groups as $gid){/* check if there is a "active" host in this project */
				$n = $this->DB->Consulta("select id from statistics where dia={$this->dayStamp} and gid=$gid and pid={$this->ProjectId};");
				if($n == 0)
					$gCount++;
				}

			if($gCount){
				if(!empty($user['opaque']))
					$Query = '?auth=' . urlencode($user['authenticator']). '&opaque_auth=' . urlencode($user['opaque']).'&format=xml';
				else
					$Query = '?auth=' . urlencode($user['authenticator']). '&format=xml';

				$projectResponse = simplexml_load_string( file_get_contents( $this->XmlUrl.'/show_user.php'.$Query ) );

				if(!$projectResponse){
					$this->Msg[] = "[getStats] Respuesta del proyecto '{$this->ProjectUrl}' invalida.";
					}
				else if(!empty($projectResponse->error_num)){
					$this->Msg[] = "[getStats] El proyecto '{$this->ProjectUrl}' dio el error {$projectResponse->error_num}.";
					}
				else{/* parse stat response */
					$statInfo = array();

					foreach($projectResponse->host as $rHost){
						$host_cpid = strval($rHost->host_cpid);
						$hGroup = intval($hosts[$host_cpid]['gid']);

						if($hGroup == 0) //-host is not active
							continue;
						$totalCredit = round($rHost->total_credit);
						$expavgCredit = floatval($rHost->expavg_credit);
						$expavgTime = floatval($rHost->expavg_time);

						$avg = $this->currentRAC($expavgCredit, $expavgTime);

						$statInfo[$hGroup]['expavg_credit'] += $avg;
						$statInfo[$hGroup]['total_credit'] += $totalCredit;

						$statInfo[$hGroup]['hosts'] += 1;
						$statInfo[$hGroup]['cpus'] += $hosts[$host_cpid]['cpus'];
						$statInfo[$hGroup]['mips'] += $hosts[$host_cpid]['cpus']*$hosts[$host_cpid]['mips'];
						$statInfo[$hGroup]['flops'] += $hosts[$host_cpid]['cpus']*$hosts[$host_cpid]['flops'];
						}
					foreach($statInfo as $gid => $stat){
						$this->DB->Consulta("insert into statistics(dia,gid,pid,hosts,cpus,mips,flops,total_credit,expavg_credit,expavg_time) values({$this->dayStamp},$gid, {$this->ProjectId},{$stat['hosts']},{$stat['cpus']},{$stat['mips']},{$stat['flops']},{$stat['total_credit']},{$stat['expavg_credit']},{$this->timeStamp});");
						}
					}
				}
			}
		}
	function createAccounts(){ /* Project Account Creation */
		if(!$this->Online)
			return 1;

		$Users = array();
		$this->DB->Consulta("select uid, nombre, correo, weakhash from (authenticators left join users on (authenticators.uid = users.id) left join usuarios on (authenticators.uid = usuarios.id)) where authenticator isnull and authenticators.pid = {$this->ProjectId}; ");
		while($info = $this->DB->SacaTupla())
			$Users[$info['uid']] = $info;

		foreach($Users as $Uid => $User){
			$Query = '?email_addr=' . urlencode($User['correo']) . '&passwd_hash=' . urlencode($User['weakhash']). '&user_name=' . urlencode($User['nombre']);
			$projectResponse = simplexml_load_string( file_get_contents( $this->XmlUrl.'/create_account.php'.$Query ) );

			if(!$projectResponse){
				$this->Msg[] = "[Create User] Respuesta del proyecto '{$this->ProjectUrl}' invalida.";
				}
			else if(!empty($projectResponse->error_num)){
				$this->Msg[] = "[Create User] El proyecto '{$this->ProjectUrl}' dio el error {$projectResponse->error_num}.";
				}
			else{
				$Auth = $DB->EscapeString($projectResponse->authenticator);

				if(!empty($projectResponse->opaque_auth)){
					$Opaque = $DB->EscapeString($projectResponse->opaque_auth);					
					$Query = '?account_key=' . urlencode($projectResponse->authenticator) . '&opaque_auth=' . urlencode($projectResponse->opaque_auth);
					}
				else{
					$Opaque = '';
					$Query = '?account_key=' . urlencode($projectResponse->authenticator);
					}

				$projectResponse = simplexml_load_string( file_get_contents( $this->XmlUrl.'/am_get_info.php'.$Query ) );

				if(!$projectResponse){
					$this->Msg[] = "[Get Weak] Respuesta del proyecto '{$this->ProjectUrl}' invalida.";
					$Weak = '';
					}
				else if(!empty($projectResponse->error_num)){
					$this->Msg[] = "[Get Weak] El proyecto '{$this->ProjectUrl}' dio el error {$projectResponse->error_num}.";
					$Weak = '';
					}
				elseif(!empty($projectResponse->weak_auth)){
					$Weak = $DB->EscapeString($projectResponse->weak_auth);
					}
				else{
					$Weak = '';
					}

				$this->DB->Consulta("update authenticators set authenticator='$Auth', opaque='$Opaque', weak='$Weak' where pid={$this->ProjectId} and uid=$Uid; ");
				}
			}

		return 0;
		}
	/* delete project awaiting for detach */
	function deleteDetaching(){ 
		if(!$this->Valid)
			return 1;

		$this->DB->Consulta("delete from configprojects where pid = {$this->ProjectId} and detach_when_done>0 and detach_when_done<{$this->timeStamp};");
		}

	function saveStatus(){
		if(!$this->Valid)
			return 1;

		$this->DB->Consulta("update projects set status={$this->ErrNum} where id = {$this->ProjectId};");
		}
	}

?>
