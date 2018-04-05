const request = require('request')


class TokenService {
    constructor() {
        this.requestInProgress = false
    }

    registerTokenInCloud(tokenId, token, completionCallback) {
        console.log('register token in cloud service')
        if (!this.requestInProgress) {
            console.log('http request')

            const _this = this

            this.requestInProgress = true

            request(this._requestOptions(tokenId, token), function(error, response, body) {
                console.log('http response')

                _this.requestInProgress = false

                if (!error && response.statusCode == 200) {
                    console.log('New token registered on cloud service with success')
                    completionCallback(true)
                } else {
                    console.error('Error while registering token in cloud service: ' + error)
                    completionCallback(false)
                }
            })
        }
    }

    _requestOptions(tokenId, token) {
        return {
            uri: 'https://gateguard.herokuapp.com/register-token',
            method: 'POST',
            json: {
                "id": tokenId,
                "token": token
            }
        }
    }
}


module.exports.TokenService = TokenService