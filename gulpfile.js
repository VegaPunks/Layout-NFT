// gulp
import gulp from "gulp";
import pug from "gulp-pug";
import plumber from "gulp-plumber";
import browsersync from "browser-sync";
import dartSass from "sass"
import gulpSass from "gulp-sass"
import rename from "gulp-rename"

import cleanCss from "gulp-clean-css"  // Сжатие css файла
import autoprefixer from "gulp-autoprefixer"  // Добавление вендорных префиксов
import webpack from "webpack-stream"
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";
import notify from "gulp-notify";
import del from "del";
import newer from "gulp-newer";


const sass = gulpSass(dartSass)


const src = './src'
const build = "./dist"

const path = {
	build: {
		html: `${build}/`,
		css: `${build}/css/`,
		js: `${build}/js/`,
		img: `${build}/img/`,
	},
	src: {
		html: `${src}/*.pug`,
		css: `${src}/scss/index.scss`,
		js: `${src}/js/app.js`,
		img: `${src}/img/**/*.{png,jpeg,jpg,gif,webp}`
	},
	watch: {
		html: `${src}/**/*.pug`,
		css: `${src}/scss/**/*.scss`,
		js: `${src}/js/**/*.js`,
		img: `${src}/img/**/*.{jpg,jpeg,png,svg,gif,icon,web}`,
	},
	clean: build
}


const html = () => {
	return gulp.src(path.src.html)
		.pipe(plumber(
			notify.onError({
				title: "HTML",
				message: "Error: <%= error.message %>"
			})
		))
		.pipe(pug({
			pretty: true,
			verbose: true,
		}))
		.pipe(gulp.dest(path.build.html))
		.pipe(browsersync.stream())
}

const css = () => {
		return gulp.src(path.src.css, {sourcemaps: true})
		.pipe(plumber(
			notify.onError({
				title: "SCSS",
				message: "Error: <%= error.message %>"
			})
		))
		.pipe(sass({
			outputStyle: "expanded",
		}))
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 3 versions"],
			cascade: true
		}))
		.pipe(gulp.dest(path.build.css))
		.pipe(cleanCss())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(gulp.dest(path.build.css))
		.pipe(browsersync.stream())
}

const js = () => {
		return gulp.src(path.src.js, { sourcemaps: true })
		.pipe(plumber(
			notify.onError({
				title: "JS",
				message: "Error: <%= error.message %>"
			})
		))
		.pipe(webpack({
			mode: "development",
			output: {
				filename: "app.min.js"
			}
		}))
		.pipe(gulp.dest(path.build.js))
		.pipe(browsersync.stream())
}

const image = () => {
	return gulp.src(path.src.img)
		.pipe(plumber(
			notify.onError({
				title: "img",
				message: "Error: <%= error.message %>"
			})
		))
		.pipe(newer(path.build.img))
		.pipe(webp())
		.pipe(gulp.dest(path.build.img))
		.pipe(gulp.src(path.src.img))
		.pipe(newer(path.build.img))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			interlaced: true,
			optimizationLevel: 3 // 0 to 7
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(browsersync.stream())
}

		
const server = () => {
	browsersync.init({
		server: {
			baseDir: `${path.build.html}`
		},
		notify: false,
		port: 3000
	})
}


const watch = () => {
	gulp.watch(path.watch.html, html)
	gulp.watch(path.watch.css, css)
	gulp.watch(path.watch.js, js)
	gulp.watch(path.watch.img, image)
}


const reset = () => {
	return del(path.clean)
}

const main = gulp.parallel(image, html, css, js)
const dev = gulp.series(reset, main, gulp.parallel(watch, server))

export { dev }
export { build }

gulp.task("default", dev)