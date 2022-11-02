const mongoose = require('mongoose');
const MessageModel = {
    entities: {type: Object},
    result: {type: Number}
}


class MongoProduct {
    constructor(){
        this.connection = mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        this.model = new mongoose.Schema(MessageModel);
        this.product = mongoose.model('messages', this.model);
    }


    async save(obj){
        try {
            const data = await this.product.find({});
            obj.id = data.length + 1;
            await this.product.create(obj);
            return obj.id;
        } catch (error) {
            console.log(error);
        }
    }

    async getById(id){
        try {
            return await this.product.find({id: id});
        } catch (error) {
            console.log(error);
        }
    }

    async getAll(){
        try {
            return await this.product.find({result: 0});
        } catch (error) {
            console.log(error);
        }
    }

    async deleteById(id){
        try {
            return await this.product.deleteOne({id: id});
        } catch (error) {
            console.log(error);
        }
    }

    
    async deleteAll(){
        try {
            return await this.product.collection.drop();
        } catch (error) {
            console.log(error);
        }
    }

    async update(id, obj){
        try {
            let prod = await this.getAll();
            if(prod[0].result == 0){
                return await this.product.updateOne({result: id}, {$set: {entities: obj.entities}});
            } else {
                obj.id = id;
                await this.product.create(obj);
                return obj.id;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = MongoProduct;