var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')

module.exports={

    

    addProduct:(product,callback) => {
        //console.log(product);

        db.get().collection('product').insertOne(product).then((data) => {
            //console.log(data)
            callback(data.insertedId)
        })
    },

    getAllProducts:() => {
        return new Promise(async(resolve,reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct:(proId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectId(proId)}).then((response) => {
                //console.log(response)
                resolve(response)
            })
        })
    },

    getProductDetails:(proId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new objectId(proId)}).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails) => {
        console.log(proDetails)
        console.log(proId)
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:new objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Category:proDetails.Category,
                    Discription:proDetails.Discription,
                    Price:proDetails.Price
                }
            }).then((response) =>{
                resolve()
            })
        })
    },
    doRegister:(adminData) => {
        return new Promise(async(resolve,reject) => {
            adminData.password = await bcrypt.hash(adminData.password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                //console.log(data.insertedId);
                resolve(data.insertedId);

            })
        })
    },
    
    doLogin:(adminData) => {
        //console.log(adminData)
        return new Promise(async(resolve,reject) => {
            let loginStatus = false
            let response = {}
            
            let user =await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.Email})
            //console.log('Found user:', user);
            if(user){
                bcrypt.compare(adminData.Password,user.password).then((status) => {                                                                                     // "adminId.Password"====> login cheythappol ulla password  and  "user.password"====> sighup cheythappol ulla password ,   aa 2 passwords compare cheythu,   
                    if(status){                                                                                                                                         //if status true anakil, atahyath above il compare cheytha passwords match anakil...
                        console.log("admin login successfully")
                        response.user = user
                        response.status = true
                        resolve(response)                                                                                                                                // ee response il ippo user and status und , athayath "response" ennath nammal mukalil declare cheytha object an, athilek an "response.user = user"  and  "response.status = true"
                    }else{
                        console.log("admin login failed............")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("not user here")
                resolve({status:false})
            }
        })
    }


}