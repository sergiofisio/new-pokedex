const APP_DIR = process.env.APP_DIR || '/var/www/taverna';
const PORT = process.env.APP_PORT || '3010';

module.exports = {
  apps: [
    {
      name: 'taverna',
      cwd: `${APP_DIR}/current`,
      script: 'node_modules/next/dist/bin/next',
      args: `start -H 127.0.0.1 -p ${PORT}`,
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1200M',
      kill_timeout: 15000,
      time: true,
    },
  ],
};
