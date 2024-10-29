
import SSSS from "ssss-js";

const byteToHexLookupTable = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, '0'));

function bufferToHex(buff) {
    let hexString = '';
    const array = new Uint8Array(buff)
    for (let index = 0; index < array.length; index++) {
        hexString += byteToHexLookupTable[array[index]];
    }
    return hexString;
}

async function generateKey({ encryptionAlgorithm, encryptionKeyLength }) {
    const keyType = { name: encryptionAlgorithm, length: encryptionKeyLength }
    const extractable = true
    const keyUsages = ["encrypt", "decrypt"]
    const encryptionKey = await window.crypto.subtle.generateKey(keyType, extractable, keyUsages)
    return encryptionKey
}

async function encryptSecret({ secret, encryptionKey, encryptionAlgorithm }) {
    const iv = window.crypto.getRandomValues(new Uint8Array(96)); // for AES-GCM
    const algorithm = { name: encryptionAlgorithm, iv };
    const encodedSecret = new TextEncoder().encode(secret);
    const encryptedData = await window.crypto.subtle.encrypt(algorithm, encryptionKey, encodedSecret);
    return encryptedData
}

async function splitKey({ threshold, shares, encryptionKey }) {
    const rawKey = await window.crypto.subtle.exportKey("raw", encryptionKey)  // ArrayBuffer
    const hexKey = bufferToHex(rawKey)
    const hexMode = true
    const ssss = new SSSS(threshold, shares, hexMode);
    const prefix = ''
    const options = {}
    const tokens = await ssss.split(hexKey, prefix, options);
    return tokens
}

async function encrypt({ secret, shares, threshold, encryptionAlgorithm, encryptionKeyLength }) {
    const encryptionKey = await generateKey({ encryptionAlgorithm, encryptionKeyLength })
    const encryptedData = await encryptSecret({ secret, encryptionKey, encryptionAlgorithm })
    const shamirTokens = (await splitKey({ threshold, shares, encryptionKey }))[0]
    return {
        encryptionAlgorithm,
        encryptionKeyLength,
        encryptedData,
        shamirTokens,
    }
}




// STEP 1
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
    const secret = document.getElementById('secret')
    const secretValid = validateSecret(secret)
    return secretValid
}
function checkStep1() {
    const secret = document.getElementById('secret')
    return secret.validity.valid
}
function goToStep2() {
    goToStep(2)
}
function onStep1Init() {
    const form = document.getElementById('generate')
    const secret = document.getElementById('secret')
    secret.addEventListener('input', onSecretChange)
    const next = document.getElementById('step1next')
    next.addEventListener('click', goToStep2)
    validateStep1()
    onStepChange()
}
// STEP 2
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
    const shares = document.getElementById('shares')
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
    const quorum = document.getElementById('quorum')
    validateQuorumAndShare({ quorum, shares, main: 'shares' })
    onStepChange()
    element.reportValidity()
}

function validateStep2({ main } = { main: 'shares' }) {
    const quorum = document.getElementById('quorum')
    const quorumValid = validateQuorum(quorum)
    const shares = document.getElementById('shares')
    const sharesValid = validateShares(shares)
    const sharesAndQuorumValid = validateQuorumAndShare({ quorum, shares, main })
    return quorumValid && sharesValid && sharesAndQuorumValid
}
function checkStep2() {
    const quorum = document.getElementById('quorum')
    const shares = document.getElementById('shares')
    const participants = document.getElementById('participants')
    return quorum.validity.valid && shares.validity.valid && participants.validity.valid
}
function goToStep3() {
    goToStep(3)
}
function goToStep1() {
    goToStep(1)
}
function onStep2Init() {
    const quorum = document.getElementById('quorum')
    quorum.addEventListener('input', onQuorumChange)
    const shares = document.getElementById('shares')
    shares.addEventListener('input', onSharesChange)
    const next = document.getElementById('step2next')
    next.addEventListener('click', goToStep3)
    const previous = document.getElementById('step2previous')
    previous.addEventListener('click', goToStep1)
    validateStep2()
    onStepChange()
}


// STEP 3
function checkStep3() {
    return true
}
function goToStep4() {
    goToStep(4)
}
function validateStep3() {
    return true
}
function onStep3Init() {
    const next = document.getElementById('step3next')
    next.addEventListener('click', goToStep4)
    const previous = document.getElementById('step3previous')
    previous.addEventListener('click', goToStep2)
    validateStep3()
    onStepChange()
}
// STEP 4
function checkStep4() {
    return true
}
function returnToStep3() {
    showResult("Renseignez les informations du formulaire pour générer vos documents.")
    goToStep(3)
}
function onStep4Init() {
    const previous = document.getElementById('step4previous')
    previous.addEventListener('click', goToStep3)
}
// GENERAL FORM
function onGenerateSubmit(e) {
    e.preventDefault()
    const secret = document.getElementById('secret').value.trim()
    const shares = parseInt(document.getElementById('shares').value)
    const threshold = parseInt(document.getElementById('quorum').value)
    const encryptionAlgorithm = document.getElementById('cipher').value
    const encryptionKeyLength = parseInt(document.getElementById('length').value)
    showResult("Les documents sont en cours de génération. Patientez s'il vous plait.")
    encrypt({ secret, shares, threshold, encryptionAlgorithm, encryptionKeyLength }).then(showResult).catch(showResult)
}
function showResult(msg) {
    const status = document.getElementById('status')
    status.textContent = msg

}
function onStepChange() {
    const step1 = checkStep1()
    const step2 = checkStep2()
    const step3 = checkStep3()
    setStepStatus(1, step1)
    setStepStatus(2, step1 && step2)
    setStepStatus(3, step1 && step2 && step3)
}
function setStepStatus(x, status) {
    if (status) {
        document.getElementById(`step${x}next`).removeAttribute('disabled')
    } else {
        document.getElementById(`step${x}next`).setAttribute('disabled', 'disabled')
    }
}
function onGenerateInit() {
    onStep1Init()
    onStep2Init()
    onStep3Init()
    onStep4Init()
    document.getElementById('generate').addEventListener('submit', onGenerateSubmit)
}
onGenerateInit()
function goToStep(x) {
    const form = document.getElementById('generate')
    form.setAttribute('data-current-step', x)
    const section = document.querySelector(`section[data-page="${x}"]`)
    section.focus()
}