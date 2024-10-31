import { checkStep1 } from './step1.js'
import { checkStep2 } from './step2.js'
import { checkStep3 } from './step3.js'

import config from './config.json'
const ids = config.html.ids

function setStepStatus(x, status) {
    if (status) {
        document.getElementById(ids[`step${x}next`]).removeAttribute('disabled')
    } else {
        document.getElementById(ids[`step${x}next`]).setAttribute('disabled', 'disabled')
    }
}

export function onStepChange() {
    const step1 = checkStep1()
    const step2 = checkStep2()
    const step3 = checkStep3()
    setStepStatus(1, step1)
    setStepStatus(2, step1 && step2)
    setStepStatus(3, step1 && step2 && step3)
}

export function goToStep(x) {
    const form = document.getElementById(ids.form)
    form.setAttribute('data-current-step', x)
    const section = form.querySelector(`section[data-page="${x}"]`)
    section.focus()
}