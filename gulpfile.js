const { src, dest, watch, series, parallel } = require('gulp');
const htmlMin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const browswerSync = require('browser-sync');
const del = require('del');

const htmlTask = () => {
    return src('./src/index.html', { base: "./src" })
           .pipe(htmlMin({
            collapseWhitespace: true
           }))
           .pipe(dest('public/dist'))
}

const lessTask = () => {
    return src("./src/css/**.less", { base: "./src" })
           .pipe(less())
           .pipe(postcss([postcssPresetEnv()]))
           .pipe(dest("public/dist"))
}

const jsTask = () => {
    return src('./src/js/**.js', { base: "./src" })
           .pipe(babel({
            presets: ["@babel/preset-env"]
           }))
           .pipe(terser({
            mangle: {
                toplevel: true
            }
           }))
           .pipe(dest("public/dist"))
}

const bs = browswerSync.create();
const serve = () => {
    watch("./src/index.html", series(htmlTask));
    watch("./src/css/*.less", series(lessTask, htmlTask));
    watch("./src/js/*.js", series(jsTask, htmlTask));

    bs.init({
        port: 8888,
        open: true,
        files: 'public/dist/*',
        server: {
            baseDir: 'public/dist'
        }
    })
}

const clean = () => {
    return del(["dist"])
}
const buildTask = series(clean, parallel(htmlTask, lessTask, jsTask));
const serveTask = series(buildTask, serve);

module.exports = {
    serveTask,
    buildTask
}