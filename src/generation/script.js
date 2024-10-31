import { init } from './init.js'

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}
