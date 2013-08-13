<?php
/**
 * Application level Controller
 *
 * This file is application-wide controller file. You can put all
 * application-wide controller-related methods here.
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Controller
 * @since         CakePHP(tm) v 0.2.9
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

App::uses('Controller', 'Controller');

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @package       app.Controller
 * @link http://book.cakephp.org/2.0/en/controllers.html#the-app-controller
 */
class AppController extends Controller {

	public $components = array(
		'Session',
		'RequestHandler',
    'DebugKit.Toolbar' => array()
	);

	public $helpers = array(
		'Html',
		'Form',
		'Session',
		'Time'
	);

	public function beforeFilter() {
		// Handle .ext requests with a dedicated view
		if($this->RequestHandler->ext == 'json') {
			$this->viewClass = 'Json';
		} elseif($this->RequestHandler->ext == 'xml') {
			$this->viewClass = 'Xml';
		}

		// Set admin view when needed
		if(isset($this->params['admin'])) {
			$this->layout = 'admin';
		}

		// Disable cache and set debug to 0 for Ajax requests
		if ($this->request->is('ajax')) {
			$this->disableCache();
		}

		// Set the body class
		$this->set('bodyClass', $this->request->params['controller'].' '.$this->request->params['action']);

		// API Headers and options
		if($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
			$this->autoRender = false;
		}
		$this->response->header(array(
			'Access-Control-Allow-Origin' => isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '',
			'Access-Control-Allow-Credentials' => 'true',
			'Access-Control-Allow-Methods' => 'PUT, GET, POST, DELETE, OPTIONS',
			'Access-Control-Allow-Headers' => 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
			'Access-Control-Max-Age' => '-10',
			)
		);

	}

}
