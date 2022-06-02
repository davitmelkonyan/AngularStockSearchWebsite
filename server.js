// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const cors = require('cors');
const preprocess = require('./preprocess.js');
const app = express();
app.use(cors())
app.use(express.static(process.cwd()+"/my-app/dist/my-app/"));

app.get('/', (req, res) => {
  //res.status(200).send('Hello, world!').end();
  res.sendFile(process.cwd()+"/my-app/dist/my-app/index.html")
});

app.get('/description/:tickerName', async function (req, res) {
  console.log(`Company's Description: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI1(req.params.tickerName);
  console.log(`${req.params.tickerName.toUpperCase()} Desc finished!\n`);
  return res.send(origRes);
})

app.get('/history/:tickerName/:startDate', async function (req, res) {
  console.log(`Historical data: ${req.params.tickerName.toUpperCase()}; Start Date: ${req.params.startDate}  ${typeof req.params.startDate}\n`);
  let origRes = await preprocess.getAPI2(req.params.startDate, req.params.tickerName);
  console.log('Historical result',origRes);
  if (Array.isArray(origRes.c)) {
    console.log(`${req.params.tickerName.toUpperCase()} Record length:`); // ${origRes.c.length}
  } else {
    console.log(`${req.params.tickerName.toUpperCase()} Ticker Not Found`);
  }
  console.log(`${req.params.tickerName.toUpperCase()} Historical data finished!\n`);
  return res.send(origRes);
})

app.get('/latestprice/:tickerName', async function (req, res) {
  console.log(`\nLatest Price: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI3(req.params.tickerName);
  console.log(`${req.params.tickerName.toUpperCase()} Latest Price finished! ${origRes}\n`);
  return res.send(origRes);
})

app.get('/autocomplete/:subtickerName', async function (req, res) {
  console.log(`\nAutocomplete: ${req.params.subtickerName}`);
  let origRes = await preprocess.getAPI4(req.params.subtickerName);
  console.log(`${req.params.subtickerName} Autocomplete finished! \nLength of response: ${origRes.count}`);
  return res.send(origRes.result);
})

app.get('/news/:tickerName', async function (req, res) {
  console.log(`\nNews: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI5(req.params.tickerName);
  let msg = req.params.tickerName.toUpperCase() + " News finished!";
  console.log("CIC",origRes);
  if (origRes && origRes.length) {
      msg += "Length of response: " + origRes.length + "\n";
  } else {
      msg += "Null news.\n";
  }
  console.log(msg);
  return res.send(origRes.slice(0, 10));
})

app.get('/recommendations/:tickerName', async function (req, res) {
  console.log(`\nRecommendations: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI6(req.params.tickerName);
  let msg = req.params.tickerName.toUpperCase() + " Recommendations finished!";
  if (origRes && origRes.length) {
      msg += "Length of response: " + origRes.length + "\n";
  } else {
      msg += "Null recs.\n";
  }
  console.log(msg);
  return res.send(origRes);
})

app.get('/sentiment/:tickerName', async function (req, res) {
  console.log(`\Sentiment: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI7(req.params.tickerName);
  let msg = req.params.tickerName.toUpperCase() + " Sentiment finished!";
  console.log("Sentiment: ",origRes);
  return res.send(origRes);
})

app.get('/peers/:tickerName', async function (req, res) {
  console.log(`\nPeers: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI8(req.params.tickerName);
  let msg = req.params.tickerName.toUpperCase() + " Peers finished!";
  console.log("PEERS: ",origRes);
  return res.send(origRes);
})

app.get('/earnings/:tickerName', async function (req, res) {
  console.log(`\eErnings: ${req.params.tickerName.toUpperCase()}`);
  let origRes = await preprocess.getAPI9(req.params.tickerName);
  let msg = req.params.tickerName.toUpperCase() + " Earnings finished!";
  console.log("Earnings: ",origRes);
  return res.send(origRes);
})



// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
