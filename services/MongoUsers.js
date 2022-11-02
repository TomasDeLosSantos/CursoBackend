const mongoose = require('mongoose');
const UserModel = {
    username: {type: String},
    password: {type: String}
}


class MongoProduct {
    constructor(){
        this.model = new mongoose.Schema(UserModel);
        this.product = mongoose.model('users', this.model);
    }


    async save(obj){
        try {
            const data = await this.product.find({});
            // obj.id = data.length + 1;
            await this.product.create(obj);
            return obj.username;
        } catch (error) {
            console.log(error);
        }
    }

    async getById(id){
        try {
            return await this.product.find({_id: id});
        } catch (error) {
            console.log(error);
        }
    }

    async getByUsername(username){
        try {
            return await this.product.find({username: username});
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