if (!global.hasOwnProperty('db')) {
   
    let config = config.database;
    let Sequelize = require('sequelize');
    let sequelize = null;

    if (config.heroku) {
        // the application is executed on Heroku ... use the postgres database
        sequelize = new Sequelize(config.heroku, {
            dialect: 'postgres',
            protocol: 'postgres',
            port: config.port,
            host: config.host,
            logging: config.logging
        });
    } else {
        // the application is executed on the local machine ... 
        sequelize = new Sequelize(config.schema, config.user, config.password, {
            host: config.host,
            port: config.port,
            logging: config.logging,
            dialect: config.dialect,
            pool : config.pool,
            omitNull: config.omitNull
        });
    }

    sequelize.map = function() {
        let obj = {};
        let ctx = this;
        ctx.attributes.forEach(function(attr) {
            obj[attr] = ctx[attr];
        });
        return obj;
    };

    global.db = {
        Sequelize: Sequelize,
        sequelize: sequelize,
        
        //add your other models here
        //User: sequelize.import(__dirname + '/model/user'),
        //City: sequelize.import(__dirname + '/model/city'),
        //Country: sequelize.import(__dirname + '/model/country'),
    };

    // import models from dir
    let dir = __dirname + '/model';
    //console.log('loading models found in ' + dir);
    let files = require('readdir').readSync(dir, ['**.js']);
    _.forEach(files, function(file) {
        let cName = file.split('.')[0];
        let mName = cName.substring(0, 1).toUpperCase() + cName.substring(1);
        //console.log('importing models/' + file + ' as ' + mName);
        global.db[mName] = sequelize.import(__dirname + '/model/' + cName);
    });

    //console.log('running associations', 'info');
    _.forEach(global.db, function(val, key) {
        if(_.isFunction(val.associate)) {
            val.associate(global.db);
        }
    });

    /*
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
    */
    //global.db.Country.hasMany(global.db.City);
    //global.db.City.hasMany(global.db.User);
}

module.exports = global.db;