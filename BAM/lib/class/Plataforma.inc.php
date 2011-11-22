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

class Plataforma{

    // Crear un objeto usuario, criterios Login, Rut.
	protected $browser_user_agent;
	public $NumOs;
	public $NumBrow;


public $SO = array(0 => 'Desconocido',
             101 => 'Windows 95',
             102 => 'Windows 98',
             103 => 'Windows Millenium',
             104 => 'Windows 2000',
             105 => 'Windows XP',
             106 => 'Windows Vista',
			 107 => 'Windows 7',
             113 => 'Windows NT3',
             114 => 'Windows NT4',
             115 => 'Windows 2003',
             119 => 'Windows CE',

             201 => 'Macintosh',

             301 => 'Unix (*nix)',

			 401 => 'Ubuntu',
             402 => 'Kubuntu',
             403 => 'Xubuntu',
             404 => 'Debian',
             405 => 'Opensuse',
             406 => 'Suse',
             407 => 'Fedora',
             408 => 'RedHat',
             409 => 'Gentoo',
			 410 => 'Linux'           );

public $SO_ico = array(0 => 'desconocido',
             101 => 'win95',
             102 => 'win98',
             103 => 'winme',
             104 => 'win2000',
             105 => 'winxp',
             106 => 'winvista',
             107 => 'win7',
             113 => 'winnt',
             114 => 'winnt',
             115 => 'win2003',
             119 => 'wince',

             201 => 'macosx',

             301 => 'otro',

			 401 => 'ubuntu',
             402 => 'kubuntu',
             403 => 'xubuntu',
             404 => 'debian',
             405 => 'linux',
             406 => 'linux',
             407 => 'linux',
             408 => 'redhat',
             409 => 'gentoo',
             410 => 'linux' );

public $Navegador = array(0 => 'Desconocido',
                    100 => 'Firefox',
                    200 => 'Internet Explorer',
                    300 => 'Opera',
                    400 => 'Chrome',
                    500 => 'Safari',
                    900 => 'Webkit',
                    800 => 'Mozilla',
                    1000 => 'Web Spider');

public $Navegador_ico = array(0 => 'Desconocido',
		                100 => 'ff',
		                200 => 'ie',
		                300 => 'opera',
		                400 => 'chrome',
		                500 => 'safari',
		                900 => 'webkit',
		                800 => 'mozilla',
		                1000 => 'bot');

public $GEOIP_COUNTRY_CODES = array(
"xx", "ap", "eu", "ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "aq",
"ar", "as", "at", "au", "aw", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh",
"bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca",
"cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cu",
"cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg",
"eh", "er", "es", "et", "fi", "fj", "fk", "fm", "fo", "fr", "fx", "ga", "gb",
"gd", "ge", "gf", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt",
"gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "in",
"io", "iq", "ir", "is", "it", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km",
"kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls",
"lt", "lu", "lv", "ly", "ma", "mc", "md", "mg", "mh", "mk", "ml", "mm", "mn",
"mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na",
"nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa",
"pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py",

"qa", "re", "ro", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si",
"sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "sv", "sy", "sz", "tc", "td",
"tf", "tg", "th", "tj", "tk", "tm", "tn", "to", "tl", "tr", "tt", "tv", "tw",
"tz", "ua", "ug", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn",
"vu", "wf", "ws", "ye", "yt", "rs", "za", "zm", "me", "zw", "a1", "a2", "o1",
"ax", "gg", "im", "je"
);

public $GEOIP_COUNTRY_NAMES = array(
"Desconocido", "Asia/Pacific Region", "Europe", "Andorra", "United Arab Emirates",
"Afghanistan", "Antigua and Barbuda", "Anguilla", "Albania", "Armenia",
"Netherlands Antilles", "Angola", "Antarctica", "Argentina", "American Samoa",
"Austria", "Australia", "Aruba", "Azerbaijan", "Bosnia and Herzegovina",
"Barbados", "Bangladesh", "Belgium", "Burkina Faso", "Bulgaria", "Bahrain",
"Burundi", "Benin", "Bermuda", "Brunei Darussalam", "Bolivia", "Brazil",
"Bahamas", "Bhutan", "Bouvet Island", "Botswana", "Belarus", "Belize",
"Canada", "Cocos (Keeling) Islands", "Congo, The Democratic Republic of the",
"Central African Republic", "Congo", "Switzerland", "Cote D'Ivoire", "Cook
Islands", "Chile", "Cameroon", "China", "Colombia", "Costa Rica", "Cuba", "Cape
Verde", "Christmas Island", "Cyprus", "Czech Republic", "Germany", "Djibouti",
"Denmark", "Dominica", "Dominican Republic", "Algeria", "Ecuador", "Estonia",
"Egypt", "Western Sahara", "Eritrea", "Spain", "Ethiopia", "Finland", "Fiji",
"Falkland Islands (Malvinas)", "Micronesia, Federated States of", "Faroe
Islands", "France", "France, Metropolitan", "Gabon", "United Kingdom",
"Grenada", "Georgia", "French Guiana", "Ghana", "Gibraltar", "Greenland",
"Gambia", "Guinea", "Guadeloupe", "Equatorial Guinea", "Greece", "South Georgia
and the South Sandwich Islands", "Guatemala", "Guam", "Guinea-Bissau",
"Guyana", "Hong Kong", "Heard Island and McDonald Islands", "Honduras",
"Croatia", "Haiti", "Hungary", "Indonesia", "Ireland", "Israel", "India",
"British Indian Ocean Territory", "Iraq", "Iran, Islamic Republic of",
"Iceland", "Italy", "Jamaica", "Jordan", "Japan", "Kenya", "Kyrgyzstan",
"Cambodia", "Kiribati", "Comoros", "Saint Kitts and Nevis", "Korea, Democratic
People's Republic of", "Korea, Republic of", "Kuwait", "Cayman Islands",
"Kazakstan", "Lao People's Democratic Republic", "Lebanon", "Saint Lucia",
"Liechtenstein", "Sri Lanka", "Liberia", "Lesotho", "Lithuania", "Luxembourg",
"Latvia", "Libyan Arab Jamahiriya", "Morocco", "Monaco", "Moldova, Republic
of", "Madagascar", "Marshall Islands", "Macedonia",
"Mali", "Myanmar", "Mongolia", "Macau", "Northern Mariana Islands",
"Martinique", "Mauritania", "Montserrat", "Malta", "Mauritius", "Maldives",
"Malawi", "Mexico", "Malaysia", "Mozambique", "Namibia", "New Caledonia",
"Niger", "Norfolk Island", "Nigeria", "Nicaragua", "Netherlands", "Norway",
"Nepal", "Nauru", "Niue", "New Zealand", "Oman", "Panama", "Peru", "French
Polynesia", "Papua New Guinea", "Philippines", "Pakistan", "Poland", "Saint
Pierre and Miquelon", "Pitcairn Islands", "Puerto Rico", "Palestinian Territory",
"Portugal", "Palau", "Paraguay", "Qatar", "Reunion", "Romania",
"Russian Federation", "Rwanda", "Saudi Arabia", "Solomon Islands",
"Seychelles", "Sudan", "Sweden", "Singapore", "Saint Helena", "Slovenia",
"Svalbard and Jan Mayen", "Slovakia", "Sierra Leone", "San Marino", "Senegal",
"Somalia", "Suriname", "Sao Tome and Principe", "El Salvador", "Syrian Arab
Republic", "Swaziland", "Turks and Caicos Islands", "Chad", "French Southern

Territories", "Togo", "Thailand", "Tajikistan", "Tokelau", "Turkmenistan",
"Tunisia", "Tonga", "Timor-Leste", "Turkey", "Trinidad and Tobago", "Tuvalu",
"Taiwan", "Tanzania, United Republic of", "Ukraine",
"Uganda", "United States Minor Outlying Islands", "United States", "Uruguay",
"Uzbekistan", "Holy See (Vatican City State)", "Saint Vincent and the
Grenadines", "Venezuela", "Virgin Islands, British", "Virgin Islands, U.S.",
"Vietnam", "Vanuatu", "Wallis and Futuna", "Samoa", "Yemen", "Mayotte",
"Serbia", "South Africa", "Zambia", "Montenegro", "Zimbabwe",
"Anonymous Proxy","Satellite Provider","Other",
"Aland Islands","Guernsey","Isle of Man","Jersey"
);


    function __construct($user_agent = ''){

	if(empty($user_agent))
		$this->browser_user_agent = ( isset( $_SERVER['HTTP_USER_AGENT'] ) ) ? strtolower( $_SERVER['HTTP_USER_AGENT'] ) : '';
	else
		$this->browser_user_agent =  strtolower( $user_agent );

	$this->Load();
    }

	function Load($user_agent = ''){
	$this->NumBrow = 0;
	$this->NumOs = 0;

	if(!empty($user_agent))
		$this->browser_user_agent = strtolower( $user_agent );;

	$this->GetBrowser();
	$this->GetOS();

	}

	function GetBrowser(){

	//initialize all variables with default values to prevent error
	$a_browser_math_number = '';
	$a_full_assoc_data = '';
	$a_full_data = '';
	$a_mobile_data = '';
	$a_moz_data = '';
	$a_os_data = '';
	$a_unhandled_browser = '';
	$a_webkit_data = '';
	$b_dom_browser = false;
	$b_os_test = true;
	$b_mobile_test = true;
	$b_safe_browser = false;
	$b_success = false;// boolean for if browser found in main test
	$browser_math_number = '';
	$browser_temp = '';
	$browser_working = '';
	$browser_number = '';
	$ie_version = '';
	$mobile_test = '';
	$moz_release_date = '';
	$moz_rv = '';
	$moz_rv_full = '';
	$moz_type = '';
	$moz_number = '';
	$NumOsber = '';
	$os_type = '';
	$run_time = '';
	$true_ie_number = '';
	$ua_type = 'bot';// default to bot since you never know with bots
	$webkit_type = '';
	$webkit_type_number = '';

	$a_browser_types = array(
		array( 'opera', true, 'op', 'bro' ),
		array( 'msie', true, 'ie', 'bro' ),
		// webkit before gecko because some webkit ua strings say: like gecko
		array( 'webkit', true, 'webkit', 'bro' ),
		// konq will be using webkit soon
		array( 'konqueror', true, 'konq', 'bro' ),
		// covers Netscape 6-7, K-Meleon, Most linux versions, uses moz array below
		array( 'gecko', true, 'moz', 'bro' ),
		array( 'netpositive', false, 'netp', 'bbro' ),// beos browser
		array( 'lynx', false, 'lynx', 'bbro' ), // command line browser
		array( 'elinks ', false, 'elinks', 'bbro' ), // new version of links
		array( 'elinks', false, 'elinks', 'bbro' ), // alternate id for it
		array( 'links2', false, 'links2', 'bbro' ), // alternate links version
		array( 'links ', false, 'links', 'bbro' ), // old name for links
		array( 'links', false, 'links', 'bbro' ), // alternate id for it
		array( 'w3m', false, 'w3m', 'bbro' ), // open source browser, more features than lynx/links
		array( 'webtv', false, 'webtv', 'bbro' ),// junk ms webtv
		array( 'amaya', false, 'amaya', 'bbro' ),// w3c browser
		array( 'dillo', false, 'dillo', 'bbro' ),// linux browser, basic table support
		array( 'ibrowse', false, 'ibrowse', 'bbro' ),// amiga browser
		array( 'icab', false, 'icab', 'bro' ),// mac browser
		array( 'crazy browser', true, 'ie', 'bro' ),// uses ie rendering engine

		// search engine spider bots:
		array( 'googlebot', false, 'google', 'bot' ),// google
		array( 'mediapartners-google', false, 'adsense', 'bot' ),// google adsense
		array( 'yahoo-verticalcrawler', false, 'yahoo', 'bot' ),// old yahoo bot
		array( 'yahoo! slurp', false, 'yahoo', 'bot' ), // new yahoo bot
		array( 'yahoo-mm', false, 'yahoomm', 'bot' ), // gets Yahoo-MMCrawler and Yahoo-MMAudVid bots
		array( 'inktomi', false, 'inktomi', 'bot' ), // inktomi bot
		array( 'slurp', false, 'inktomi', 'bot' ), // inktomi bot
		array( 'fast-webcrawler', false, 'fast', 'bot' ),// Fast AllTheWeb
		array( 'msnbot', false, 'msn', 'bot' ),// msn search
		array( 'ask jeeves', false, 'ask', 'bot' ), //jeeves/teoma
		array( 'teoma', false, 'ask', 'bot' ),//jeeves teoma
		array( 'scooter', false, 'scooter', 'bot' ),// altavista
		array( 'openbot', false, 'openbot', 'bot' ),// openbot, from taiwan
		array( 'ia_archiver', false, 'ia_archiver', 'bot' ),// ia archiver
		array( 'zyborg', false, 'looksmart', 'bot' ),// looksmart
		array( 'almaden', false, 'ibm', 'bot' ),// ibm almaden web crawler
		array( 'baiduspider', false, 'baidu', 'bot' ),// Baiduspider asian search spider
		array( 'psbot', false, 'psbot', 'bot' ),// psbot image crawler
		array( 'gigabot', false, 'gigabot', 'bot' ),// gigabot crawler
		array( 'naverbot', false, 'naverbot', 'bot' ),// naverbot crawler, bad bot, block
		array( 'surveybot', false, 'surveybot', 'bot' ),//
		array( 'boitho.com-dc', false, 'boitho', 'bot' ),//norwegian search engine
		array( 'objectssearch', false, 'objectsearch', 'bot' ),// open source search engine
		array( 'answerbus', false, 'answerbus', 'bot' ),// http://www.answerbus.com/, web questions
		array( 'sohu-search', false, 'sohu', 'bot' ),// chinese media company, search component
		array( 'iltrovatore-setaccio', false, 'il-set', 'bot' ),

		// various http utility libaries
		array( 'w3c_validator', false, 'w3c', 'lib' ), // uses libperl, make first
		array( 'wdg_validator', false, 'wdg', 'lib' ), //
		array( 'libwww-perl', false, 'libwww-perl', 'lib' ),
		array( 'jakarta commons-httpclient', false, 'jakarta', 'lib' ),
		array( 'python-urllib', false, 'python-urllib', 'lib' ),

		// download apps
		array( 'getright', false, 'getright', 'dow' ),
		array( 'wget', false, 'wget', 'dow' ),// open source downloader, obeys robots.txt

		// netscape 4 and earlier tests, put last so spiders don't get caught
		array( 'mozilla/4.', false, 'ns', 'bbro' ),
		array( 'mozilla/3.', false, 'ns', 'bbro' ),
		array( 'mozilla/2.', false, 'ns', 'bbro' )
	);

	//array( '', false ); // browser array template

	/*
	moz types array
	note the order, netscape6 must come before netscape, which  is how netscape 7 id's itself.
	rv comes last in case it is plain old mozilla. firefox/netscape/seamonkey need to be later
	Thanks to: http://www.zytrax.com/tech/web/firefox-history.html
	*/
	$a_moz_types = array( 'bonecho', 'camino', 'epiphany', 'firebird', 'flock', 'galeon', 'iceape', 'icecat', 'k-meleon', 'minimo', 'multizilla', 'phoenix', 'songbird', 'swiftfox', 'seamonkey', 'shiretoko', 'iceweasel', 'firefox', 'minefield', 'netscape6', 'netscape', 'rv' );

	/*
	webkit types, this is going to expand over time as webkit browsers spread
	konqueror is probably going to move to webkit, so this is preparing for that
	It will now default to khtml. gtklauncher is the temp id for epiphany, might
	change. Defaults to applewebkit, and will all show the webkit number.
	*/
	$a_webkit_types = array( 'arora', 'chrome', 'epiphany', 'gtklauncher', 'konqueror', 'midori', 'omniweb', 'safari', 'uzbl', 'applewebkit', 'webkit' );
	/*
	run through the browser_types array, break if you hit a match, if no match, assume old browser
	or non dom browser, assigns false value to $b_success.
	*/
	$i_count = count( $a_browser_types );
	for ( $i = 0; $i < $i_count; $i++ ){
		//unpacks browser array, assigns to variables, need to not assign til found in string
		$browser_temp = $a_browser_types[$i][0];// text string to id browser from array

		if ( strstr( $this->browser_user_agent, $browser_temp ) )
		{
			/*
			it defaults to true, will become false below if needed
			this keeps it easier to keep track of what is safe, only
			explicit false assignment will make it false.
			*/
			$b_safe_browser = true;
			$browser_name = $browser_temp;// text string to id browser from array

			// assign values based on match of user agent string
			$b_dom_browser = $a_browser_types[$i][1];// hardcoded dom support from array
			$browser_working = $a_browser_types[$i][2];// working name for browser
			$ua_type = $a_browser_types[$i][3];// sets whether bot or browser

			switch ( $browser_working )
			{
				// this is modified quite a bit, now will return proper netscape version number
				// check your implementation to make sure it works
				case 'ns':
					$b_safe_browser = false;
					$browser_number = $this->get_item_version( $this->browser_user_agent, 'mozilla' );
					$this->NumBrow = 10;
					break;
				case 'moz':
					/*
					note: The 'rv' test is not absolute since the rv number is very different on
					different versions, for example Galean doesn't use the same rv version as Mozilla,
					neither do later Netscapes, like 7.x. For more on this, read the full mozilla
					numbering conventions here: http://www.mozilla.org/releases/cvstags.html
					*/
					// this will return alpha and beta version numbers, if present
					$moz_rv_full = $this->get_item_version( $this->browser_user_agent, 'rv' );
					// this slices them back off for math comparisons
					$moz_rv = substr( $moz_rv_full, 0, 3 );

					// this is to pull out specific mozilla versions, firebird, netscape etc..
					$j_count = count( $a_moz_types );
					for ( $j = 0; $j < $j_count; $j++ )
					{
						if ( strstr( $this->browser_user_agent, $a_moz_types[$j] ) )
						{
							$moz_type = $a_moz_types[$j];
							$moz_number = $this->get_item_version( $this->browser_user_agent, $moz_type );
							break;
						}
					}
					/*
					this is necesary to protect against false id'ed moz'es and new moz'es.
					this corrects for galeon, or any other moz browser without an rv number
					*/
					if ( !$moz_rv )
					{
						// you can use this if you are running php >= 4.2
						if ( function_exists( 'floatval' ) )
						{
							$moz_rv = floatval( $moz_number );
						}
						else
						{
							$moz_rv = substr( $moz_number, 0, 3 );
						}
						$moz_rv_full = $moz_number;
					}
					// this corrects the version name in case it went to the default 'rv' for the test
					if ( $moz_type == 'rv' )
					{
						$moz_type = 'mozilla';
					}

					//the moz version will be taken from the rv number, see notes above for rv problems
					$browser_number = $moz_rv;
					// gets the actual release date, necessary if you need to do functionality tests
					$this->get_set_count( 'set', 0 );
					$moz_release_date = $this->get_item_version( $this->browser_user_agent, 'gecko/' );
					/*
					Test for mozilla 0.9.x / netscape 6.x
					test your javascript/CSS to see if it works in these mozilla releases, if it
					does, just default it to: $b_safe_browser = true;
					*/
					if ( ( $moz_release_date < 20020400 ) || ( $moz_rv < 1 ) )
					{
						$b_safe_browser = false;
					}

					if($moz_type == 'firefox')
						$this->NumBrow = 100 + intval($moz_number*10);
					else
						$this->NumBrow = 800+$j;
					break;
				case 'ie':
					/*
					note we're adding in the trident/ search to return only first instance in case
					of msie 8, and we're triggering the  break last condition in the test, as well
					as the test for a second search string, trident/
					*/
					$browser_number = $this->get_item_version( $this->browser_user_agent, $browser_name, true, 'trident/' );
					// construct the proper real number if it's in compat mode and msie 8.0/9.0
					if ( strstr( $browser_number, '7.' ) && strstr( $this->browser_user_agent, 'trident/5' ) )
					{
						// note that 7.0 becomes 9 when adding 1, but if it's 7.1 it will be 9.1
						$true_ie_number = $browser_number + 2;
					}
					elseif ( strstr( $browser_number, '7.' ) && strstr( $this->browser_user_agent, 'trident/4' ) )
					{
						// note that 7.0 becomes 8 when adding 1, but if it's 7.1 it will be 8.1
						$true_ie_number = $browser_number + 1;
					}
					// the 9 series is finally standards compatible, html 5 etc, so worth a new id
					if ( $browser_number >= 9 )
					{
						$ie_version = 'ie9x';
					}
					// 7/8 were not yet quite to standards levels but getting there
					elseif ( $browser_number >= 7 )
					{
						$ie_version = 'ie7x';
					}
					// then test for IE 5x mac, that's the most problematic IE out there
					elseif ( strstr( $this->browser_user_agent, 'mac') )
					{
						$ie_version = 'ieMac';
					}
					// ie 5/6 are both very weak in standards compliance
					elseif ( $browser_number >= 5 )
					{
						$ie_version = 'ie5x';
					}
					elseif ( ( $browser_number > 3 ) && ( $browser_number < 5 ) )
					{
						$b_dom_browser = false;
						$ie_version = 'ie4';
						// this depends on what you're using the script for, make sure this fits your needs
						$b_safe_browser = true;
					}
					else
					{
						$ie_version = 'old';
						$b_dom_browser = false;
						$b_safe_browser = false;
					}
					$this->NumBrow = 200 + $browser_number;
					break;
				case 'op':
					$browser_number = $this->get_item_version( $this->browser_user_agent, $browser_name );
					// opera is leaving version at 9.80 (or xx) for 10.x - see this for explanation
					// http://dev.opera.com/articles/view/opera-ua-string-changes/
					if ( strstr( $browser_number, '9.' ) && strstr( $this->browser_user_agent, 'version/' ) )
					{
						get_set_count( 'set', 0 );
						$browser_number = $this->get_item_version( $this->browser_user_agent, 'version/' );
					}
					
					if ( $browser_number < 5 )// opera 4 wasn't very useable.
					{
						$b_safe_browser = false;
					}
					$this->NumBrow = 300 + $browser_number;
					break;
				/*
				note: webkit returns always the webkit version number, not the specific user
				agent version, ie, webkit 583, not chrome 0.3
				*/
				case 'webkit':
					// note that this is the Webkit version number
					$browser_number = $this->get_item_version( $this->browser_user_agent, $browser_name );
					// this is to pull out specific webkit versions, safari, google-chrome etc..
					$j_count = count( $a_webkit_types );
					for ( $j = 0; $j < $j_count; $j++ )
					{
						if ( strstr( $this->browser_user_agent, $a_webkit_types[$j] ) )
						{
							$webkit_type = $a_webkit_types[$j];
							/*
							and this is the webkit type version number, like: chrome 1.2
							if omni web, we want the count 2, not default 1
							*/
							if ( $webkit_type == 'omniweb' )
							{
								$this->get_set_count( 'set', 2 );
							}
							$webkit_type_number = $this->get_item_version( $this->browser_user_agent, $webkit_type );
							// epiphany hack
							if ( $a_webkit_types[$j] == 'gtklauncher' )
							{
								$browser_name = 'epiphany';
							}
							else
							{
								$browser_name = $a_webkit_types[$j];
							}
							if($webkit_type == 'chrome')
								$this->NumBrow = 400 + $webkit_type_number;
							elseif($webkit_type == 'safari')
								$this->NumBrow = 500 + $webkit_type_number;
							else
								$this->NumBrow = 900+$j;
							break;
						}
					}
					break;
				default:
					$browser_number = $this->get_item_version( $this->browser_user_agent, $browser_name );
					if($browser_number < 50)
						$this->NumBrow = 50 + $browser_number;
					else
						$this->NumBrow = 50;

					break;
			}
			// the browser was id'ed
			$b_success = true;
			break;
		}
	}
	//assigns defaults if the browser was not found in the loop test
	if ( !$b_success )
	{

		$browser_name = 'NA';
		$browser_number = 'NA';

	}

	$this->dataAssoc =  array(
			'browser_working' => $browser_working,
			'browser_number' => $browser_number,
			'ie_version' => $ie_version,
			'dom' => $b_dom_browser,
			'safe' => $b_safe_browser,
			'os' => $os_type,
			'NumOsber' => $NumOsber,
			'browser_name' => $browser_name,
			'ua_type' => $ua_type,
			'browser_math_number' => $browser_math_number,
			'moz_data' => $a_moz_data,
			'webkit_data' => $a_webkit_data,
			'mobile_test' => $mobile_test,
			'mobile_data' => $a_mobile_data,
			'true_ie_number' => $true_ie_number,
			'run_time' => $run_time
		);

			
	$this->fullData = array(
				$browser_working, 
				$browser_number, 
				$ie_version, 
				$b_dom_browser, 
				$b_safe_browser, 
				$os_type, 
				$NumOsber, 
				$browser_name, 
				$ua_type, 
				$browser_math_number, 
				$a_moz_data, 
				$a_webkit_data, 
				$mobile_test, 
				$a_mobile_data, 
				$true_ie_number,
				$run_time
			);

	}
	function GetOS()
	{
	// initialize variables
	$os_working_type = '';
	$os_working_number = '';

	$pv_browser_string = $this->browser_user_agent;
	$pv_browser_name = $this->fullData[0];
	$pv_version_number = $this->fullData[1];

	$this->NumOs= 0;
	/*
	packs the os array. Use this order since some navigator user agents will put 'macintosh' 
	in the navigator user agent string which would make the nt test register true
	*/
	$a_mac = array( 'intel mac', 'ppc mac', 'mac68k' );// this is not used currently
	// same logic, check in order to catch the os's in order, last is always default item
	$a_unix_types = array( 'dragonfly', 'freebsd', 'openbsd', 'netbsd', 'bsd', 'unixware', 'solaris', 'sunos', 'sun4', 'sun5', 'suni86', 'sun', 'irix5', 'irix6', 'irix', 'hpux9', 'hpux10', 'hpux11', 'hpux', 'hp-ux', 'aix1', 'aix2', 'aix3', 'aix4', 'aix5', 'aix', 'sco', 'unixware', 'mpras', 'reliant', 'dec', 'sinix', 'unix' );
	// only sometimes will you get a linux distro to id itself...
	$a_linux_distros = array( 'ubuntu', 'kubuntu', 'xubuntu',  'debian', 'opensuse', 'suse', 'fedora', 'redhat', 'gentoo', 'linux' );
	$a_linux_process = array ( 'i386', 'i586', 'i686' );// not use currently
	// note, order of os very important in os array, you will get failed ids if changed
	$a_os_types = array( 'android', 'blackberry', 'iphone', 'palmos', 'palmsource', 'symbian', 'beos', 'os2', 'amiga', 'webtv', 'mac', 'nt', 'win', $a_unix_types, $a_linux_distros );
	
	//os tester
	$i_count = count( $a_os_types );
	for ( $i = 0; $i < $i_count; $i++ )
	{
		// unpacks os array, assigns to variable $a_os_working
		$os_working_data = $a_os_types[$i];
		/*
		assign os to global os variable, os flag true on success
		!strstr($pv_browser_string, "linux" ) corrects a linux detection bug
		*/
		if ( !is_array( $os_working_data ) && strstr( $pv_browser_string, $os_working_data ) && !strstr( $pv_browser_string, "linux" ) )
		{
			$os_working_type = $os_working_data;
			
			switch ( $os_working_type )
			{
				// most windows now uses: NT X.Y syntax
				case 'nt':
					if ( strstr( $pv_browser_string, 'nt 6.1' ) )// windows 7
					{
						$os_working_number = 6.1;
						$this->NumOs = 107;
					}
					elseif ( strstr( $pv_browser_string, 'nt 6.0' ) )// windows vista/server 2008
					{
						$os_working_number = 6.0;
						$this->NumOs = 106;
					}
					elseif ( strstr( $pv_browser_string, 'nt 5.2' ) )// windows server 2003
					{
						$os_working_number = 5.2;
						$this->NumOs = 115;
					}
					elseif ( strstr( $pv_browser_string, 'nt 5.1' ) || strstr( $pv_browser_string, 'xp' ) )// windows xp
					{
						$os_working_number = 5.1;//
						$this->NumOs = 105;
					}
					elseif ( strstr( $pv_browser_string, 'nt 5' ) || strstr( $pv_browser_string, '2000' ) )// windows 2000
					{
						$os_working_number = 5.0;
						$this->NumOs = 104;
					}
					elseif ( strstr( $pv_browser_string, 'nt 4' ) )// nt 4
					{
						$os_working_number = 4;
						$this->NumOs = 113;
					}
					elseif ( strstr( $pv_browser_string, 'nt 3' ) )// nt 4
					{
						$os_working_number = 3;
						$this->NumOs = 114;
					}
					break;
				case 'win':
					if ( strstr( $pv_browser_string, 'vista' ) )// windows vista, for opera ID
					{
						$os_working_number = 6.0;
						$os_working_type = 'nt';
						$this->NumOs = 106;
					}
					elseif ( strstr( $pv_browser_string, 'xp' ) )// windows xp, for opera ID
					{
						$os_working_number = 5.1;
						$os_working_type = 'nt';
						$this->NumOs = 105;
					}
					elseif ( strstr( $pv_browser_string, '2003' ) )// windows server 2003, for opera ID
					{
						$os_working_number = 5.2;
						$os_working_type = 'nt';
						$this->NumOs = 115;
					}
					elseif ( strstr( $pv_browser_string, 'windows ce' ) )// windows CE
					{
						$os_working_number = 'ce';
						$os_working_type = 'nt';
						$this->NumOs = 119;
					}
					elseif ( strstr( $pv_browser_string, '95' ) )
					{
						$os_working_number = '95';
						$this->NumOs = 101;
					}
					elseif ( ( strstr( $pv_browser_string, '9x 4.9' ) ) || ( strstr( $pv_browser_string, ' me' ) ) )
					{
						$os_working_number = 'me';
						$this->NumOs = 103;
					}
					elseif ( strstr( $pv_browser_string, '98' ) )
					{
						$os_working_number = '98';
						$this->NumOs = 102;
					}
					elseif ( strstr( $pv_browser_string, '2000' ) )// windows 2000, for opera ID
					{
						$os_working_number = 5.0;
						$os_working_type = 'nt';
						$this->NumOs = 104;
					}
					break;
				case 'mac':
					if ( strstr( $pv_browser_string, 'os x' ) )
					{
						$this->NumOs = 201;
						// if it doesn't have a version number, it is os x;
						if ( strstr( $pv_browser_string, 'os x ' ) )
						{
							// numbers are like: 10_2.4, others 10.2.4
							$os_working_number = str_replace( '_', '.', $this->get_item_version( $pv_browser_string, 'os x' ) );
						}
						else
						{
							$os_working_number = 10;
						}
					}
					/*
					this is a crude test for os x, since safari, camino, ie 5.2, & moz >= rv 1.3
					are only made for os x
					*/
					elseif ( ( $pv_browser_name == 'saf' ) || ( $pv_browser_name == 'cam' ) ||
						( ( $pv_browser_name == 'moz' ) && ( $pv_version_number >= 1.3 ) ) ||
						( ( $pv_browser_name == 'ie' ) && ( $pv_version_number >= 5.2 ) ) )
					{
						$os_working_number = 10;
						$this->NumOs = 201;
					}
					break;
				case 'iphone':
					$os_working_number = 10;
					break;
				default:
					break;
			}
			break;
		}
		/*
		check that it's an array, check it's the second to last item
		in the main os array, the unix one that is
		*/
		elseif ( is_array( $os_working_data ) && ( $i == ( $i_count - 2 ) ) )
		{
			$j_count = count($os_working_data);
			for ($j = 0; $j < $j_count; $j++)
			{
				if ( strstr( $pv_browser_string, $os_working_data[$j] ) )
				{
					$this->NumOs = 301+$j;
					$os_working_type = 'unix'; //if the os is in the unix array, it's unix, obviously...
					$os_working_number = ( $os_working_data[$j] != 'unix' ) ? $os_working_data[$j] : '';// assign sub unix version from the unix array
					break;
				}
			}
		}
		/*
		check that it's an array, check it's the last item
		in the main os array, the linux one that is
		*/
		elseif ( is_array( $os_working_data ) && ( $i == ( $i_count - 1 ) ) )
		{
			$j_count = count($os_working_data);
			for ($j = 0; $j < $j_count; $j++)
			{
				if ( strstr( $pv_browser_string, $os_working_data[$j] ) )
				{
					$this->NumOs = 401+$j;
					$os_working_type = 'lin';
					// assign linux distro from the linux array, there's a default
					//search for 'lin', if it's that, set version to ''
					$os_working_number = ( $os_working_data[$j] != 'linux' ) ? $os_working_data[$j] : '';
					break;
				}
			}
		}
	}

	// pack the os data array for return to main function
	$a_os_data = array( $os_working_type, $os_working_number );

	return $a_os_data;
	}


function get_item_version( $pv_browser_user_agent, $pv_search_string, $pv_b_break_last='', $pv_extra_search='' )
{
	// 12 is the longest that will be required, handles release dates: 20020323; 0.8.0+
	$substring_length = 15;
	$start_pos = 0; // set $start_pos to 0 for first iteration
	//initialize browser number, will return '' if not found
	$string_working_number = '';
	/* 
	use the passed parameter for $pv_search_string
	start the substring slice right after these moz search strings
	there are some cases of double msie id's, first in string and then with then number
	$start_pos = 0;
	this test covers you for multiple occurrences of string, only with ie though
	with for example google bot you want the first occurance returned, since that's where the
	numbering happens 
	*/
	for ( $i = 0; $i < 4; $i++ )
	{
		//start the search after the first string occurrence
		if ( strpos( $pv_browser_user_agent, $pv_search_string, $start_pos ) !== false )
		{
			// update start position if position found
			$start_pos = strpos( $pv_browser_user_agent, $pv_search_string, $start_pos ) + strlen( $pv_search_string );
			/*
			msie (and maybe other userAgents requires special handling because some apps inject 
			a second msie, usually at the beginning, custom modes allow breaking at first instance
			if $pv_b_break_last $pv_extra_search conditions exist. Since we only want this test
			to run if and only if we need it, it's triggered by caller passing these values.
			*/
			if ( !$pv_b_break_last || ( $pv_extra_search && strstr( $pv_browser_user_agent, $pv_extra_search ) ) ) 
			{
				break;
			}
		}
		else
		{
			break;
		}
	}
	/*
	Handles things like extra omniweb/v456, gecko/, blackberry9700
	also corrects for the omniweb 'v'
	*/
	$start_pos += $this->get_set_count( 'get' );
	$string_working_number = substr( $pv_browser_user_agent, $start_pos, $substring_length );

	// Find the space, ;, or parentheses that ends the number
	$string_working_number = substr( $string_working_number, 0, strcspn($string_working_number, ' );/') );

	//make sure the returned value is actually the id number and not a string
	// otherwise return ''
	// strcspn( $string_working_number, '0123456789.') == strlen( $string_working_number)
	//	if ( preg_match("/\\d/", $string_working_number) == 0 )
 	if ( !is_numeric( substr( $string_working_number, 0, 1 ) ) )
	{
		$string_working_number = '';
	}
	//$string_working_number = strrpos( $pv_browser_user_agent, $pv_search_string );
	return $string_working_number;
}

function get_set_count( $pv_type, $pv_value='' )
{
	static $slice_increment;
	$return_value = '';
	switch ( $pv_type )
	{
		case 'get':
			// set if unset, ie, first use. note that empty and isset are not good tests here
			if ( is_null( $slice_increment ) )
			{
				$slice_increment = 1;
			}
			$return_value = $slice_increment;
			$slice_increment = 1; // reset to default
			return $return_value;
			break;
		case 'set':
			$slice_increment = $pv_value;
			break;
	}
}

}
?>
