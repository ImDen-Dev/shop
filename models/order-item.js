const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = require('../util/database');

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: Sequelize.INTEGER,
  },
  {
    sequelize,
    modelName: 'orderItem',
  }
);

module.exports = OrderItem;
