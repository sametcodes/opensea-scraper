## opensea-scraper

It is challenging to scrape data from Opensea without having restrictions to the site since the requests go through Cloudflare. But it's possible to imitiate the requests after obtaining the header of the request by intercepting the network activity. The key point of the trick is here: sending the imitated request through the browser by using the `page.evaluate` function instead of sending on the node client, otherwise, the CORS won't be fulfilled and the requests will be blocked by the Cloudflare mechanism.

### Install

```bash
npm install
```

### Usage

Define the collection name in the `.env` file and run the script. The process will be logged and the output will be dumped to `output.json` file.

```bash
npm run collect
```