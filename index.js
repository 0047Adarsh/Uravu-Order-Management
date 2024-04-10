import express from "express";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// const db = new pg.Client({
//     user: "postgres",
//     password: "Dominoz@data123",
//     database: "postgres",
//     host: "127.0.0.1",
//     port:  5432,
// }); 
// db.connect();

app.use(bodyParser.urlencoded({extended: true}));

let orders = [];
let volume = [];

app.post('/volume', (req,res)=>{
    volume.push((req.body));
    res.redirect('/');
});

app.post('/order', async(req,res)=>{
    let data = req.body;
    orders.push(data);
    let total_quantity = data.svolume * data.quantity;
    //db.query("INSERT INTO order_management (sl, customer_name, volume, quantity, total_quantity, delivery_date) VALUES ($1, $2, $3, $4, $5, $6)", [data.Slno, data.name, data.svolume, data.quantity, total_quantity, data.deliverydate]);
    res.redirect('/');
});

app.get('/', async(req,res)=>{
    const all_orders = await db.query("SELECT * FROM order_management");
    console.log(all_orders.rows)
    res.render('index.ejs', {all_orders: orders, f_volume: volume});
});

app.post('/update_order', (req, res) => {
    let data = req.body;
    let index = parseInt(data.uSerial) - 1;
    let Serial = parseInt(data.uSerial);
    let Slno = data.uSlno;
    let name= data.uname;
    let svolume = parseFloat(data.usvolume);
    let quantity = parseFloat(data.uquantity);
    let deliverydate = data.udeliverydate;

    if (index >= 0 && index < orders.length) {
        orders[index] = {Serial,Slno, name, svolume, quantity,deliverydate};
        res.redirect("/");
    } else {
        res.status(404).send('Order not found');
    }
});

app.post('/split_order', (req, res) => {
    let sdata = req.body;
    const index = parseInt(sdata.sSerial) - 1;
    let Serial = parseInt(sdata.sSerial);
    let Slno = sdata.sSlno;
    let name= sdata.sname;
    let svolume = parseFloat(sdata.ssvolume);
    let quantity = parseFloat(sdata.squantity);
    let deliverydate = sdata.sdeliverydate;

    let serial = parseInt(sdata.ssSerial);
    let slno = sdata.ssSlno;
    let Name= sdata.sname;
    let Svolume = parseFloat(sdata.ssvolume);
    let Quantity = parseFloat(sdata.ssquantity);
    let Deliverydate = sdata.ssdeliverydate;

    if (index >= 0 && index < orders.length) {
        orders[index] = {Serial, Slno, name, svolume, quantity,deliverydate};
        res.redirect("/");
    } else {
        res.status(404).send('Order not found');    
    }
    orders.push({"Serial":parseInt(serial),"Slno":parseInt(slno), "name":Name,"svolume":Svolume,"quantity":Quantity,"deliverydate":Deliverydate});
});

app.listen(`${port}`, ()=>{
    console.log(`The website is hosted on port ${port}`);
});
