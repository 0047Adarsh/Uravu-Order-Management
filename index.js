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
app.use(express.static(join(__dirname, 'public')));

var conString = "postgres://xnqqtxls:AyyL6iD3RUYkb53cYXVaMwMKDiR60uVf@floppy.db.elephantsql.com/xnqqtxls"
var client = new pg.Client(conString);
client.connect()

app.use(bodyParser.urlencoded({extended: true}));

app.post('/volume', (req,res)=>{
    let data = req.body;
    try {
        client.query('INSERT INTO volume (volume, production_date) VALUES ($1, $2)', [data.volume, data.productiondate]);
    } catch (err) {
        console.log(err);
    }
    res.redirect('/');
});

app.post('/order', async(req,res)=>{
    let data = req.body;
    let total_quantity = data.svolume * data.quantity;
    try {
        client.query('INSERT INTO orders (slno, customer_name, volume, quantity, total_quantity, delivery_date) VALUES ($1, $2, $3, $4, $5, $6)', [data.Slno, data.name, data.svolume, data.quantity, total_quantity, data.deliverydate]);
    } catch (err) {
        console.log(err);
    }
    res.redirect('/');
});


app.get('/', async(req,res)=>{
    try {
        const results = await client.query('SELECT *, delivery_date FROM orders');
        const vol_results = await client.query('SELECT * FROM volume');
        res.render('index.ejs', {all_orders: results.rows, f_volume: vol_results.rows});
    } catch (err) {
        console.log(err);
    }
});

app.get('/dashboard', async(req,res)=>{
    try {
        const results = await client.query('SELECT *, delivery_date FROM orders');
        const vol_results = await client.query('SELECT * FROM volume');
        res.render('dashboard.ejs', {all_orders: results.rows, f_volume: vol_results.rows});
    } catch (err) {
        console.log(err);
    }
});


app.post('/update_order', (req, res) => {
    let data = req.body;
    let total_quantity = data.usvolume * data.uquantity;
    client.query('UPDATE orders SET slno = $1, customer_name = $2, volume = $3, quantity = $4, total_quantity = $5, delivery_date = $6 WHERE sequence = $7',[data.uSlno,data.uname,parseFloat(data.usvolume),parseFloat(data.uquantity),total_quantity,data.udeliverydate,data.uSerial]);
    res.redirect("/");
});

app.post('/split_order', (req, res) => {
    let sdata = req.body;
    let total_quantity = parseFloat(sdata.ssvolume) * parseFloat(sdata.squantity);
    client.query('UPDATE orders SET slno = $1, customer_name = $2, volume = $3, quantity = $4, total_quantity = $5, delivery_date = $6 WHERE sequence = $7',[sdata.sSlno,sdata.sname,parseFloat(sdata.ssvolume),parseFloat(sdata.squantity),total_quantity,sdata.sdeliverydate,sdata.sSerial]);
    let stotal_quantity = parseFloat(sdata.ssvolume) * parseFloat(sdata.ssquantity);
    client.query('INSERT INTO orders (slno, customer_name, volume, quantity, total_quantity, delivery_date) VALUES ($1, $2, $3, $4, $5, $6)', [sdata.ssSlno, sdata.sname,parseFloat(sdata.ssvolume),parseFloat(sdata.ssquantity), stotal_quantity, sdata.ssdeliverydate]);
    res.redirect('/');
});

app.post('/update_volume', (req,res)=>{
    let udata = req.body;
    client.query('UPDATE volume SET volume = $1, production_date = $2 WHERE slno = $3',[udata.uvvolume,udata.uvproductiondate,udata.uvSl]);
    res.redirect("/");
});

app.listen(`${port}`, ()=>{
    console.log(`The website is hosted on port ${port}`);
});
