const http = require("http");

module.exports.SiteAPI = class SiteAPI {
    /**
     * Executes an HTTP command
     * @param host  the hostname
     * @param path  the path relative to the hostname
     * @param responseCallback
     * @param requestCallback
     */
    static execute(host, path, responseCallback, requestCallback) {
        return http.get({
            host: host,
            path: path
        }, function(response) {
            var data = "";
            response.on("data", function(d) {
                data += d;
            });
            response.on("end", function() {
                responseCallback(data, requestCallback);
            });
        });
    }
}