'use strict';
var passthru = require('passthru');
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs-extra');

var Np_cakephpGenerator = module.exports = function Np_cakephpGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  var done = this.async();

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });

    passthru("app/Vendor/bin/cake -app app", function() {
      done();
    });

  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(Np_cakephpGenerator, yeoman.generators.Base);

function _randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

Np_cakephpGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
    {
      name: 'db_local_db',
      message: 'Local database DB Name',
      type: 'string',
      default: 'cake_dev'
    },
    {
      name: 'db_local_user',
      message: 'Local database Username',
      default: ''
    },
    {
      name: 'db_local_pass',
      message: 'Local database Password',
      type: 'password'
    }
  ];

  this.prompt(prompts, function (props) {
    this.db_local_user = props.db_local_user;
    this.db_local_pass = props.db_local_pass;
    this.db_local_db = props.db_local_db;
    cb();
  }.bind(this));

};

Np_cakephpGenerator.prototype.app = function app() {
  this.copy('_composer.json', 'composer.json');
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  this.copy('_gitignore', '.gitignore');
  this.copy('_cake', 'cake');
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};

Np_cakephpGenerator.prototype.composer = function composer() {
  var cb = this.async();

  this.fetch('https://getcomposer.org/composer.phar', 'composer.phar', function (err) {
    if (err) return done(err);
    passthru("php composer.phar install", function() {
      fs.copy('app/Vendor/cakephp/cakephp/app/', 'app', function() {
        cb();
      });
    });
  });

};

Np_cakephpGenerator.prototype.cakesetup = function cakesetup() {
  var cb = this.async();

  fs.unlink('app/Controller/AppController.php');
  fs.unlink('app/Model/AppModel.php');

  this.copy('_cakefiles/_AppController.php', 'app/Controller/AppController.php');
  this.copy('_cakefiles/_AppModel.php', 'app/Model/AppModel.php');

  this.mkdir('app/Config/Environment');
  this.copy('_cakefiles/Environment/_production.php', 'app/Config/Environment/production.php');
  this.copy('_cakefiles/Environment/_staging.php', 'app/Config/Environment/staging.php');
  this.template('_cakefiles/Environment/_local.php', 'app/Config/Environment/local.php');

  this.copy('_cakefiles/_database.php', 'app/Config/database.php');

  fs.readFile('app/webroot/index.php', 'utf8', function (err,data) {
    if (err) return console.log(err);

    var result = data.replace('//define(\'CAKE_CORE_INCLUDE_PATH\', ROOT . DS . \'lib\');', 'define(\'CAKE_CORE_INCLUDE_PATH\',  ROOT . DS . APP_DIR . \'/Vendor/cakephp/cakephp/lib\');');

    fs.writeFile('app/webroot/index.php', result, 'utf8', function (err) {
      if (err) return console.log(err);
    });

  });

  fs.readFile('app/Config/core.php', 'utf8', function (err,data) {
    if (err) return console.log(err);

    var result = data.replace('DYhG93b0qyJfIxfs2guVoUubWwvniR2G0FgaC9mi', _randomString(40));
    result = result.replace('76859309657453542496749683645', _randomString(30, '0123456789'));
    result = result.replace("\t//date_default_timezone_set('UTC');", "date_default_timezone_set('Europe/Amsterdam');");

    fs.writeFile('app/Config/core.php', result, 'utf8', function (err) {
      if (err) return console.log(err);
    });

  });

  fs.appendFile('app/Config/bootstrap.php', [
      "// Bootstrap for the different environments",
      "if(isset($_SERVER['APPLICATION_ENV'])) {",
      "  if($_SERVER['APPLICATION_ENV'] == 'development') {",
      "    $_SERVER['APPLICATION_ENV'] = 'local';",
      "    define('ENVIRONMENT', 'development');",
      "  }",
      "  Configure::load('Environment/'.$_SERVER['APPLICATION_ENV']);",
      "} else {",
      "  if(isset($_SERVER['SHELL'])) {",
      "    Configure::load('Environment/local');",
      "  } else {",
      "    Configure::load('Environment/production');",
      "  }",
      "}",
      "",
      "// Load all Plugins",
      "CakePlugin::loadAll();",
      "",
      "// Load composer autoload.",
      "require APP . '/Vendor/autoload.php';",
      "",
      "// Remove and re-prepend CakePHP's autoloader as composer thinks it is the most important.",
      "// See https://github.com/composer/composer/commit/c80cb76b9b5082ecc3e5b53b1050f76bb27b127b",
      "spl_autoload_unregister(array('App', 'load'));",
      "spl_autoload_register(array('App', 'load'), true, true);"
    ].join('\n'), 'utf8', function (err) {
      if (err) return console.log(err);
  });

  cb();

};
