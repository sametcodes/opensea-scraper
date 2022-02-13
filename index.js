require('dotenv').config()

const Opensea = require('./opensea')
const fs = require('fs');

(async () => {
    const opensea = new Opensea({
        collectionName: process.env.COLLECTION_NAME
    });

    await opensea.create();
    await opensea.getRequestHeader();
    const items = await opensea.getItems()

    fs.writeFileSync("./output.json", JSON.stringify(items), "utf8");

    await opensea.browser.close();
})();