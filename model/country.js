/*jshint esnext: true*/
/*jshint node: true*/

/**
 * Country model
 * @param  {[type]} sequelize [description]
 * @param  {[type]} DataTypes [description]
 * @return {[type]}           [description]
 */
module.exports = (sequelize, DataTypes) => {
    var Country = sequelize.define('country', {
        id: { type: DataTypes.INTEGER, allowNull: true, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true, validate: { max: 200 } },
        createAt: { type: DataTypes.DATE, allowNull: true },
        updateAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
        timestamps: false,
        freezeTableName: true,
        instanceMethods: {
            mapAttributes: sequelize.map
        },
        classMethods: {
            associate: (models) => {
                /*
                Associations can be defined here. E.g. like this:
                global.db.User.hasMany(global.db.SomethingElse)
                */
                models.Country.hasMany(models.City);
                models.City.belongsTo(models.Country);
            }
        }
    });
    return Country;
};