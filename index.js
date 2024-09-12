import express from "express";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ejs, { render } from "ejs";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config()
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));


const conString = process.env.DATABASE;
var client = new pg.Client(conString);
client.connect()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/volume', (req,res)=>{
    let data = req.body;
    try {
        client.query('INSERT INTO volume (volume, production_date, wastage_volume) VALUES ($1, $2, $3)', [data.volume, data.productiondate, 0.0]);
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

app.post('/addcustomer', async(req,res)=>{
    let data = req.body;
    try {
        client.query('INSERT INTO customers (customer_name) VALUES ($1)', [data.customer]);
    } catch (err) {
        console.log(err);
    }
    res.redirect('/');
});

app.get('/', async (req, res) => {
    try {
        const names = await client.query("SELECT customer_name FROM customers");
        const orders = await client.query('SELECT * FROM orders ORDER BY delivery_date ASC');
        const volumeResults = await client.query('SELECT * FROM volume ORDER BY production_date ASC');
        
        for (const volume of volumeResults.rows) {
            let ord_vol = 0;
            let remaining = 0;
            let wastage = 0;
            const fullDate = new Date(volume.production_date);
            const year = fullDate.getFullYear();
            const month = (fullDate.getMonth() + 1).toString().padStart(2, '0');
            const day = fullDate.getDate().toString().padStart(2, '0');
            const previous_day = (day - 1).toString().padStart(2, '0');
            const prod_date = `${year}-${month}-${day}`;
            const pprod_date = `${year}-${month}-${previous_day}`;
            let produced_vol = volume.volume;
        
            for (const order of orders.rows) {
                const orderDate = new Date(order.delivery_date);
                const orderYear = orderDate.getFullYear();
                const orderMonth = (orderDate.getMonth() + 1).toString().padStart(2, '0');
                const orderDay = orderDate.getDate().toString().padStart(2, '0');
                const ord_date = `${orderYear}-${orderMonth}-${orderDay}`;
                if (ord_date === prod_date) {
                    ord_vol += parseFloat(order.volume) * parseFloat(order.quantity);
                }
            }
            for (const vol of volumeResults.rows) {
                const volDate = new Date(vol.production_date);
                const volYear = volDate.getFullYear();
                const volMonth = (volDate.getMonth() + 1).toString().padStart(2, '0');
                const volDay = volDate.getDate().toString().padStart(2, '0');
                const nprod_date = `${volYear}-${volMonth}-${volDay}`;
                if (nprod_date === pprod_date) {
                    remaining += parseFloat(vol.remaining_volume);
                    wastage = parseFloat(vol.wastage_volume);
                }
            }
            let total_vol = parseFloat(produced_vol) + parseFloat(remaining) - parseFloat(wastage);
            let p_remaining = parseFloat(total_vol) - parseFloat(ord_vol);
            
            await client.query('UPDATE volume SET order_volume = $1, total_volume = $2, remaining_volume = $3 WHERE production_date = $4', [ord_vol, total_vol, p_remaining, prod_date]);
        }
        
        const ord_data = await client.query('SELECT * FROM orders');
        const vol_data = await client.query('SELECT * FROM volume ORDER BY production_date DESC');
        
        res.render('index.ejs', { all_orders: ord_data.rows, f_volume: vol_data.rows, customer_names: names.rows });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/dashboard', async(req,res)=>{
    const date = new Date();
    try {
        const results = await client.query('SELECT * FROM orders WHERE delivery_date = $1',[date]);
        res.render('dashboard.ejs', {all_orders: results.rows});
    } catch (err) {
        console.log(err);
    }
});

app.post('/filtered', async (req, res) => {
    const selectedDate = req.body.selected_date;
    try {
        const results = await client.query('SELECT * FROM orders WHERE delivery_date = $1',[selectedDate]);
        res.json(results.rows);
    } catch (error) {
        console.error('Error fetching filtered orders:', error);
        res.status(500).json({ error: 'Error fetching filtered orders' });
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

app.post('/update_wastage', (req,res)=>{
    let data = req.body;
    client.query('UPDATE volume SET wastage_volume = $1 WHERE slno = $2',[data.wastage,data.slno]);
    res.redirect("/");
});

app.post('/update_order_status', async(req,res)=>{
    const { orderId, type } = req.body;
    client.query('UPDATE orders SET order_status=$1 WHERE sequence=$2',[type, orderId])
    res.redirect('/dashboard');
});

app.listen(`${port}`, ()=>{
    console.log(`The website is hosted on port ${port}`);
});
