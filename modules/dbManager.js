class DB{
    constructor(options, table){
        this.knex = require('knex')(options);
        this.table = table;
    }

    async save(obj){
        try {
            await this.knex.from(this.table).insert(obj);
            console.log("Item Created Successfully");
        } catch (error) {
            console.error(error);
        }
    }

    async getById(id){
        try {
            return await this.knex(this.table).select().where('id', id);
        } catch (error) {
            console.error(error);
        }
    }

    async getAll(){
        try {
            return await this.knex(this.table).select('*');
        } catch (error) {
            console.error(error);
        }
    }

    async delete(field, value){
        try {
            await this.knex(this.table).where(field, value).del();
            console.log("Item Deleted Successfully");
        } catch (error) {
            console.error(error);
        }
    }

    async deleteAll(){
        try {
            await this.knex(this.table).select('*').del();
            console.log('All Items Deleted');
        } catch (error) {
            console.error(error);
        }
    }

    async update(id, obj){
        try {
            await this.knex(this.table)
                .where('id', id)
                .update(obj)
            return await this.knex(this.table).select().where('id', id);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = DB;