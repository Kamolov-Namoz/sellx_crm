// PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'prosell-backend',
      cwd: '/opt/prosell/backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 9999,
      },
      error_file: '/var/log/prosell/backend-error.log',
      out_file: '/var/log/prosell/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'prosell-frontend',
      cwd: '/opt/prosell/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 9090',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 9090,
      },
      error_file: '/var/log/prosell/frontend-error.log',
      out_file: '/var/log/prosell/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
