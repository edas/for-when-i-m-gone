import { onStep1Init } from './step1.js'
import { onStep2Init } from './step2.js'
import { onStep3Init } from './step3.js'
import { onStep4Init } from './step4.js'

import config from './config.json'
const ids = config.html.ids

export function init() {
    onStep1Init()
    onStep2Init()
    onStep3Init()
    onStep4Init()
}