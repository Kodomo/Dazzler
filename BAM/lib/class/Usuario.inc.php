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


class Usuario{
// Variables de Usuario del sitio
    public $Uid;

//    var $Rut;
    public $Login;
    public $Contrasena;

    public $Nombre;
   
    public $Correo;
    public $Cargo;


	public $Grupos;

    public $Valido;
    public $Error;
    
// Conexiones a Bases de Datos
    protected $DB; //Conexion de Base de datos del Objeto.

    // Crear un objeto usuario, criterios Login, Rut.
    function __construct($id){
		global $conf;
        $this->DB = new Db($conf->db->name, $conf->db->host, $conf->db->user, $conf->db->password, 'pg');

        $Consulta = "select id, login, clave, nombre, correo from usuarios where id = $id";
        
        $this->Valido = false;
		$this->Grupos = array();
        $this->Error = "";

        $n = $this->DB->Consulta($Consulta);
                
        if ($n == 1){
            // Obtiene los datos generales de la Cuenta
            $Data = $this->DB->Sacatupla();
            $this->Uid = $Data["id"];

            $this->Login = $Data["login"];
            $this->Contrasena = $Data["clave"];
            
            $this->Nombre = $Data["nombre"];
            
            $this->Correo = $Data["correo"];

            $this->Cargo = $Data["cargo"];
//			$n = $this->DB->Consulta("select gid from gusuarios where uid = {$this->Uid}");
//			while($gid = $this->DB->Sacatupla())
//            	$this->Grupos[] = $gid;

            $this->Valido = true;
            return true;
            }
        else{
            $this->Vaciar();
            $this->Error = "No se encontró el usuario";
            return false;
            }
    }

    function Vaciar(){
        $this->Valido = false;
        $this->Uid = 0;
        $this->Login = "";
        $this->Contrasena = "";

        $this->Nombre = "";
        }
}
?>
