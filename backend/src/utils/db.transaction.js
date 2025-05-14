const {pool} = require('../config/env');

const databaseTransaction = async (callback, res) => {
    let sqlCon;
    try{
        sqlCon = await pool.getConnection(); // Connection from the pool
        await sqlCon.beginTransaction(); // Start transaction

        // Run any logic related with database
        const result = await callback(sqlCon); // Pass the connection to the callback function

        await sqlCon.commit(); // Commit the transaction
        return result;
    }catch(err){
        if(sqlCon) await sqlCon.rollback();
        console.log(err);
        return res.status(500).json({ message: 'Internal server error'});
    }finally{
        if(sqlCon) sqlCon.release(); // Release the connection back to the pool
    }

};

module.exports = databaseTransaction;