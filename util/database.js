/*jshint esnext: true*/
/*jshint node: true*/
'use strict';

class Database {

    // constructor
    constructor() {
        this.Sequelize = require('sequelize');
        this.config = global.config.database;
        this.sequelize = null;

        if (this.config.heroku) {
            // the application is executed on Heroku ... use the postgres database
            this.sequelize = new this.Sequelize(this.config.heroku, {
                dialect: 'postgres',
                protocol: 'postgres',
                port: this.config.port,
                host: this.config.host,
                logging: this.config.logging
            });
        } else {
            // the application is executed on the local machine ... 
            this.sequelize = new this.Sequelize(this.config.schema, this.config.user, this.config.password, {
                host: this.config.host,
                port: this.config.port,
                logging: this.config.logging,
                dialect: this.config.dialect,
                pool : this.config.pool,
                omitNull: this.config.omitNull
            });
        }

        this.sequelize.map = (ctx) => {
            let obj = {};
            ctx.attributes.forEach(function(attr) {
                obj[attr] = ctx[attr];
            });
            return obj;
        };
    }
}

if (!global.hasOwnProperty('db')) {
    let database = new Database();

    global.db = {
        Sequelize: database.Sequelize,
        sequelize: database.sequelize
    };

    // import models from dir
    let dir = `${__dirname}/../model`;
    let files = require('readdir').readSync(dir, ['**.js']);
    global._.forEach(files, function(file) {
        let cName = file.split('.')[0];
        let mName = cName.substring(0, 1).toUpperCase() + cName.substring(1);
        global.db[mName] = global.db.sequelize.import(`${dir}/${cName}`);
    });

    global._.forEach(global.db, function(val, key) {
        if(global._.isFunction(val.associate)) {
            val.associate(global.db);
        }
    });
}

module.exports = global.db;
