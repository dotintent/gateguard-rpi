const NodeCache = require('node-cache')

const cacheElementTimeout = 30 // in seconds

class Shared {
    constructor() {
        this.subscribedToCharacteristic = false
        this.bleServiceUUID = '93384AB6-9EB1-4AF2-90FB-F88ABB6F79AF'
        this.bleCharacteristicUUID = '4E98BE1C-F8D9-46AD-9D08-C0AAA7DFEE7A'
        this.cache = new NodeCache({ stdTTL: cacheElementTimeout })
        this.ELECTROLOCK_ON_DURATION = 3000 // 3 seconds
    }
}

const shared = new Shared()


module.exports.shared = shared