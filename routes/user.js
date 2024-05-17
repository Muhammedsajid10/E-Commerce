var express = require('express');
var router = express.Router();
// const productHelpers = require('../.dist/helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
// var userHelpers = require('../.dist/helpers/user.helpers'); 
var userHelpers = require('../helpers/user-helpers'); 


const verifyLogin = (req, res, next) => {  //It's a middleware, to check, the user is logged or not
  if (req.session.userLoggedIn) {    // ith vere nammal "req.session.loggedIn" mathram ayirunnu kodthath, ini "req.sesion.user.loggedIn" enn kodkkum 
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)  //Cartinte count veran vendi
  }
  productHelpers.getAllProducts().then((product) => {
    //console.log(product)
    res.render("user/view-product", { product, user, cartCount })             // ithil render chaydha "user"  session inte memory il an store cheydhadh, athkond avide venamengilum ee "user" access chayyam
  })
  //res.render('index', { product,admin:true  });  
});

router.get('/login', (req, res) => {
  //if(req.session.user.loggedIn)
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { loggErr: req.session.userLoggErr, hideFooter: true  })
    req.session.userLoggErr = false
  }

})

// router.get('/signup', (req, res) => {
//   res.render('user/signup')
// })

// router.post('/signup', (req, res) => {
//   const {name,email,password,mobile} = req.body
//   console.log('foooooo::',req.body)
//   let doSignUpUser = userHelpers.doSignUp(name,email,password,mobile)

//   // Creating session
//   req.session.userLoggedIn = true;
//   req.session.user = doSignUpUser;
  
//   // Generate Otp and send to user
//   const otp = userHelpers.generateOTP();
//   userHelpers.sendOTP(mobile, otp).then(() => {
        
        
//     res.render('user/otp', { doSignUpUser,otp });
// })

//     res.redirect('/')
  
// })


//////////////////////////////////////////////////////////////////

router.get('/signup', (req, res) => {
  res.render('user/signup', { hideFooter: true })
})

router.post('/signup', async (req, res) => {
  const { name, email, password, mobile } = req.body;
  let doSignUpUser = await userHelpers.doSignUp(name, email, password, mobile )
  console.log('the paaaaaaaaaasssss::',doSignUpUser)

  // creating session
  req.session.user = doSignUpUser;
  req.session.userLoggedIN = true;

  // Generate OTP and send it user
  const otp = userHelpers.generateOTP();
  userHelpers.sendOTP(mobile, otp).then(() => {
      
      
      res.render('user/otp', { doSignUpUser,otp });
  })
})

router.get('/verify-otp', (req,res) => {
  res.render('user/otp')
})



router.post('/verify-otp', async (req, res, next) => {
  const { mobile, otp } = req.body;
  const userEnterOTP = req.body.otp_code;
  //console.log('Ithan mone user enterotpppp:::::',userEnterOTP, 'Andddddddd', otp, 'andalsooo' ,  mobile)
  const isOTPVerified = await userHelpers.verifyOTP(otp, userEnterOTP)
  try {
      if (isOTPVerified) {

          // const { name, email, password, mobile } = req.body;
          const user = {
              name: req.body.name,
              email: req.body.email,
              password: req.body.password,
              mobile: req.body.mobile
          };
          console.log('HA HA KILIPOYI::',req.body.name, req.body.email, req.body.password) 
          const userId = await userHelpers.createUser(user).then((response) => {
              const userId = response.insertedId;
              const newUser = response.user;
              console.log('yesssssssssss:::::',response.user.mobile)
              res.render('user/otp-success');
          })

      } else {
          
          // res.render('user/otp', {error: 'invalid OTP' })
          res.render('user/otp', { error: 'invalid OTP', message: 'Try agin, it is a wrong OTP.' });

         
      } 
  } catch (error) {
      console.error('Error during OTP verification:', error);
      
  }

})


/////////////////////////////////////////////////////////////////

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.userLoggErr = "invalid username or password"     // ivide an login error set cheyyunath
      res.redirect('/login')
    }
  })

})

router.get('/logout', (req, res) => {
  //req.session.destroy()         user logout cheyyumbol session destroy cheyyanda, ath null ayi set cheyyam
  req.session.user = null
  req.session.userLoggedIn = null
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let product = await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = 0
  if (product.length > 0) {                                                         //atayath, ivide product unakil mathram total eduthal mathi
    totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  }
  console.log(product)

  res.render('user/cart', { product, user: req.session.user, totalValue })
})

router.get('/add-to-cart/:id', (req, res) => {
  console.log("call api")
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    //res.redirect("/")
    res.json({ status: true })

  })
})

router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)         //ivide nammak session(userId) undavula because "/change-product-quantity" enna root ajax vayi an vilikkunath, ajax call cheythrikkuanth cartId vechan, appo ivide session undavula,  appo ivide userId pass cheyyunnathin (((router.post("/change-product-quantity:/id",)))  pakaram, ajax il "changeQuantity" enna function vilikkunbol {{user._id}} vilichal mathi, already nammal avide cartId===>{{this._id}} and prodId===>{product._id}} pass cheythttundayirunnu,  ajaxil change veruthiyathin shesham ivide "getTotalAmount(req.body.user)" koduthal mathi because, req.body ullil ajaxil call cheytha userId und
    //console.log(response.total)
    res.json(response)                                                        //json use cheythath ajax ayath kondan, athayath nammal ivide object mathram aan pass cheyyunath. complete html page okke pass cheyyanmekil "res.render" an use cheyyal. but ivide complete html page onnum passa cheyyunilla, karanam ivide nammal "ajax" an use cheyyunath. athkond  html page il ninn cheriya cheriya operations an use cheyyunath. aa operations ne objectlek "json" use cheythan akkiyath
  })                                                                           //json le response, ajax le  success state lekan povuka
})


router.get("/cart-remove-product/:cartId/:id", (req, res) => {
  userHelpers.
    cartRemoveProduct(req.params.cartId, req.params.id).then((response) => {
      //console.log(response)
      res.redirect("/cart")
    })
})

router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })             //"user:req.session.user"  ee user an place-order.hbs il pass cheyyunna {{../user_id}}
})

router.post("/place-order", async (req, res) => {
  let product = await userHelpers.getProductList(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  console.log(product)
  console.log(total)
  userHelpers.placeOrder(req.body, product, total).then((orderId) => {      //order place cheyyanmenkil product and total venam , athin eee line inte above il product and total edukkan ulla function eyuthanam,  nammuk ivide product list full venda, cart collectionil engane ano ullath ath mathi , athayath cart collectionil inganan ullath   { item: ObjectId("63ea0e5986e7b56404029165"), quantity: 1 },   ini vendath total an, total get cheyyanulla functiion nammal already define cheyth vechtan "getTotalAmount"
    console.log("reqqqqq::",req.body);
    console.log('the orederId isss:::', orderId)
    if (req.body['payment-method'] === 'COD') {
      res.json({ codStatus: true })                                                // true kodthath place ayi ennan
    } else {
      userHelpers.generateRazorpay(orderId, total).then((response) => {
        res.json(response)
      })
    }


    //console.log(req.body)
  })
  //console.log(req.body)
})


router.get("/place-order-success", (req, res) => {          
  //let total = userHelpers.getTotalAmount(req.session.user._id)
  res.render("user/place-order-success", { user: req.session.user })
})


router.get("/place-order-list", async (req, res) => {
  let order = await userHelpers.getUserOrder(req.session.user._id)
  // console.log(order)
  res.render("user/place-order-list", { user: req.session.user, order })
})

router.get("/view-order-products/:id", async (req, res) => {
  let productss = await userHelpers.getOrderProduct(req.params.id)
  //console.log(req.params.id)
  console.log(productss)
  res.render("user/view-order-products", { user: req.session.user, productss })
})

router.post('/verify-payment', (req, res) => {
  console.log("its a verify payment:::", req.body)
  userHelpers.verifyPayment(req.body).then((response) => {
    console.log('its a verify respo:::', response)
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch(() => {
    res.json({ status: false })
  })
})

// router.post("/sort-products", (req, res) => {
//   console.log('req.body.sortBy::',req.body.sortBy)
//   userHelpers.sortProducts(req.body.sortBy).then(result => {
//     res.json(result);
//   })
//     .catch(err => {
//       console.log('The error is::',err);
//       res.status(500).send("Error sorting products");
//     });
// });

module.exports = router;

