const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  try {
    var config = require('./config.json')[env];
  } catch(e) {
    console.log("Read section 'Environment Configurations' in the README.md" );
    process.exit(1);
  }

  for (key in config) {
    process.env[key] = config[key];
  }
}