'use strict';
var passthru = require('passthru');
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs-extra');

var Np_cakephpGenerator = module.exports = function Np_cakephpGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });

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

  var prompts = [{
    type: 'confirm',
    name: 'someOption',
    message: 'Would you like to enable this option?',
    default: true
  }];

  this.security_salt = _randomString(40);
  this.security_seed = _randomString(30, '0123456789');

  cb();

  // this.prompt(prompts, function (props) {
  //   this.someOption = props.someOption;

  //   cb();
  // }.bind(this));
};

Np_cakephpGenerator.prototype.app = function app() {
  // this.mkdir('app');

  // Cake basis
  // this.directory('_cakephp', './');

  // this.copy('_cake', 'cake');

  this.copy('composer.phar', 'composer.phar');

  this.copy('_composer.json', 'composer.json');
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
};

Np_cakephpGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');

  // this.template('_cakephp/app/Config/core.php', 'app/Config/core.php');
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

// Np_cakephpGenerator.prototype.configuration = function configuration() {
//   this.write('app/Config/database.php', [
//     "<?php",
//     "class DATABASE_CONFIG {",
//     "",
//     "    public $default = array(",
//     "        'datasource' => 'Database/Mysql',",
//     "        'persistent' => false,",
//     "        'host' => 'localhost',",
//     "        'login' => 'root',",
//     "        'password' => 'root',",
//     "        'database' => 'wpwp',",
//     "        'prefix' => '',",
//     "        'encoding' => 'utf8',",
//     "        );",
//     "",
//     "    public $test = array(",
//     "        'datasource' => 'Database/Mysql',",
//     "        'persistent' => false,",
//     "        'host' => 'localhost',",
//     "        'login' => 'user',",
//     "        'password' => 'password',",
//     "        'database' => 'test_database_name',",
//     "        'prefix' => '',",
//     "        //'encoding' => 'utf8',",
//     "        );",
//     "}",
//     "?>"
//   ].join('\n'));
// }
