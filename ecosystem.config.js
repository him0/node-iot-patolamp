module.exports = {
  apps : [{
    name: 'IoT PATOLAMP',
    script: 'app.js',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    args: '--local',
    args_production: '',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : '',
      host : '',
      ref  : 'origin/master',
      repo : '',
      path : '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
