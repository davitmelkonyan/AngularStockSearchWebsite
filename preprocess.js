const https = require('https');
const fetch = require('node-fetch');
const url = require('url');
const key = 'c82pl1iad3ia12599p7g' 

module.exports.getAPI1 = get_desc;
module.exports.getAPI2 = get_history;
module.exports.getAPI3 = get_latestPrice;
module.exports.getAPI4 = get_autocomplete;
module.exports.getAPI5 = get_news;
module.exports.getAPI6 = get_recomendation;
module.exports.getAPI7 = get_sentiment;
module.exports.getAPI8 = get_peers;
module.exports.getAPI9 = get_earnings;
//&& latestPrice && news && lastDayChartDone && historyChartDone
//<div class="col-sm m-0 p-0 col-md-auto">     
//</div>

//this.get_lastDaysChart();
//this.get_historyChart();
//&& latestPrice && lastDayChartDone && historyChartDone

//onclick="router.navigateByUrl('/search/' + peer);
//onclick="location.href=this.href+peer"
async function get_desc(name){
    let url = `https://finnhub.io/api/v1/stock/profile2?symbol=${name}&token=${key}`
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'}
    let response = await fetch(url,{method:'GET', headers:headers});
    //console.log("DESC RESP",response.json());
    return response.json()
}

async function get_history(start,name) {
    //console.log("start---",start,typeof start,typeof parseInt(start.toString()));
    from = parseInt(start);
    console.log("FRM",from,typeof from)
    let url = `https://finnhub.io/api/v1/stock/candle?symbol=${name}&resolution=${1}&from=${start}&to=${Math.floor(Date.now()/1000)}&token=${key}`;
    console.log("URL",url);
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response= await fetch(url, {method: 'GET', headers: headers});
    return  response.json();
}

async function get_latestPrice(name){
    let url =  `https://finnhub.io/api/v1/quote?symbol=${name}&token=${key}`;
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response = await fetch(url, {method: 'GET', headers: headers});
    return response.json();
}

async function get_autocomplete(query) {
    let url = `https://finnhub.io/api/v1/search?q=${query}&token=${key}`;
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response = await fetch(url, {method: 'GET', headers: headers});
    return response.json();
}

async function get_news(name){
    let time = new Date();
    let year = time.getFullYear(), month = time.getMonth(),day = time.getDate();
    let from = (new Date(year , month, day-7)).toISOString().slice(0, 10);
    let url = `https://finnhub.io/api/v1/company-news?symbol=${name}&from=${from}&to=${time.toISOString().slice(0, 10)}&token=${key}`
    console.log("NEWS URL",url);
    let headers = { 'Access-Control-Allow-Origin': '*','Content-Type': 'application/jsonp'}; //'Access-Control-Allow-Origin': '*',
    let response = await fetch(url, {method: 'GET', headers: headers});
    //console.log("RESP",response.json());
    resp = await response.json();
    return resp//JSON.parseText(response.text());
}

async function get_recomendation(name){
    let url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${name}&token=${key}`;
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response = await fetch(url, {method: 'GET', headers: headers});
    return response.json();
}

async function get_sentiment(name){
    let url = `https://finnhub.io/api/v1/stock/social-sentiment?symbol=${name}&from=2022-01-01&token=${key}`;
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response = await fetch(url, {method: 'GET', headers: headers});
    return response.json();
}

async function get_peers(name){
    let url = `https://finnhub.io/api/v1/stock/peers?symbol=${name}&token=${key}`;
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response = await fetch(url, {method: 'GET', headers: headers});
    return response.json();
}

async function get_earnings(name){
    let url = `https://finnhub.io/api/v1/stock/earnings?symbol=${name}&token=${key}`;
    let headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json'};
    let response = await fetch(url, {method: 'GET', headers: headers});
    return response.json();
}


//async function fetch_response(url){
//    let headers = {'Content-Type': 'application/json'};
//    let response = await fetch(url, {method: 'GET', headers: headers});
//    return response.json();
//}



