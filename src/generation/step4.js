import { goToStep, onStepChange } from './changesteps.js'
import { encrypt } from '../encryption.js'
import config from './config.json'
const ids = config.html.ids

export function checkStep4() {
    return true
}

function returnToStep3() {
    showResult("Renseignez les informations du formulaire pour générer vos documents.")
    goToStep(3)
}

export function onStep4Init() {
    const previous = document.getElementById(ids.step4previous)
    previous.addEventListener('click', returnToStep3)
    document.getElementById(ids.form).addEventListener('submit', onGenerateSubmit)
}

function onGenerateSubmit(e) {
    e.preventDefault()
    const secret = document.getElementById(ids.secret).value.trim()
    const shares = parseInt(document.getElementById(ids.shares).value)
    const threshold = parseInt(document.getElementById(ids.quorum).value)
    const encryptionAlgorithm = document.getElementById(ids.cipher).value
    const encryptionKeyLength = parseInt(document.getElementById(ids.length).value)
    showResult("Les documents sont en cours de génération. Patientez s'il vous plait.")
    encrypt({ secret, shares, threshold, encryptionAlgorithm, encryptionKeyLength }).then(showResult).catch(showResult)
}

function showResult(msg) {
    const status = document.getElementById(ids.status)
    status.textContent = msg
}
