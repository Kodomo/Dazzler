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

//version 1.2.2
$NumeroDeConsultas = 0;
$NumeroDeConexiones = 0;

class DB {
    protected $TipoBaseDatos;
    protected $Identificador;
    
    public $ResultadoConsulta;
    public $UltimoId;
    public $NumeroResultados;
    
    public $Estado;
    public $MostrarConsultas;
    public $Error;
    public $Error_debug;

    function __construct($BaseDatos="MySQL",$Servidor="localhost",$Usuario="root",$Contrasena="",$Tipo = "MySQL"){
        global $NumeroDeConexiones;
        $this->Error = "";
        $this->Error_debug = "";
        $this->Estado = 1;
        $this->TipoBaseDatos = "";
        $this->ResultadoConsulta = 0;
        $this->NumeroResultados = 0;
        $this->UltimoId = 0;
        $this->MostrarConsultas = 0;
        
        if($Tipo == "MySQL" || (strcasecmp($Tipo, "my") == 0)){
            $this->TipoBaseDatos = "MySQL";
            $this->Identificador = @mysql_connect($Servidor,$Usuario,$Contrasena,1);
            if ($this->Identificador == 0){
                $this->Error = "Error al Conectar $Tipo ($Usuario@$Servidor => $BaseDatos)<br>";
                $this->Error_debug = "Error al Conectar $Tipo ($Usuario:$Contrasena@$Servidor => $BaseDatos)<br>";
                $this->Estado = 0;
                }
            else{
                $bit = @mysql_select_db($BaseDatos,$this->Identificador);
                $NumeroDeConexiones++;
                if ($bit == 0){
                    $this->Error = "Error al Seleccionar Base de Datos $Tipo ($Usuario@$Servidor => $BaseDatos)<br>";
                    $this->Error_debug = "Error al Seleccionar Base de Datos $Tipo  ($Usuario:$Contrasena@$Servidor => $BaseDatos)<br>";
                    $this->Estado = 0;
                    }
				else{
					mysql_query("SET NAMES 'utf8';",$this->Identificador);
					}
                }
            }
        elseif($Tipo == "PosgreSQL" || strcasecmp($Tipo, "pg") == 0){
            $this->TipoBaseDatos = "PosgreSQL";
            $conectar = "dbname=$BaseDatos host=$Servidor user=$Usuario password=$Contrasena";
            $this->Identificador = @pg_connect($conectar,PGSQL_CONNECT_FORCE_NEW);
            if ($this->Identificador == FALSE){
                $this->Error = "Error al Conectar $Tipo ($Usuario@$Servidor => $BaseDatos)<br>";
                $this->Error_debug = "Error al Conectar $Tipo ($Usuario:$Contrasena@$Servidor => $BaseDatos)<br>";
                $this->Estado = 0;
                }
            else{
                $NumeroDeConexiones++;
                $this->Consulta("SET CLIENT_ENCODING TO 'LATIN1'");
                }    

            }
        else{
            $this->Error = "Error, Tipo de Base de Datos Incorrecta: $Tipo ($Usuario@$Servidor => $BaseDatos)<br>";
            $this->Error_debug = "Error, Tipo de Base de Datos Incorrecta: $Tipo  ($Usuario:$Contrasena@$Servidor => $BaseDatos)<br>";
            $this->Estado = 0;
            }
        }

    function __destruct() {
        if($this->TipoBaseDatos == "MySQL"){
                return @mysql_close($this->Identificador);
            }
        else{
                return @pg_close($this->Identificador);
            }
	   }
    function EscapeString($InputData){
        if($this->TipoBaseDatos == "MySQL"){
                return @mysql_escape_string($InputData);
            }
        else{
                return @pg_escape_string($InputData);
            }
        }

        
    function EscapeArray($InputData, $EscapeKeys = NULL){
        if(is_string($EscapeKeys)){
            $EscapeKeys = array( "$EscapeKeys" );
            }
        else if(!is_array($EscapeKeys)){
            $EscapeKeys = array_keys($InputData);
            }
        if($this->TipoBaseDatos == "MySQL"){
            foreach($EscapeKeys as $k){
                $InputData[$k] = mysql_escape_string($InputData[$k]);
                }
            }
        else{
            foreach($EscapeKeys as $k){
                $InputData[$k] = pg_escape_string($InputData[$k]);
                }
            }
        return $InputData;
        }
     function EscapeObject($InputData, $EscapeKeys = NULL){

        return $this->EscapeArray(get_object_vars($InputData),$EscapeKeys);

        }       

    function Consulta($Query){
        global $NumeroDeConsultas;
        $this->Estado = 1;
        if (!is_string($Query)){
              $this->Error_debug = $this->Error = "Consulta \"$Query\" no válida<br>";
              $this->Estado = $this->NumeroResultados  = 0;
              return $this->NumeroResultados;
              }
        if($this->MostrarConsultas)
            echo nl2br($Query)."<br>";

        if($this->TipoBaseDatos == "MySQL"){
            if ($this->ResultadoConsulta != 0)
                @mysql_free_result($this->ResultadoConsulta);

            $NumeroDeConsultas++;
            $this->ResultadoConsulta = @mysql_query($Query,$this->Identificador);
            $this->UltimoId = @mysql_insert_id($this->Identificador);
            if($this->ResultadoConsulta == 0){
                    $this->Error = "Error Realizar la Consulta \"$Query\"<br>";
                    $this->Error_debug = "Error Realizar la Consulta \"$Query\"  (". @mysql_error($this->Identificador) .")<br>";
                    $this->Estado = $this->NumeroResultados  = 0;
                }
            else
                $this->NumeroResultados = @mysql_affected_rows($this->Identificador);
            }
        else{
            if ($this->ResultadoConsulta != 0)
                @pg_free_result($this->ResultadoConsulta);

            $NumeroDeConsultas++;
            $this->ResultadoConsulta = @pg_query($this->Identificador,$Query);

            if($this->ResultadoConsulta == FALSE){
                    $this->Error = "Error Realizar la Consulta \"$Query\"<br>";
                    $this->Error_debug = "Error Realizar la Consulta \"$Query\"  (". @pg_last_error($this->Identificador) .")<br>";
                    $this->Estado = $this->NumeroResultados  = 0;
                }
            else
                $this->NumeroResultados = @pg_num_rows($this->ResultadoConsulta);
            }
        return $this->NumeroResultados;
        }
        
    function SacaTupla($full = true){
        if($this->TipoBaseDatos == "MySQL"){
					if($full)
					        return @mysql_fetch_array($this->ResultadoConsulta);
					else
					        return @mysql_fetch_assoc($this->ResultadoConsulta);
            }
        else{
					if($full)
					        return @pg_fetch_array($this->ResultadoConsulta);
					else
					        return @pg_fetch_assoc($this->ResultadoConsulta);
            }
            
        }
        
    function MuestraError($Debug = 0){
        
        if($Debug)
            echo $this->Error_debug;
        else
            echo $this->Error;
        $this->Estado = 1;
        }
    }
?>
