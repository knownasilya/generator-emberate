'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var clientFolders = require('./client-folders');
var gulpTasks = require('./gulp-tasks');

var EmberateGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../../package.json');
    this.option('skip-install', {
      type: 'Boolean'
    });
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the first-class Emberate generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'appName',
      message: 'What would you like to call your app?',
      default: this.appname
    }, {
      type: 'list',
      name: 'buildTool',
      message: 'Which build tool would you like to use?',
      default: 0,
      choices: [
        'gulp',
        'grunt',
        'broccoli',
        'npm scripts',
        'none'
      ]
    }, {
      type: 'list',
      name: 'cssPreprocessor',
      message: 'Which CSS preprocessor would you like to use?',
      default: 0,
      choices: [
        'none',
        'Less',
        'Sass'
      ]
    }];

    this.prompt(prompts, function (props) {
      this.appName = props.appName;
      this.buildTool = props.buildTool;
      this.cssPreprocessor = props.cssPreprocessor;

      done();
    }.bind(this));
  },

  writing: {
    deps: function () {
      this.template('_bower.json', 'bower.json');
      this.src.copy('shims.js', 'shims.js');
    },

    buildTool: function () {
      // TODO: implement grunt/broccoli
      switch(this.buildTool) {
        case 'gulp': {
          this.template('gulp_package.json', 'package.json');
          this.template('gulpfile.js', 'gulpfile.js');

          this.directory('gulp', 'gulp');

          gulpTasks.forEach(function (task) {
            this.composeWith('emberate:gulp-task', {
              arguments: [task]
            });
          }, this);
          return;
        }

        case 'none': {
          return;
        }

        default: {
          this.log('The \'' + this.buildTool +
            '\' build tool is coming soon, in the mean time use \'gulp\'.');
          process.exit(1);
        }
      }
    },

    client: function () {
      this.dest.mkdir('client');

      clientFolders.forEach(function (folder) {
        this.dest.mkdir('client/' + folder);
      }, this);

      this.src.copy('client/app.js', 'client/app.js');
      this.src.copy('client/router.js', 'client/router.js');
      this.src.copy('client/application.hbs', 'client/templates/application.hbs');
    },

    styles: function () {
      var isLess = this.cssPreprocessor === 'Less';

      this.template('styles/app.css', 'client/styles/app.' + (isLess ? 'less' : 'css'));

      if (isLess) {
        this.src.copy('styles/libs.less', 'client/styles/libs.less');
      }
    },

    statics: function () {
      this.dest.mkdir('static');

      this.template('static/index.html', 'static/index.html');
    },

    helpers: function () {
      this.src.copy('editorconfig', '.editorconfig');
      this.src.copy('jshintrc', '.jshintrc');
      this.src.copy('jscsrc', '.jscsrc');
    }
  },

  end: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});

module.exports = EmberateGenerator;
