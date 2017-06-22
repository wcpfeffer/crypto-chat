/**
 * Created by William on 6/13/2017.
 */

const SiteAPI = require("./site_api").SiteAPI;

module.exports.CoinMarketCap = class CoinMarketCap extends SiteAPI {
    /**
     * Fetches information about the coin
     */
    static fetchCoinIndex(callback) {
        this.execute(CoinMarketCap._getCoinHost(), CoinMarketCap._getCoinHostPath(), CoinMarketCap._onFetchCoinIndexResponse, callback);
    }

    /**
     * Fetches the entire coin index for lookup
     * @param data                  the data associated with the http request
     * @param consumerCallback      the callback to the consumer of this method
     * @private
     */
    static _onFetchCoinIndexResponse(data, consumerCallback) {
        let tickerLookup = new Map();
        let coinIndex = new Map();

        if(consumerCallback){
            // expects JSON
            let coinData = JSON.parse(data);

            for(let i = 0; i < coinData.length; i++){
                let id = coinData[i].id;
                coinIndex.set(id, coinData[i]);

                let symbol = coinData[i].symbol;
                tickerLookup.set(symbol, id);
            }
        }

        consumerCallback(coinIndex, tickerLookup);
    }

    /**
     * Finds the price of a coin based on its full name
     * @param coinName  the full coin name
     */
    static lookupCoinPrice(coinName, callback) {
        this.execute(CoinMarketCap._getCoinHost(), CoinMarketCap._getCoinHostPath() + coinName + "/", CoinMarketCap._onCoinLookupResponse, callback); // execute the HTTP get command
    }

    /**
     * The function responsible for handling the data returned from the HTTP response
     * @param data                  the data returned from the HTTP response
     * @param consumerCallback      the callback to the consumer of this task
     * @private
     */
    static _onCoinLookupResponse(data, consumerCallback){
        if(consumerCallback){
            // expects JSON
            let coinData = JSON.parse(data);
            if(coinData[0] !== undefined) {
                let coinPrice = coinData[0].price_usd;
                if(coinPrice) {
                    consumerCallback(coinPrice);
                    return;
                }
            }

            // fail with null return
            consumerCallback(null);
        }
    }

    /**
     * @returns {string} the hostname of the API for coin lookup
     * @private
     */
    static _getCoinHost(){
        return "api.coinmarketcap.com";
    }

    /**
     * Returns the path relative to the host given a coin name
     * @param coinName      the name of the coin
     * @returns {string}    the path of the HTTP request relative to the host name
     * @private
     */
    static _getCoinHostPath(){
        return "/v1/ticker/";
    }
};