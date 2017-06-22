/**
 * Created by William on 6/13/2017.
 */

const WebTask = require("../webtask").WebTask;

module.exports.CoinMarketCap = class CoinMarketCap extends WebTask {

    constructor() {
        super();
        this._host = "api.coinmarketcap.com";
        this._basePath = "/v1/ticker/";
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "public" methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Fetches information about the coin
     */
    fetchCoinIndex(callback) {
        this._execute(this._onFetchCoinIndexResponse, callback);
    }

    /**
     * Finds the price of a coin based on its full name
     * @param coinName  the full coin name
     */
    lookupCoinPrice(coinName, callback) {
        this._execute(this._onCoinLookupResponse, callback, coinName + "/");
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "private" methods that should only be called internally
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Fetches the entire coin index for lookup
     * @param data                  the data associated with the http request
     * @param consumerCallback      the callback to the consumer of this method
     * @private
     */
    _onFetchCoinIndexResponse(self, data, consumerCallback) {
        let tickerLookup = new Map();
        let coinIndex = new Map();

        if (consumerCallback){
            let coinData = JSON.parse(data);

            for (let i = 0; i < coinData.length; i++){
                let id = coinData[i].id;
                coinIndex.set(id, coinData[i]);

                let symbol = coinData[i].symbol;
                tickerLookup.set(symbol, id);
            }
        }

        consumerCallback(coinIndex, tickerLookup);
    }

    /**
     * The function responsible for handling the data returned from the HTTP response
     * @param data                  the data returned from the HTTP response
     * @param consumerCallback      the callback to the consumer of this task
     * @private
     */
    _onCoinLookupResponse(self, data, consumerCallback){
        if (consumerCallback){
            let coinData = JSON.parse(data);
            if (coinData[0] !== undefined) {
                let coinPrice = coinData[0].price_usd;
                if (coinPrice) {
                    consumerCallback(coinPrice);
                    return;
                }
            }

            // fail with null return
            consumerCallback(null);
        }
    }
};