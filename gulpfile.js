// Required
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jsonfile = require('jsonfile');
var uglify = require('gulp-uglify-es').default;
var inliner = require('sass-inline-svg');

// Plugins
var plugins = require('gulp-load-plugins')(); // Include all plugins from package.json

// Config file
var configFile = 'config.json';
var config = jsonfile.readFileSync(configFile);

// Paths
var src = config.src; // Work folder
var dest = config.dest; // Compile folder

// Tasks
gulp.task('css', function () {
  return gulp.src(src + '/main.scss')
    .pipe(plugins.sassGlob()) // Allow glob import for SASS
    .pipe(plugins.sass({
        functions: {
            svg: inliner(src + '/_assets/svg/', [])
        }
    })) // Compile CSS
    .pipe(plugins.csscomb()) // Re-ordonate properties
    .pipe(plugins.cssbeautify({indent: '    '})) // Re-indent
    .pipe(plugins.autoprefixer()) // Auto-prefidx CSS3 properties
    .pipe(gulp.dest(dest + '/'))
    .pipe(browserSync.stream()); // Sync browser
});

gulp.task('minify-css', function () {
    return gulp.src(dest + '/main.css')
    .pipe(plugins.stripCssComments()) // Remove comments
    .pipe(plugins.csso()) // Minify CSS
    .pipe(plugins.rename({suffix: '.min'})) // Create min.css file
    .pipe(gulp.dest(dest + '/'));
});

gulp.task('js', function() {
    return gulp.src(src + '/**/*.js')
    .pipe(plugins.jshint()) // Check JS files for convention rules
    .pipe(plugins.jshint.reporter('default')) // Report errors
    .pipe(plugins.babel()); // Compile JS for old browsers
    // .pipe(gulp.dest(dest + '/'));
});

gulp.task('minify-js', function() {
    return gulp.src(src + '/**/*.js')
    .pipe(uglify()) // Minify JS
    .pipe(plugins.concat('scripts.min.js')) // Concatenate all JS file in one
    .pipe(gulp.dest(dest + '/'));
});

gulp.task('sync', function() {
    browserSync.init({
        proxy: config.proxy,
        port: config.port
    });
    gulp.watch(src + '/**/*', gulp.series(['css', 'minify-css', 'js', 'minify-js'])).on('change', browserSync.reload);
});

// Default task
gulp.task('default', gulp.series('sync'));
