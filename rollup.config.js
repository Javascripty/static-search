import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";

// This is where we tell rollup.js what files to bundle, and how to output them.
export default {
    input: "development/static-search.js",
    output: [
        { file: "./production/static-search.js" },
        { file: "./production/static-search.min.js", plugins: [terser()] }
    ],
    plugins: [
        copy({
            targets: [
                { src: "development/static-search.html", dest: "production/"},
                { src: "development/static-search.css", dest: "production/" }
            ]
        })
    ]
};