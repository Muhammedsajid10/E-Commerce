var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Nexmo = require('nexmo'); // Add this line
const nexmo = new Nexmo({       // Add this line
    apiKey: 'cfd99d6e',          // Add this line
    apiSecret: 'bMfsup2T0bOWZXRq'// Add this line
}); 


var instance = new Razorpay({
    key_id: 'rzp_test_atYj0FqtD6vMdk',
    key_secret: 'ACJS21d25dd0cAdJ3rSNpTYi'
});


module.exports = {
    // doSignup: (userData) => {
    //     return new Promise(async (resolve, reject) => {
    //         userData.password = await bcrypt.hash(userData.password, 10) // ivide  
    //         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
    //             console.log('its a data.insertedId:::', data.insertedId)
    //             resolve(data.insertedId)
    //         })
    //     })
    // },
    // doSignup: async (name, email, password, mobile) => {
    //     try {
    //         const salt = await bcrypt.genSalt(10);
    //         const hashedPass = await bcrypt.hash(password, salt);
    //         const user = {
    //             name: name,
    //             email: email,
    //             password: hashedPass,
    //             mobile: mobile
    //         }
    //         console.log('The user is in doSingup method')
    //         return user;
    //     } catch (error) {
    //         console.log('The error during singup::',error);
    //         throw error;
    //     }
    // },

    // sendOTP: (mobile, otp) => {
    //     return new Promise(async (resolve, reject) => {
    //         console.log(mobile)
    //         console.log(otp)

    //         try {
    //             const from = 'Nexmo';
    //             const to = mobile;
    //             const text = `Your OTP for signup is: ${otp}`;

    //             //send the OTP via SMS
    //             nexmo.message.sendSms(from, to, text, (err, response) => {
    //                 if (err) {
    //                     console.log('Error sending OTP:', err);
    //                     reject(err);
    //                 } else {
    //                     console.log('OTP sent successfully!', response);

    //                 }
    //             });

    //             // Store the OTP in database
    //             const otpObj = {
    //                 mobile,
    //                 otp,
    //                 createdAt: new Date()
    //             };
    //             await db.get().collection(collection.OTP_COLLECTION).insertOne(otpObj).then((result) => {
    //                 console.log('OTP stored in database:', result);
    //                 resolve(result)
    //             });

    //         } catch (error) {
    //             console.log('Error storing OTP in database:', error);
    //             reject(err)



    //         }
    //     })


    // },

    // generateOTP: () => {
    //     const digits = '0123456789';
    //     let OTP = '';
    //     for (let i = 0; i < 6; i++) {
    //         OTP += digits[Math.floor(Math.random() * 10)]
    //     }
    //     return OTP;
    // },
    // verifyOTP: (otp, userEnterOTP) => {
    //     return new Promise((resolve, reject) => {
    //         resolve(otp === userEnterOTP)
    //     })
    // },



    ///////////////////////////////////////////////////////////////////////////////////


    doSignUp: async (name, email, password, mobile, otp) => {
        console.log('the password isssssssssssss:::', password)
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = {
                name: name,
                email: email,
                password: hashedPassword,
                mobile: mobile,
                
            };
            console.log("The user is in doSignup method :::::",user);
            return user
        } catch (error) {
            console.error('Error during sign up:', error);
            throw error;
        }
    },


    sendOTP: (mobile, otp) => {
        return new Promise(async (resolve, reject) => {
            console.log(mobile)
            console.log(otp)

            try {
                const from = 'Nexmo';
                const to = mobile;
                const text = `Your OTP for signup is: ${otp}`;
                // const from = "Vonage APIs"
                // const to = mobile;
                // const text = 'A text message sent using the Vonage SMS API'

                //send the OTP via SMS
                nexmo.message.sendSms(from, to, text, (err, response) => {
                    if (err) {
                        console.log('Error sending OTP:', err);
                        reject(err);
                    } else {
                        console.log('OTP sent successfully!', response);

                    }
                });
                // vonage.sms.send(from, to, text, (err, response) => {
                //     if (err) {
                //         console.log('Error sending OTP:', err);
                //         reject(err);
                //     } else {
                //         console.log('OTP sent successfully!', response);

                //     }
                // });

                // Store the OTP in database
                const otpObj = {
                    mobile,
                    otp,
                    createdAt: new Date()
                };
                await db.get().collection(collection.OTP_COLLECTION).insertOne(otpObj).then((result) => {
                    console.log('OTP stored in database:', result);
                    resolve(result)
                });

            } catch (error) {
                console.log('Error storing OTP in database:', error);
                reject(error)



            }
        })


    },

    generateOTP: () => {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)]
        }
        return OTP;
    },
    verifyOTP: (otp, userEnterOTP) => {
        return new Promise((resolve, reject) => {
            resolve(otp === userEnterOTP)
        })
    },
    createUser: async(user) => {
        // console.log('createUser:', name, email, mobile, password);
        return new Promise(async (resolve, reject) => {
            try {
                
                const result = await db.get().collection(collection.USER_COLLECTION).insertOne(user)
                    console.log('User account created successfully!');
                    console.log('telllllll insertedIddd::',result.insertedId)
                    resolve({ insertedId: result.insertedId, user: user });  // ivide nammal 2 value pass cheyyunnud  1: inasertedID , 2: user
                    return(user)

            } catch (error) {
                console.error('User account not created successfully', error)
                reject()
            }


        })

    },


    /////////////////////////////////////////////////////////////////////////////////

    doLogin: (userData) => {
        console.log('its a userData:::', userData)
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.Email })
                console.log('Found user:', user);
                if (user) {
                    bcrypt.compare(userData.Password, user.password).then((status) => {
                        console.log('password match:', status);
                        if (status) {
                            console.log("login is succesfull")
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("login is failed")
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log("LOGIN FAILED")
                    resolve({ status: false })
                }
            } catch (error) {
                console.error(error)
                reject(error)
            }
        });
    },

    addToCart: (proId, userId) => {
        prodObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            if (userCart) {
                let prodExist = userCart.product.findIndex(productIndx => productIndx.item == proId)  //"findIndex": oru element aa arrayil ndo enn check cheyyan vendittan, ennitt athinte index value therum
                console.log(prodExist)                                                                //aa prodouct already undakil, aa product nte index number kanikkum, illankil -1 enn kanikkum
                //console.log(userCart.product[prodExist])                                                //eth product an enn ariyan vendi
                if (prodExist != -1) {                                                                 // aa product undakil, aa product nte quantity update (increment) cheyyanam
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: new objectId(userId), "product.item": new objectId(proId) },              // Updatil cart enn collectionle "product.item" ayitt puthiyathayitt verunna "proId" match cheyyannam ,  ithinte koode eth user inte cart aan ennath updateil kodkkanam, athkondan "user:ObjectId(userId)" kodthath
                            {
                                $inc: { "product.$.quantity": 1 }                                               //array le value increment cheyyunna timel, position operator ($) use cheyyum.  normal case anakil use cheyyanda
                            }).then(() => {                                                                                                                                          //update cheydh kayinal resolve cheyyanam
                                resolve();
                            })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: new objectId(userId) },
                            {

                                $push: { product: prodObj }

                            }).then((response) => {
                                resolve()
                            })
                }




            } else {
                let cartObj = {
                    user: new objectId(userId),
                    product: [prodObj]
                    // product:[objectId(proId)]     ith nammal product mathram add cheydha case
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        item: "$product.item",
                        quantity: "$product.quantity"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "productsss"
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ["$productsss", 0] }   //cart enna collectionile doucmentile "productsss" ullile array edukkan, ithinte koode "item" and "quantity" edukkum athinan item and quantity 1 akkiyath. 
                        //  ini display cheydha avide, athayath userle "cart.hbs"le array oyuvakkam athayth, {{each this.productsss}} oyuvakkam 
                    }
                }
                // {
                // $lookup:{
                //     from:collection.PRODUCT_COLLECTION,
                //     let:{prodList:"$product"},
                //     pipeline:[
                //         {
                //             $match:{
                //                 $expr:{
                //                     $in:["$_id","$$prodList"]
                //                 }
                //             }
                //         }
                //     ],
                //     as:"cartItemss"
                // }
                // }

            ]).toArray()
            //console.log(cartItems[0].productsss);
            //console.log(cartItems)
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartCount = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            if (cart) {
                cartCount = cart.product.length
            }
            resolve(cartCount)
        })
    },

    changeProductQuantity: (details) => {
        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        console.log(details)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new objectId(details.cart) },
                        {
                            $pull: { product: { item: new objectId(details.product) } }  //ivide oru error ullath pole....
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })


            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new objectId(details.cart), 'product.item': new objectId(details.product) },
                        {
                            $inc: { "product.$.quantity": details.count }   // "details.count" le ee count ennath string ann, string increment cheyyan kayyula, athkond ithine integer lek mattanam 
                        }).then((response) => {
                            //console.log(response)
                            resolve({ status: true })
                        })
            }

        })
    },
    cartRemoveProduct: (cartId, proId) => {
        console.log(cartId)
        console.log(proId)

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new objectId(cartId) },
                {
                    $pull: { product: { item: new objectId(proId) } }
                }).then((response) => {
                    //console.log(response)
                    resolve()
                })

        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }   
                    
                },
                {
                    $unwind: "$product"               
                },
                {
                    $project: {                                                                                   
                        item: "$product.item",
                        quantity: "$product.quantity"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,                                     
                        localField: "item",
                        foreignField: "_id",
                        as: "producttts"
                    }
                },
                {
                    $project: { item: 1, quantity: 1, producttts: { $arrayElemAt: ["$producttts", 0] } }             
                },
                {
                    $group: {
                        _id: null,
                        totalSum: { $sum: { $multiply: ["$quantity", { $toDouble: "$producttts.Price" }] } }        
                    }
                }
            ]).toArray();
            console.log("suuuuuui",total);
            console.log(total[0].totalSum)   
            resolve(total[0].totalSum)                                                            

        })
    },

    getProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            console.log("++++++++++++++++++",cart.product);
            resolve( cart.product)
        })
    },
    placeOrder: (order, product, total) => {
        return new Promise((resolve, reject) => {
            console.log("enthan mone ")
            console.log(order, product, total)
            let status = order["payment-method"] === "COD" ? "placed" : "pending"
            let orderObj = {
                deliveryDetails: {
                    mobile: order.Mobile,
                    address: order.Address,
                    pincode: order.Pincode
                },
                userId: objectId(order.userId),
                product: product,
                paymentMethod: order["payment-method"],
                totalAmount: total,
                status: status,
                date: new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new objectId(order.userId) })
                //console.log(response)
                resolve({ orderId: response.insertedId }) // Return the inserted order ID in the response object
            })
        })
    },

    getUserOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION)
                .find({ userId: new objectId(userId) }).toArray()
            //console.log(order)
            resolve(order)
        })
    },

    getOrderProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        item: "$product.item",
                        quantity: "$product.quantity"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $project: {
                        quantity: 1,
                        product: { $arrayElemAt: ["$product", 0] }
                    }
                }


            ]).toArray()
            console.log(orderItems);
            // resolve(JSON.stringify(orderItems))
            resolve(orderItems)
        })
    },
    // generateRazorpay:(orderId) => {
    //     return new Promise((resolve,reject) => {
    //         instance.orders.create({
    //             amount: 50000,
    //             currency: "INR",
    //             receipt: "order"+orderId
    //         }).then((response) => {
    //             console.log("Receiptttttttttttt:", response);
    //             resolve(response);
    //         }).catch((error) => {
    //             reject(error);
    //         });
    //     });
    // }

    generateRazorpay: (orderId, total) => {
        console.log(orderId)
        return new Promise((resolve, reject) => {
            var options = {
                amount: total,
                currency: "INR",
                receipt: orderId.orderId.toString()   //  { orderId: new ObjectId("64154feb6699340cbb08fe9e") }   orederId ingane ayirunnu ullath 
            };
            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("New Order :", order);
                    resolve(order)
                }
            })
        })
    },
    // order["payment-method"]
    verifyPayment: (details) => {
        let secret = 'ACJS21d25dd0cAdJ3rSNpTYi';
        return new Promise((resolve, reject) => {
            console.log('verifyPyment function details::', details)
            let hmac = crypto.createHmac('sha256', secret);
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            let hash = hmac.digest('hex');

            if (hash === details['payment[razorpay_signature]']) {
                console.log('payment verification successfull')
                resolve()
            } else {
                console.log('payment verification failed')
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: new objectId(orderId) },
                    { $set: { status: 'Placed' } }
                )
                .then((result) => {
                    console.log('Order status changed successfully');
                    resolve();
                })
                .catch((error) => {
                    console.error('Error changing order status:', error.message);
                    reject();
                });
        });
    },


    // sortProducts: (sortBy) => {
    //     console.log('HO HOH HO:::',sortBy)
    //     return new Promise((resolve, reject) => {
    //         //sort the products by name or price
    //         if (sortBy === 'name') {
    //             product.sort(function (a, b) {
    //                 return a.Name.localeCompare(b.Name);
    //             })
    //         } else if (sortBy === 'price') {
    //             product.sort(function (a, b) {
    //                 return a.Price - b.Price
    //             })
    //         }

    //         // Generate the HTML for the sorted products
    //         var html = '';
    //         for (var i = 0; i < product.length; i++) {
    //             html += '<div class="col-md-3 p-4 isotope-item">';
    //             html += '<div class="card" style="width: 15rem; height: 22rem;">';
    //             html += '<img class="card-img-top" src="product-images/' + products[i]._id + '.jpg" alt="Card image cap" style="height: 11rem;width: 14rem;">';
    //             html += '<div class="card-body">';
    //             html += '<h5 class="card-title" name="name">' + product[i].Name + '</h5>';
    //             html += '<p class="card-text" name="price">' + product[i].Price + '</p>';
    //             html += '<p class="card-text">' + product[i].Description + '</p>';
    //             html += '<button onclick="addToCart(\'' + product[i]._id + '\')" class="btn btn-primary">Add to Cart</button>';
    //             html += '</div></div></div>';
    //         }

    //         resolve({ html: html });
    //     })
    // }


}
