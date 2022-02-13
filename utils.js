const catchCollectionItemsRequestHeader = (page, callback) => {
    return new Promise(resolve => {
        callback();
        page.on('request', request => {
            if (request.url().endsWith('graphql/')) {
                if(request.postData()?.includes('AssetSearchQuery')) {
                    page.off('request');
                    resolve({postData: JSON.parse(request.postData()), headers: request.headers()})
                }
            }
        });
    })
}

const sendImitiatedQuery = async (page, {headers, postData}, collection, count, offset) => {
    const cursor = Buffer.from(`arrayconnection:${offset}`).toString("base64")
    const result = await page.evaluate(([{headers, postData}, collection, count, cursor]) => {
        return fetch("https://api.opensea.io/graphql/", {
            "headers": headers,
            "body": JSON.stringify({...postData, variables: {...postData.variables, collections: [collection], collection, cursor, count }}),
            "method": "POST"
        }).then(res => res.json())
    }, [{headers, postData}, collection, count, cursor]);

    return result.data.query.search?.edges || [];
}

const setRequestInterceptionTrue = async (page) => {
    await page.setRequestInterception(true)
    page.on('request', (req) => {

        const blocked_queries = ["NavSearchAssetsQuery", "AssetSearchListPaginationQuery", "EventHistoryQuery", "PrivateListingBannerQuery", "NavbarQuery", "PriceHistoryQuery"];
        if (req.url().endsWith('graphql/')) {
            if (blocked_queries.find(bquery => req.postData()?.includes(`id":"${bquery}`))){
                return req.abort();
            }
        }

        const blocked_sources = ["rum-http-intake.logs.datadoghq.com", "platform.twitter.com", "api.amplitude.com", "cdnjs.cloudflare.com", "opensea.io/cdn-cgi/rum"]
        if(blocked_sources.find(bsource => req.url().includes(bsource))){
            return req.abort();
        }

        if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font')
            req.abort();
        else
            req.continue();
    })
}

module.exports = {
    catchCollectionItemsRequestHeader,
    sendImitiatedQuery,
    setRequestInterceptionTrue
}