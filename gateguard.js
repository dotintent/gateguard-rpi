require('console-stamp')(console, { pattern: 'yyyy/mm/dd HH:MM:ss.l' })
const bleno = require('bleno')
const uuid = require('uuid/v4')
const shared = require('./shared_module').shared
const ble = require('./ble_module')
const cloud = require('./cloud_module')
const buttons = require('rpi-gpio-buttons')([11])
const led = require('./led_module')
const relay = require('./relay_module')


const MAX_TOKEN_ID = 0xffff


const tokenService = new cloud.TokenService()
const greenLedManager = new led.LEDManager(led.LEDColorEnum.green)
const redLedManager = new led.LEDManager(led.LEDColorEnum.red)
const relayManager = new relay.RelayManager()

const gateGuardBleService = new ble.GateGuardBLEService(greenLedManager, redLedManager, relayManager)


bleno.on('stateChange', function(state) {
    console.log('BLE state is ' + (state ? 'ON' : 'OFF') + ' now')

    if (state === 'poweredOn') {
        bleno.startAdvertising('GateGuard', [shared.bleServiceUUID])
    } else {
        bleno.stopAdvertising()
    }
})

bleno.on('advertisingStart', function(error) {
    console.log('BLE peripheral started advertising with ' + (error ? 'error: ' + error : 'success'))

    if (!error) {
        bleno.setServices([gateGuardBleService])
    }
})


const buttonStateChanged = function() {
    console.log('Button pressed')

    if (shared.subscribedToCharacteristic) {
        if (!tokenService.requestInProgress) {
            const tokenId = Math.floor(Math.random() * MAX_TOKEN_ID)
            const token = uuid()

            greenLedManager.on(led.LEDModeEnum.blinking)

            tokenService.registerTokenInCloud(tokenId, token, function (success) {
                console.log('Token registering completed with ' + (success ? 'success' : 'failure'))

                shared.cache.set(tokenId.toString(), token)

                if (success) {
                    gateGuardBleService.characteristics[0].valueDidChangeCallback(Buffer.from(tokenId.toString(), 'utf8'))

                } else {
                    greenLedManager.off()
                    redLedManager.on(led.LEDModeEnum.solid, shared.ELECTROLOCK_ON_DURATION)
                }

            })
        }
    } else {
        redLedManager.on(led.LEDModeEnum.blinking, shared.ELECTROLOCK_ON_DURATION / 3)
    }
}

buttons.on('pressed', function(pin) {
    switch(pin) {
        case 11:
            buttonStateChanged()
            break
    }
})