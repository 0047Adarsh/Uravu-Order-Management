import express from "express";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', 'N:/Uravu Bottling');

app.use(bodyParser.urlencoded({extended: true}));

let all_customers = ["BHUMIPUTRA PROJECTS", "PAUL RESORTS AND HOTELS PRIVATE LIMITED", "SANTHOSH SRIRAM RAGHAVENDRA RENUKA - R R HOSPITALITY - IBH", "SANTHOSH SRIRAM RAGHAVENDRA RENUKA - BRAHMA BREW WORKS", "Thunder Hospitality Private Limited - TOF", "ALPHA FNB LLP - UTK - Whitefield", "SRT HOSPITALITY VENTURES LLP - BOMBAY BRASSERIE", "Byg Ventures LLP - Yeshwanthpur", "Brewsky hospitality pvt Ltd - Sarjapur", "BREWSKY HENNUR BREWERY PVT LTD", "Byg Ventures LLP- Bobs Bar Kammanahalli", "Byg Ventures LLP - Bobs Bar Jp Nagar", "Byg Ventures LLP - Bobs Bar Koramangala", "Byg Ventures LLP - Bobs Bar Indiranagar", "AVERINA INTERNATIONAL RESORTS PRIVATE LIMITED - THE FISHERMANS WHARF (Jakkur)", "46 Ounces-A Division of Velankani Information Systems Ltd", "Metworld Solutions LLP - WHITE GARDEN", "FOENBEV Hospitality LLP - SUAY", "ARA HOSPITALITY SERVICES PRIVATE LIMITED - JAMMING GOAT", "Insane Hospitality Pvt Ltd - Candles Brewhouse", "Mysore Intercontinental Hotels Pvt. Ltd. - Fortune Select JP Cosmos", "CSK Ventures - Sally by 1522", "GVO Food LLP - Jugni", "GXI", "NYKOS HOSPITALITY PRIVATE LIMITED - Inanna Taproom", "ALPHA TOIT LLP - UTK", "AVERINA INTERNATIONAL RESORTS PRIVATE LIMITED - THE FISHERMANS WHARF", "Maruti Comforts & INN Private Limited", "MRS Hospitality LLP - Travellers Bungalow", "URAVU HOME", "Etenia Hospitality LLP - URU Brewpack", "Frothy Tales Hospitality Pvt Ltd - The Bier Library Brewery & Kitchen", "Boxtopia Hospitality LLP - Acre bengaluru", "Hivemind cafe and studios LLP - 154 BC - Koramangala", "Sargod Hospitality - 154 BC - JP Nagar", "KITCHEN OF THE LURU - YUCCA", "IHHR Hospitality Pvt Ltd - Hyatt Bangalore", "RGV Brewing LLP - Long Boat Brewing Co", "Insane Hospitality Pvt Ltd - TUDUM", "KAMPOT", "Royal Orchid hotels", "Target Associates Pvt Ltd - Evoma Hotel", "Aswati INNS Pvt Ltd -The 13th floor", "Nikan Hospitality LLP - GCBC", "Hand Crafted Restaurants Pvt Ltd - Roxie", "Bharthiya Urban Pvt Ltd - Leela"];
let orders = [];
let volume = 0;

app.post('/volume', (req,res)=>{
    let vdata = req.body.volume;
    volume += parseInt(vdata)   ;
    res.redirect('/');
});

app.post('/order', (req,res)=>{
    let data = req.body;
    orders.push(data);
    res.redirect('/');
});

app.get('/', (req,res)=>{
    res.render('index.ejs', {all_orders: orders, f_volume: volume});
});

app.post('/update_order', (req, res) => {
    let data = req.body;
    const index = parseInt(data.uSlno) - 1;
    let Slno = data.uSlno;
    let name= data.uname;
    let svolume = parseInt(data.usvolume);
    let quantity = parseInt(data.uquantity);

    if (index >= 0 && index < orders.length) {
        orders[index] = {Slno, name, svolume, quantity};
        res.redirect("/");
    } else {
        res.status(404).send('Order not found');
    }
});

app.listen(`${port}`, ()=>{
    console.log(`The website is hosted on port ${port}`);
});