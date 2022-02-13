const puppeteer = require("puppeteer");
const UserAgent = require("user-agents");
const { catchCollectionItemsRequestHeader, sendImitiatedQuery, setRequestInterceptionTrue } = require('./utils.js');

class Browser {
    constructor(config) {
        this.page;
        this.headers;
        this.config = config;
    }

    async create() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                "--proxy-server='direct://'",
                '--proxy-bypass-list=*',
                '--hide-scrollbars',
            ]
        });

        const [page] = await this.browser.pages();
        this.page = page;
        this.page.setUserAgent(new UserAgent().toString())

        setRequestInterceptionTrue(this.page)
    }

    async getRequestHeader() {
        await this.page.goto(`https://opensea.io/collection/${this.config.collectionName}`)

        this.headers = await catchCollectionItemsRequestHeader(this.page, () => {
            this.page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight) })
        });
    }

    async getItems() {
        let count = 100;
        let offset = 0;

        return new Promise(async resolve => {
            let total_items = [];
            while (true) {
                const items = await sendImitiatedQuery(this.page, this.headers, this.config.collectionName, count, offset);
                if (items.length === 0) {
                    this.page.off('response');
                    resolve(total_items);
                    break;
                } else {
                    total_items = total_items.concat(items);
                    console.log(`${total_items.length} collected so far`)
                    offset += count;
                }
            }
        })
    }
}

module.exports = Browser;