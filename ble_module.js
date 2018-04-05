const bleno = require('bleno')
const shared = require('./shared_module').shared
const led = require('./led_module')
const relay = require('./relay_module')


class GateGuardBLEService extends bleno.PrimaryService {
    constructor(greenLedManager, redLedManager, relayManager) {
        super({
            uuid: shared.bleServiceUUID,
            characteristics: [new GateGuardBLECharacteristic(greenLedManager, redLedManager, relayManager)]
        })

        this.valueDidChangeCallback = null
    }
}

class GateGuardBLECharacteristic extends bleno.Characteristic {
    constructor(greenLedManager, redLedManager, relayManager) {
        super({
            value: null,
            uuid: shared.bleCharacteristicUUID,
            properties: ['notify', 'write']
        })

        this.greenLedManager = greenLedManager
        this.redLedManager = redLedManager
        this.relayManager = relayManager
    }

    onSubscribe(maxValueSize, callback) {
        console.log('BLE characteristic subscribed')

        shared.subscribedToCharacteristic = true
        this.valueDidChangeCallback = callback
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        console.log('Authorization request from mobile phone')

        this.greenLedManager.off()

        var dataParts = data.toString().split('|')

        const tokenId = dataParts[0]
        const token = dataParts[1]

        var cachedToken = null

        try {
            cachedToken = shared.cache.get(tokenId, true)
            if (token.toUpperCase() == cachedToken.toUpperCase()) {
                console.log('Token is valid! Opening the gate...')

                this.greenLedManager.on(led.LEDModeEnum.solid, shared.ELECTROLOCK_ON_DURATION)
                this.relayManager.on(shared.ELECTROLOCK_ON_DURATION)
            } else {
                console.log('Token is invalid - access to the gate denied!')

                this.redLedManager.on(led.LEDModeEnum.solid, shared.ELECTROLOCK_ON_DURATION)
            }

            callback(0)
        } catch (err) {
            console.log('Error: ' + err)
            callback(1)
        }
    }

    onUnsubscribe() {
        console.log('BLE characteristic unsubscribed')

        shared.subscribedToCharacteristic = false
        this.valueDidChangeCallback = null

        this.greenLedManager.off()
        this.redLedManager.off()
    }

}


module.exports.GateGuardBLEService = GateGuardBLEService
