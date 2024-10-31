import { resolve } from 'path'
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import handlebars from 'vite-plugin-handlebars'

import generation from './src/generation/config.json'

export default defineConfig({
    build: { minify: false },
	plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'src'),
            context: { generation }
        }),
        viteSingleFile({ removeViteModuleLoader: true })
    ],
})