const http = require("http");

module.exports.WebTask = class WebTask {

    constructor() {
        // should be replaced by child classes. put here for clarity that this should be set in the child classes
        this._host = "";
        this._basePath = ""; // should start and end this with a "/"
    }

    /**
     * Executes an HTTP command
     * @param responseCallback
     * @param requestCallback
     * @param pathExtension
     */
    _execute(responseCallback, requestCallback, pathExtension) {
        if (this._host === "") {
            console.log("attempted to execute a get request without either a host being set");
            return;
        }

        if (pathExtension === undefined) {
            pathExtension = "";
        }

        let self = this;
        return http.get({
            host: this._host,
            path: this._basePath + pathExtension
        }, function(response) {
            let data = "";
            response.on("data", function(d) {
                data += d;
            });
            response.on("end", function() {
                try {
                    responseCallback(self, data, requestCallback);
                } catch (e) {
                    console.log(e);
                }
            });
        });
    }
};