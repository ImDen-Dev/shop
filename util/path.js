const path = require('path');

exports.rootDir = path.dirname(require.main.filename);
exports.prodFile = path.join(
  path.dirname(require.main.filename),
  'data',
  'product.json'
);
exports.cartFile = path.join(
  path.dirname(require.main.filename),
  'data',
  'cart.json'
);
