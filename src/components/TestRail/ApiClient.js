const unirest = require('unirest');
const ApiError = require('./ApiError');
const FormData = require('form-data');
const fs = require('fs');

class ApiClient {
    /**
     * @param domain
     * @param username
     * @param password
     */
    constructor(domain, username, password) {
        this.username = username;
        this.password = password;
        this.baseUrl = `https://${domain}/index.php?/api/v2`;
    }

    /**
     *
     * @param slug
     * @param postData
     * @param onSuccess
     * @param onError
     * @returns {Promise<AxiosResponse<any>>}
     */
    async sendData(slug, postData, onSuccess, onError) {
        return unirest.post(this.baseUrl + slug)
            .headers({ 'Content-Type': 'application/json' })
            .auth(this.username, this.password)
            .send(postData)
            .then((response) => {
                response.data = response.body;
                return onSuccess(response);
            })
            .catch((error) => {
                // extract our error
                const apiError = new ApiError(error);
                // notify about an error
                return onError(apiError.getStatusCode(), apiError.getStatusText(), apiError.getErrorText());
            });
    }

    /**
     *
     * @param resultId
     * @param screenshotPath
     * @param onSuccess
     * @param onError
     * @returns {Promise<AxiosResponse<any>>}
     */
    sendScreenshot(resultId, screenshotPath, onSuccess, onError) {
        const formData = new FormData();
        formData.append('attachment', fs.createReadStream(screenshotPath));

        return unirest.post(this.baseUrl + '/add_attachment_to_result/' + resultId)
        .headers({ 'Content-Type': 'multipart/form-data' })
        .auth(this.username, this.password)
        .send(formData)
            .then((response) => {
                if (onSuccess) {
                    response.data = response.body;
                    return onSuccess(response);
                }
            })
            .catch((error) => {
                // extract our error
                const apiError = new ApiError(error);
                // notify about an error
                if (onError) {
                    return onError(apiError.getStatusCode(), apiError.getStatusText(), apiError.getErrorText());
                }
            });
    }
}

module.exports = ApiClient;
