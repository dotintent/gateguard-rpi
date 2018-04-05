const gpio = require('rpi-gpio')


const LEDStateEnum = Object.freeze( {"on": 1, "off": 0} )
const LEDColorEnum = Object.freeze( {"green": 38, "red": 40} )
const LEDModeEnum = Object.freeze( {"solid": 0, "blinking": 1} )


class LEDManager {
    constructor(ledColor) {
        this.color = ledColor
        this.state = LEDStateEnum.off
        this.mode = LEDModeEnum.solid

        gpio.setup(this.color, gpio.DIR_OUT)

    }

    on(mode, duration = 0) {
        this._clearHandlers()

        this.state = LEDStateEnum.on
        this.mode = mode

        console.log('LED ' + this.color + ' is ON - mode: ' + mode + ', duration: ' + duration)

        const _this = this

        if (mode === LEDModeEnum.solid) {
            gpio.write(this.color, LEDStateEnum.on, function() {
                if (duration > 0) {
                    _this.timeoutHandler = setTimeout(function() {
                        _this.off()
                    }, duration)
                }
            })
        } else {
            var lightOn = true
            this.blinkingIntervalHandler = setInterval(function() {
                gpio.write(_this.color, lightOn, function() {
                    lightOn = !lightOn
                })
            }, 50)

            if (duration > 0) {
                this.timeoutHandler = setTimeout(function () {
                    _this.off()
                }, duration)
            }
        }
    }

    off() {
        console.log('LED ' + this.color + ' is OFF')

        this.state = LEDStateEnum.off

        this._clearHandlers()

        gpio.write(this.color, LEDStateEnum.off)
    }

    _clearHandlers() {
        clearInterval(this.blinkingIntervalHandler)
        clearTimeout(this.timeoutHandler)
    }
}


module.exports = {
    LEDManager: LEDManager,
    LEDStateEnum: LEDStateEnum,
    LEDColorEnum: LEDColorEnum,
    LEDModeEnum: LEDModeEnum
}