module.exports = {
  apps: [
    {
      name: 'gongmo',
      watch: true,
      ignore_watch: ['node_modules', 'views', 'assets', 'dist', 'content', '.idea', '.git'],
      script: 'index.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
