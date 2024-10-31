import { goToStep, onStepChange } from './changesteps.js'
import config from './config.json'
const ids = config.html.ids

function validateSecret(element) {
    const value = element.value.trim()
    const length = value.length
    const validity = element.validity
    const valueMissing = validity.valueMissing
    if (valueMissing || (length === 0)) {
        element.setCustomValidity("Définir un secret est obligatoire. Tout ceci ne sert que si vous avez un secret à transmettre")
        return false
    }
    element.setCustomValidity("")
    return true
}

function onSecretChange(e) {
    const element = e.target
    validateSecret(element)
    onStepChange()
    element.reportValidity()
}

function validateStep1() {
    const secret = document.getElementById(ids.secret)
    const secretValid = validateSecret(secret)
    return secretValid
}

export function checkStep1() {
    const secret = document.getElementById(ids.secret)
    return secret.validity.valid
}

function goToStep2() {
    goToStep(2)
}

export function onStep1Init() {
    const form = document.getElementById(ids.form)
    const secret = document.getElementById(ids.secret)
    secret.addEventListener('input', onSecretChange)
    const next = document.getElementById(ids.step1next)
    next.addEventListener('click', goToStep2)
    validateStep1()
    onStepChange()
}
