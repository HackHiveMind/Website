const{Client}=require('pg')
const { host, user, port, password, database } = require('pg/lib/defaults.js')

const con=new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "soimilor9",
    database:"databases"
})   

con.connect().then(()=> console.log("connected"))


app.listen(3001, () => {
  console.log('Serverul rulează pe http://localhost:3001');
}); 