import { goToStep, onStepChange } from './changesteps.js'
import config from './config.json'
const ids = config.html.ids

function isValidityStateCorrectNumber(validity) {
    const stepMismatch = validity.stepMismatch
    const rangeOverflow = validity.rangeOverflow
    const rangeUnderflow = validity.rangeUnderflow
    const badInput = validity.badInput
    const valueMissing = validity.valueMissing
    const correctNumber = !badInput && !stepMismatch && !rangeOverflow && !rangeUnderflow && !valueMissing
    return correctNumber
}

function validateQuorumAndShare({ quorum, shares, main }) {
    const quorumValidity = quorum.validity
    const sharesValidity = shares.validity
    if (isValidityStateCorrectNumber(sharesValidity)) {
        if (isValidityStateCorrectNumber(quorumValidity)) {
            // check if shares is greater or equal to quorum
            const sharesValue = shares.value
            const sharesInt = parseInt(sharesValue)
            const quorumValue = quorum.value
            const quorumInt = parseInt(quorumValue)
            if (sharesInt < quorumInt) {
                const mainElement = main === 'quorum' ? quorum : shares
                const secondaryElement = main === 'quorum' ? shares : quorum
                mainElement.setCustomValidity("Le nombre de participants doit être supérieur ou égal au quorum")
                secondaryElement.setCustomValidity("")
            } else {
                quorum.setCustomValidity("")
                shares.setCustomValidity("")
                return true
            }
        } else {
            shares.setCustomValidity("")
        }
    } else if (isValidityStateCorrectNumber(quorumValidity)) {
        quorum.setCustomValidity("")
    }
    return false
}

function onQuorumChange(e) {
    const element = e.target
    validateQuorum(element)
    const shares = document.getElementById(ids.shares)
    validateQuorumAndShare({ quorum: element, shares, main: 'quorum' })
    onStepChange()
    element.reportValidity()
}

function validateQuorum(element) {
    const validity = element.validity
    const valueMissing = validity.valueMissing
    if (isValidityStateCorrectNumber(validity)) {
        element.setCustomValidity("")
        return true
    }
    if (valueMissing) {
        element.setCustomValidity("Un quorum est nécessaire pour reconstituer le secret")
    } else {
        element.setCustomValidity("Le quorum doit être un nombre entier supérieur à 1")
    }
    return false
}

function validateShares(element) {
    const validity = element.validity
    const valueMissing = validity.valueMissing
    if (isValidityStateCorrectNumber(validity)) {
        element.setCustomValidity("")
        return true
    }
    if (valueMissing) {
        element.setCustomValidity("Il est nécessaire de définir le nombre de participants")
    } else {
        element.setCustomValidity("Le nombre de participants doit être un nombre entier supérieur à 1")
    }
    return false

}

function onSharesChange(e) {
    const element = e.target
    validateShares(element)
    const quorum = document.getElementById(ids.quorum)
    validateQuorumAndShare({ quorum, shares: element, main: 'shares' })
    onStepChange()
    element.reportValidity()
}

function validateStep2({ main } = { main: 'shares' }) {
    const quorum = document.getElementById(ids.quorum)
    const quorumValid = validateQuorum(quorum)
    const shares = document.getElementById(ids.shares)
    const sharesValid = validateShares(shares)
    const sharesAndQuorumValid = validateQuorumAndShare({ quorum, shares, main })
    return quorumValid && sharesValid && sharesAndQuorumValid
}

export function checkStep2() {
    const quorum = document.getElementById(ids.quorum)
    const shares = document.getElementById(ids.shares)
    const participants = document.getElementById(ids.participants)
    return quorum.validity.valid && shares.validity.valid && participants.validity.valid
}

function goToStep3() {
    goToStep(3)
}

function goToStep1() {
    goToStep(1)
}

export function onStep2Init() {
    const quorum = document.getElementById(ids.quorum)
    quorum.addEventListener('input', onQuorumChange)
    const shares = document.getElementById(ids.shares)
    shares.addEventListener('input', onSharesChange)
    const next = document.getElementById(ids.step2next)
    next.addEventListener('click', goToStep3)
    const previous = document.getElementById(ids.step2previous)
    previous.addEventListener('click', goToStep1)
    validateStep2()
    onStepChange()
}
