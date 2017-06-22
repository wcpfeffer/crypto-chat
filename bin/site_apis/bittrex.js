/**
 * Created by Nathan on 6/21/2017.
 */

// see: https://bittrex.com/home/api

const WebTask = require("./webtask").WebTask;

module.exports.Bittrex = class Bittrex extends WebTask {
    constructor() {
        super();
        this._host = "bittrex.com";
        this._basePath = "/api/v1.1/public/";

        this.currencyData = [];

        this.symbolMap = new Map();
        this.fullNameMap = new Map();
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "public" methods
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    updateCache() {
        this.getMarkets();
    }

    getMarkets(callback) {
        this._execute(this._onGetMarketsResponse, callback, "getmarkets");
    }

    getCurrencies(callback) {
        this._execute(this._onGetCurrenciesResponse, callback, "getcurrencies");
    }

    getTicker(callback, currency) {
        let market = this._getMarket(currency);
        this._execute(this._onGetTickerResponse, callback, "getticker?market=" + market);
    }

    getMarketSummaries(callback) {
        this._execute(this._onGetMarketSummariesResponse, callback, "getmarketsummaries");
    }

    getMarketSummary(callback, currency) {
        let market = this._getMarket(currency);
        this._execute(this._onGetMarketSummaryResponse, callback, "getmarketsummary?market=" + market);
    }

    getOrderBook(callback, market, getBuyOrders, getSellOrders, limit) {
        let type;

        if (getBuyOrders === true && getSellOrders === true) {
            type = "both";
        } else if (getBuyOrders === true) {
            type = "buy";
        } else if (getSellOrders === true) {
            type = "sell"
        } else {
            type = "none"; // let the bittrex api reject this so that we can continue through the normal code flow and handle it later with the rest
        }

        this._execute(this._onGetOrderBookResponse, callback, "getorderbook?market=" + market + "&type=" + type + "&depth=" + limit);
    }

    getMarketHistory(callback, market) {
        this._execute(this._onGetMarketHistoryResponse, callback, "getcurrencies?market=" + market);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // "private" methods that should only be called internally
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    _getMarket(currency) {
        currency = currency.toLowerCase()
        if (this.symbolMap.get(currency) !== undefined) {
            return this.currencyData[this.symbolMap.get(currency)].MarketName;
        } else if (this.fullNameMap.get(currency) !== undefined) {
            return this.currencyData[this.fullNameMap.get(currency)].MarketName;
        } else {
            return undefined;
        }
    }

    _onGetMarketsResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        if (jsonData.success === true) {
            self.currencyData = jsonData.result;
            self.symbolMap.clear();
            self.fullNameMap.clear();

            for (let i = 0; i < jsonData.result.length; i++) {
                if (jsonData.result[i].BaseCurrency !== "BTC") {
                    continue;
                }

                let symbol = jsonData.result[i].MarketCurrency.toLowerCase();
                let fullName = jsonData.result[i].MarketCurrencyLong.toLowerCase();

                self.symbolMap.set(symbol, i);
                self.fullNameMap.set(fullName, i);
            }
        }

        console.log(jsonData);
    }

    _onGetCurrenciesResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
    }

    _onGetTickerResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
        callback(JSON.stringify(jsonData.result));
    }

    _onGetMarketSummariesResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
    }

    _onGetMarketSummaryResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
    }

    _onGetOrderBookResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
    }

    _onGetMarketHistoryResponse(self, data, callback) {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
    }
};