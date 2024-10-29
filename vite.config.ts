import { resolve } from 'path'
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import handlebars from 'vite-plugin-handlebars'

export default defineConfig({
    build: { minify: false },
	plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'src', 'html'),
        }),
        viteSingleFile({ removeViteModuleLoader: true })
    ],
})