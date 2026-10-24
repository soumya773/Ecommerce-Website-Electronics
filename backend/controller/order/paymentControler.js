const stripe= require("../../config/stripe")
const userModel = require("../../models/userModel")

const paymentControllor=async(request,response)=>{
    try{
        const {cartItems} = request.body
        

        const user = await userModel.fineOne({_id : request.userId})

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            billing_address_collection :'auto',
            shipping_option : [
                {
                      shipping_rate : 'shr_1Pc9rjAWf19Fn4gqwgwwQUrH'


                }
            ],
            costumer_email : user.email,
            line_item :cartItems.map((item,index)=>{
                return{
                    price_data : {
                        currency : 'inr',
                        product_data : {
                          name: item.productId.productName,
                          image: item.productId.productImage,
                          metadata: {
                            productId: item.productId._id
                          }

                        },
                        unit_amount : item.productId.sellingPrice
                    },
                    adjustable_quantity : {
                        enabled : true,
                        minimum : 1
                    },
                    quantity : item.quantity
                }
            }),
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            
        }

        const session = await stripe.checkout.sessions.create(params)
        response.status(303).json(session)
    }catch(err){
        res.json({
            message : err?.message || err,
            error : true,
            success : false
        })
    }

}

module.exports = paymentControllor
