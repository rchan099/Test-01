/**
 * User model
 * @param  {[type]} sequelize [description]
 * @param  {[type]} DataTypes [description]
 * @return {[type]}           [description]
 */
module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('user', {
        id: { type: DataTypes.INTEGER, allowNull: true, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true, validate: { max: 200 } },
        gender: { type: DataTypes.INTEGER, allowNull: true },
        cityId : { type: DataTypes.INTEGER, allowNull: true },
        createAt : { type: DataTypes.DATE, allowNull: true },
        updateAt : { type: DataTypes.DATE, allowNull: true },
    },
    {
        timestamps: false,
        freezeTableName: true,
        instanceMethods: {
            mapAttributes: sequelize.map
        }
    });
    return User;
};