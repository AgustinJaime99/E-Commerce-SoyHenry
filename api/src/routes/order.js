const server = require('express').Router();
const { Order, OrderLine, Product } = require("../db.js");

// Create Order
server.post('/:userId', async (req, res, next) => {
    try {
        const { state, purchaseAmount, shippingCost, shippingAddress, shippingZip, shippingCity } = req.body
        let obj = { state, purchaseAmount, shippingCost, shippingAddress, shippingZip, shippingCity }
        const order = await Order.create(obj)
        order.userId = req.params.userId;
        order.save()
        res.json(order);
    } catch (e) {
        res.status(500).send({
            message: 'There has been an error'
        });
        next(e);
    }
})

// Update Order
server.put('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { state, purchaseAmount, shippingCost, shippingAddress, shippingZip, shippingCity } = req.body;
        let obj = { state, purchaseAmount, shippingCost, shippingAddress, shippingZip, shippingCity };
        const order = await Order.update( obj, { where: { userId } });
        res.json(order)
    } catch (e) {
        res.status(500).json({
            message: 'There has been an error'
        });
        next(e);
    }
})

// Delete Order
server.delete('/:orderId', async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        order.destroy()
        res.json(order)
    } catch (e) {
        res.status(500).send({
            message: 'There has been an error'
        });
        next(e);
    }
})

// List all orders
server.get('/', async (req, res, next) => {
    try {
        const orders = await Order.findAll()
        res.json(orders);
    } catch (e) {
        res.status(500).send({
            message: 'There has been an error'
        });
        next(e);
    }
})

// List active order
server.get('/active/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params
        const orders = await Order.findAll({
            where: {state: 'cart' || 'created', userId}
        })
        res.json(orders);
    } catch (e) {
        res.status(500).send({
            message: 'There has been an error'
        });
        next(e);
    }
})

// List one order
server.get('/:id', async (req, res, next) => {
    try {
      const {id} = req.params
      const order = await Order.findByPk(id)
      res.json(order)
    } catch (e) {
      res.status(500).send({
        message: 'There has been an error'
      });
      next(e);
    }
  })

// List user's orders
server.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params
        let response = [];
        const orders = await Order.findAll( { where: {userId } });
        orders.forEach(order => order.userId === userId && response.push(order));
        res.json(response);
    } catch (e) {
        res.status(500).send({
            message: 'There has been an error'
        });
        next(e);
    }
})

// Add item to cart

server.post('/users/:userId/cart', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: {
        userId: req.params.userId,
        state: 'cart',
      },
    });
    const product = await Product.findByPk(req.body.id);
    if(product.stock > 0){
      product.stock = product.stock - 1
      product.save()
      const orderLine = await OrderLine.create({
        productId: product.id, orderId: order.id, price: product.price, quantity: 1
      })  
      res.json(orderLine);
    } else {
      res.json({message: "No hay mas stock del producto"})
    }

  } catch (e) {
    res.status(500).send({
      message: 'There has been an error',
    });
    next(e);
  }
});

// Get cart's items

server.get('/users/:userId/cart', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: {
        userId: req.params.userId,
        state: 'cart',
      },
    });
    console.log(order)
    
    const items = await OrderLine.findAll({
      where: {
        orderId: order.id,
      },
    });
    console.log(items)
    res.json(items);
  } catch (e) {
    res.status(500).send({
      message: 'There has been an error',
    });
    next(e);
  }
});

// Delete item from cart

server.delete('/users/:userId/cart', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: {
        userId: req.params.userId,
        state: 'cart',
      },
    });
    const product = await Product.findByPk(req.body.id);
    const orderLine = await OrderLine.findOne({
      where:{
        productId: product.id,
        orderId: order.id,
      }
    });
    
    let quantity = orderLine.quantity
    orderLine.destroy()
    product.stock = product.stock + quantity
    product.save()
    
    res.json(orderLine);
  } catch (e) {
    res.status(500).send({
      message: 'There has been an error',
    });
    next(e);
  }
});

// Update item quantity

server.put('/users/:userId/cart', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: {
        userId: req.params.userId,
        state: 'cart',
      },
    });
    const product = await Product.findByPk(req.body.id);
    const orderLine = await OrderLine.findOne({
      where: {
        productId: product.id,
        orderId: order.id,
      },
    });
    let result = orderLine.quantity - req.body.quantity
    if(product.stock + result >= 0){
      product.stock = product.stock + result
      orderLine.quantity= req.body.quantity;
      product.save()
      orderLine.save()
      res.json(orderLine);
    } else {
      res.json({ message: 'No podes agregar mas productos porque no hay stock' });
    }

  } catch (e) {
    res.status(500).send({
      message: 'There has been an error',
    });
    next(e);
  }
});




module.exports = server;
