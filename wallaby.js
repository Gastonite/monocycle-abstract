module.exports = function () {
  return {
    files: [
      '**/*.js',
      '!**/*.spec.js',
      '!node_modules/**/*',
      '!old/**/*',
    ],

    tests: [
      '**/*.spec.js',
    ],
    env: {
      type: 'node'
    },
    setup: function (wallaby) {
      // console.log('setup', wallaby)
      var mocha = wallaby.testFramework;
      mocha.ui('tdd');
      mocha.timeout(5000);
      // etc.
      // require('module-alias/register')

    }
  };
};
