/**
 * Created by William on 6/13/2017.
 */
const http = require('http');

class WebTask {
    constructor(callback){
        this._callback = callback;       // callback when the web task has been completed
    }

    get responseCallback(){
        return this._responseCallback;
    }

    set responseCallback(responseCallback) {
        this._responseCallback = responseCallback;
    }

    get callback(){
        return this._callback;
    }

    set callback(callback) {
        this._callback = callback;
    }


    execute(host, path) {
        let responseCallback = this.responseCallback;
        let requestCallback = this.callback;

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
    constructor(callback){
        super(callback);
        this.responseCallback = this._onResponse;
    }

    lookupCoinPrice(coinName) {
        this.execute(this._getCoinHost(), this._getCoinHostPath(coinName)); // execute the HTTP get command
    }

    _onResponse(data, requestCallback){
        if(requestCallback){
            // expects JSON
            let coinData = JSON.parse(data);
            if(coinData[0] !== undefined) {
                let coinPrice = coinData[0].price_usd;
                if(coinPrice) {
                    requestCallback(coinPrice);
                    return;
                }
            }

            // fail with null return
            requestCallback(null);
        }
    }

    _getCoinHost(){
        return "api.coinmarketcap.com";
    }

    _getCoinHostPath(coinName){
        return "/v1/ticker/" + coinName + "/";
    }
}