const gpio = require('rpi-gpio')


const RelayStateEnum = Object.freeze( {"on": 0, "off": 1} ) // the relay is activated with LO signal
const RelayPort = 36

class RelayManager {
    constructor() {
        this.state = RelayStateEnum.off

        gpio.setup(RelayPort, gpio.DIR_OUT, function() {
            gpio.write(RelayPort, RelayStateEnum.off)
        })
    }

    on(duration = 0) {
        this._clearHandlers()

        this.state = RelayStateEnum.on

        console.log('Relay is ON, duration: ' + duration)

        const _this = this

        gpio.write(RelayPort, RelayStateEnum.on, function() {
            if (duration > 0) {
                _this.timeoutHandler = setTimeout(function() {
                    _this.off()
                }, duration)
            }
        })
    }

    off() {
        console.log('Relay is OFF')

        this.state = RelayStateEnum.off

        this._clearHandlers()

        gpio.write(RelayPort, RelayStateEnum.off)
    }

    _clearHandlers() {
        clearTimeout(this.timeoutHandler)
    }
}


module.exports = {
    RelayManager: RelayManager,
    RelayStateEnum: RelayStateEnum
}