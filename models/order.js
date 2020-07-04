const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
});

module.exports = mongoose.model('Order', orderSchema);

// const Sequelize = require('sequelize');
// const Model = Sequelize.Model;
//
// const sequelize = require('../util/database');
//
// class Order extends Model {}
//
// Order.init(
//   {
//     id: {
//       type: Sequelize.INTEGER,
//       autoIncrement: true,
//       allowNull: false,
//       primaryKey: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: 'order',
//   }
// );
//
// module.exports = Order;
