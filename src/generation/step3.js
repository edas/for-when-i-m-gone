import { goToStep, onStepChange } from './changesteps.js'
import config from './config.json'
const ids = config.html.ids

export function checkStep3() {
    return true
}

function goToStep4() {
    goToStep(4)
}

function goToStep2() {
    goToStep(2)
}

function validateStep3() {
    return true
}

export function onStep3Init() {
    const next = document.getElementById(ids.step3next)
    next.addEventListener('click', goToStep4)
    const previous = document.getElementById(ids.step3previous)
    previous.addEventListener('click', goToStep2)
    validateStep3()
    onStepChange()
}