const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;
// const getDb = require('../util/database').getDb;
//
// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userId = userId;
//   }
//
//   save() {
//     const db = getDb();
//     let dbOps;
//     if (this._id) {
//       dbOps = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOps = db.collection('products').insertOne(this);
//     }
//     return dbOps
//       .then((result) => {
//         console.log('Product 27', result);
//       })
//       .catch((error) => console.log(error));
//   }
//
//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((error) => console.log(error));
//   }
//
//   static findById(id) {
//     const db = getDb();
//     return db.collection('products').findOne({ _id: new ObjectId(id) });
//   }
//
//   static delete(id) {
//     const db = getDb();
//     return db.collection('products').deleteOne({ _id: new ObjectId(id) });
//   }
// }
//
// module.exports = Product;
