const Sequelize = require('sequelize');

// Connect DB
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    dialectOptions: {
        dateStrings: true,
        typeCast: function (field, next) {
            if(field.type === 'DATETIME') {
                return field.string();
            }
            return next();
        }
    },
    timezone: process.env.DB_TIMEZONE
});

// Check if the DB has connected successfully
sequelize.authenticate()
    .then(() => {
        console.log('Connection established successfully')
    })
    .catch((err) => {
        console.log(err)
    }
);

// Create db table if it does not exist
sequelize.sync();

module.exports = sequelize;