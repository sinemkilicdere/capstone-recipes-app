'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    userId: DataTypes.INTEGER, // NEW FIELD
    category: DataTypes.STRING,
  }, {});
  
  Recipe.associate = function(models) {
    Recipe.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Recipe;
};
