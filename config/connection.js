 const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}

module.exports.connect = function(doneCallback){
    const url = 'mongodb://127.0.0.1:27017'
    const dbname = 'shoppingMall'


    mongoClient.connect(url, (err,data) => {
        if(err){
            return doneCallback(err)
        } else{
            state.db = data.db(dbname)
              doneCallback()
        }
              
    
    })
}



module.exports.get = function(){
    return state.db
}