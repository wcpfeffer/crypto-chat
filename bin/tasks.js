/**
 * Created by William on 6/13/2017.
 */
const http = require('http');

class WebTask {
    constructor(callback){
        this._consumerCallback = callback;       // callback when the web task has been completed
    }

    /**
     * @returns {*} the callback for when the execute function has completed with an HTTP request
     */
    get responseCallback(){
        return this._responseCallback;
    }

    /**
     * Sets the callback for when the execute function has completed with an HTTP request
     * @param responseCallback  the callback to be assigned
     */
    set responseCallback(responseCallback) {
        this._responseCallback = responseCallback;
    }

    /**
     * @returns {*} the callback for the object consing the data from the task
     */
    get consumerCallback(){
        return this._consumerCallback;
    }

    /**
     * Sets the callback for the object consing the data from the task
     * @param callback the callback to be assigned
     */
    set consumerCallback(callback) {
        this._consumerCallback = callback;
    }

    /**
     * Executes an HTTP command
     * @param host  the hostname
     * @param path  the path relative to the hostname
     */
    execute(host, path) {
        let responseCallback = this.responseCallback;
        let requestCallback = this.consumerCallback;

        return http.get({
            host: host,
            path: path
        }, function(response) {
            var data = '';
            response.on('data', function(d) {
                data += d;
            });
            response.on('end', function() {
                responseCallback(data, requestCallback);
            });
        });
    }
}

module.exports.CoinTask = class CoinTask extends WebTask {
    constructor(callback) {
        super(callback);
    }

    /**
     * Fetches information about the coin
     */
    fetchCoinIndex() {
        this.responseCallback = CoinTask._onFetchCoinIndexResponse;
        this.execute(CoinTask._getCoinHost(), CoinTask._getCoinHostPath());
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
    lookupCoinPrice(coinName) {
        this.responseCallback = CoinTask._onCoinLookupResponse;
        this.execute(CoinTask._getCoinHost(), CoinTask._getCoinHostPath() + coinName + "/"); // execute the HTTP get command
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