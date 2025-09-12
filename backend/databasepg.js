const{Client}=require('pg')
const { host, user, port, password, database } = require('pg/lib/defaults.js')

const con=new Client({
    host: "localhost",
    user: "supabase",
    port: 5432,
    password: "soimilor9",
    database:"databases"
})   

con.connect().then(()=> console.log("connected"))

module.exports = con; 