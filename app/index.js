'use strict';
var passthru = require('passthru');
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs-extra');

var CakephpGenerator = module.exports = function CakephpGenerator(args, options, config) {
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

util.inherits(CakephpGenerator, yeoman.generators.Base);

function _randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

CakephpGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);
  cb();

};

CakephpGenerator.prototype.app = function app() {
  this.copy('_composer.json', 'composer.json');
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  this.copy('_gitignore', '.gitignore');
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};

CakephpGenerator.prototype.composer = function composer() {
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

CakephpGenerator.prototype.cakesetup = function cakesetup() {
  var cb = this.async();

  fs.unlink('app/Controller/AppController.php');
  fs.unlink('app/Model/AppModel.php');

  this.copy('_cakefiles/_AppController.php', 'app/Controller/AppController.php');
  this.copy('_cakefiles/_AppModel.php', 'app/Model/AppModel.php');

  this.mkdir('app/Config/Environment');
  this.copy('_cakefiles/Environment/_production.php', 'app/Config/Environment/production.php');
  this.copy('_cakefiles/Environment/_staging.php', 'app/Config/Environment/staging.php');
  this.copy('_cakefiles/Environment/_development.php', 'app/Config/Environment/development.php');

  this.copy('_cakefiles/_autoloader.ini', 'app/Vendor/cakephp/autoloader.ini');
  this.copy('_cakefiles/_index.php', 'index.php');
  this.copy('_cakefiles/_htaccess', '.htaccess');

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
      "  Configure::load('Environment/'.$_SERVER['APPLICATION_ENV']);",
      "} else {",
      "  Configure::load('Environment/production');",
      "}",
      "",
      "// Load all Plugins",
      "CakePlugin::loadAll(array('Sledgehammer' => array('bootstrap' => true)));", // Also includes composer/autoload.php.
      "",
      "// Remove and re-prepend CakePHP's autoloader as composer thinks it is the most important.",
      "// See https://github.com/composer/composer/commit/c80cb76b9b5082ecc3e5b53b1050f76bb27b127b",
      "spl_autoload_unregister(array('App', 'load'));",
      "spl_autoload_register(array('App', 'load'), true, true);"
    ].join('\n'), 'utf8', function (err) {
      if (err) return console.log(err);
  });

  fs.readFile('app/View/Layouts/default.ctp', 'utf8', function (err,data) {
    if (err) return console.log(err);

    var result = data.replace("$this->element('sql_dump');", "$this->element('statusbar', array(), array('plugin' => 'Sledgehammer'));");

    fs.writeFile('app/View/Layouts/default.ctp', result, 'utf8', function (err) {
      if (err) return console.log(err);
    });

  });

  cb();

};
