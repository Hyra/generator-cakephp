<!-- # Generator-cakephp -->
<!-- [![Build Status](https://secure.travis-ci.org/Hyra/generator-cakephp.png?branch=master)](https://travis-ci.org/Hyra/generator-cakephp) -->

# Generator-CakePHP

A generator for Yeoman.

## Functionality

This Generator will install CakePHP, do some initial configuration (much like `bake` would do) and implement some "best practices" we use at the office.

Most notably you will have multiple Config files. One per environment.

These environmental config files can be found in `app/Config/Environment/` and are loaded depending on your `APPLICATION_ENV` variable.

## Getting started
- Make sure you have [yo](https://github.com/yeoman/yo) installed:
    `npm install -g yo`
- Install the generator: `npm install -g generator-cakephp`
- Run: `yo cakephp`
- Set the following Environment Variable:

  SetEnv APPLICATION_ENV development

You can set this where you want. Your .htaccess, httpd.conf or within your vhost.

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
