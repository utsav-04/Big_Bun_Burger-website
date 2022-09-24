const Order = require('../../../models/order')
const moment = require('moment')

function orderController () {
    return {
        store(req,res){
            const{phone, address} = req.body
            if(!phone || !address) {
                req.flash('error', 'All Fields are required')
                return res.redirect('/cart')
            }

            const order = new Order ({
                customerId : req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address:address
            })
            order.save().then (result => {
                Order.populate(result,{path: 'customerId'},(err,resplaced) =>{
                    req.flash('success', 'Order placed Successfully')
                    delete req.session.cart
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', resplaced)
                    return res.redirect('/customer/orders')
                } )
            }).catch(err => {
                req.flash('error', 'Something went Wrong')
                return res.redirect('/cart')
            })
        }, 
        async index(req,res) {
            const orders = await Order.find({customerId: req.user._id},null, {sort: {'createdAt': -1}})
            res.render('customers/orders',{orders:orders, moment:moment})
        },

        async show(req,res) {
            const order = await Order.findById(req.params.id)
            if(req.user._id.toString() === order.customerId.toString()) {
                res.render('customers/singleOrder', {order})
            } else {
                res.redirect('/')
            }
        }
    }
}

module.exports = orderController