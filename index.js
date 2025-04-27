require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { url } = require('inspector');

// Basic Configuration
const port = process.env.PORT || 3000;

const urlList = [];

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req, res) {
  const url = req.body.url;
  if (!url) {
    return res.json({ error: 'invalid url' });
  }

  let hostname;
  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = Math.floor(Math.random() * 1000000);
      const newUrlRes = {
        original_url: url,
        short_url: shortUrl
      };

      urlList.push(newUrlRes);
      console.log(urlList)
      res.json(newUrlRes);
    }
  });
});

app.get("/api/shorturl/:short_url", function(req, res) {
  const shortUrl = req.params.short_url;
  
  const urlFound = urlList.find(url => url.short_url === parseInt(shortUrl));
  if (urlFound?.original_url) {
    return res.redirect(urlFound.original_url);
  }

  res.json({ error: 'No short URL found for given input' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
