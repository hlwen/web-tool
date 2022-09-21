const fs = require('fs');
const gulp = require('gulp');
const {src, dest, watch, symlink, task, series, lastRun, parallel} = require('gulp');
const rimraf = require('rimraf');// 只是删除文件以及文件夹 我们没必要去用一个 gulp 插件，直接用原生的 node 模块
const plugins = require('gulp-load-plugins')(); // 自动加载 gulp 插件
// const pngquant = require('imagemin-pngquant');  // 使用 pngquant 深度压缩 png 图片的 imagemin 插件
const browserSync = require('browser-sync');    // 本地开发 浏览器实时刷新
const eslint = require('gulp-eslint');          // js 代码检查
const reload = browserSync.reload;
const proxy = require('http-proxy-middleware'); // 本地开发 代理
const minimist = require('minimist');           // 命令行参数解析工具
const fileinclude = require('gulp-file-include');
const replace = require('gulp-replace');
const gulpChanged = require('gulp-changed');

// 解析命令行中的参数
const knownOptions = {
    string: 'env',
    default: {env: process.env.NODE_ENV || 'development'}
};
const options = minimist(process.argv.slice(2), knownOptions);
console.log(options, 'options');


// 定义路径对象
const srcRoot = 'src/'; // 源目录文件夹
const distRoot = 'build/'; // 输出目录文件夹
const paths = {
    src: {
        css: srcRoot + 'assets/css/',
        js: srcRoot + 'assets/js/',
        img: srcRoot + 'assets/images/',
        lib: srcRoot + 'static/',
        page: srcRoot,
    },
    dest: {
        css: distRoot + 'assets/css/',
        js: distRoot + 'assets/js/',
        img: distRoot + 'assets/images/',
        lib: distRoot + 'static/',
        html: distRoot,
    }
};

/**
 * 删除打包目录
 */
task('clean', (cb) => {
    rimraf('build', cb);
});

/**
 * 处理图片
 */
task('img', () => {
    const imgSuffix = '**/*.+(jpeg|jpg|png|svg|gif|ico)';
    return src([paths.src.img + imgSuffix])
        .pipe(gulpChanged(paths.dest.css))
        .pipe(plugins.rename(function (path) {
            path.dirname = path.dirname.split('/')[0]; // 将 views/xxx/img/ 下的图片 提到外面一层 放到 images/xx/ 下。去掉了 img 文件夹
        }))
        // .pipe(imagemin({
        //   optimizationLevel: 5, // 取值范围：0-7（优化等级）
        //   progressive: true, // 无损压缩jpg图片
        //   verbose: false, // 输出压缩结果
        //   use: [pngquant()] // 使用 pngquant 深度压缩 png 图片的 imagemin 插件
        // }))
        .pipe(dest(paths.dest.img))
});

/**
 * 处理 css
 * 这里将 less 文件分开写，是有原因的 这样打包出来的文件夹会少一层
 */
task('css', () => {
    return src([paths.src.css + '**/*.less', paths.src.css + '**/*.css'], {sourcemaps: true})
        .pipe(gulpChanged(paths.dest.css, {extension: '.css'}))
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({
            cascade: true,
            remove: true
        }))
        .pipe(plugins.if(options.env === 'production', plugins.cleanCss({
            compatibility: 'ie11',
        })))
        .pipe(plugins.rename({
            suffix: ''
        }))
        .pipe(dest(paths.dest.css, {sourcemaps: '.'}))
        .pipe(reload({
            stream: true
        }))
});

/**
 * 处理 js
 */
task('js', () => {
    return src([paths.src.js + '**/*.js'], {sourcemaps: true})

        .pipe(gulpChanged(paths.dest.js))
        .pipe(eslint())
        .pipe(eslint.format())  // 错误格式化输出
        .pipe(plugins.babel())
        .pipe(plugins.if(options.env === 'production', plugins.uglify()))
        .pipe(plugins.rename({
            suffix: ''
        }))
        .pipe(dest(paths.dest.js, {sourcemaps: '.'}));
});

/**
 * 处理 html
 */
task('html', function () {
    return src(['!src/static/**/*.html', paths.src.page + '*.html'])
        //   .pipe(plugins.cheerio(function ($, file, done) {
        //     // $('body').prepend('<script src="../../dist/js/env.js"></script>');
        //     // $('body').prepend(`<script>window.PROJECT_NODE_ENV = '${options.env}';</script>`);
        //     done();
        //   }))
        //   .pipe(plugins.htmlmin({
        //     removeComments: true,               // 清除HTML注释
        //     collapseWhitespace: true,           // 压缩空格
        //     collapseBooleanAttributes: true,    // 省略布尔属性的值 <input checked="true"/> => <input checked>
        //     removeEmptyAttributes: true,        // 删除所有空格作属性值 <input id=""> => <input>
        //     removeScriptTypeAttributes: true,   // 删除<script>的type="text/javascript"
        //     removeStyleLinkTypeAttributes: true,// 删除<style>和<link>的type="text/css"
        //     minifyJS: true,                     // 压缩页面JS
        //     minifyCSS: true                     // 压缩页面CSS
        //   }))
        .pipe(dest(paths.dest.html));
});


// html 包含文件
task('fileinclude', function () {
    return src(['!src/components/*.html', '!src/static/**/*.html', 'src/*.html'])
        .pipe(gulpChanged(paths.dest.html))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: './src/components/'
        }))
        .pipe(replace(/\.less/g, '.css'))
          .pipe(plugins.htmlmin({
            removeComments: true,               // 清除HTML注释
            collapseWhitespace: true,           // 压缩空格
            collapseBooleanAttributes: true,    // 省略布尔属性的值 <input checked="true"/> => <input checked>
            removeEmptyAttributes: true,        // 删除所有空格作属性值 <input id=""> => <input>
            removeScriptTypeAttributes: true,   // 删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,// 删除<style>和<link>的type="text/css"
            minifyJS: true,                     // 压缩页面JS
            minifyCSS: true                     // 压缩页面CSS
          }))
        //   .pipe(plugins.cheerio(function ($, file, done) {
        //     // $('body').prepend('<script src="../../dist/js/env.js"></script>');
        //     // $('body').prepend(`<script>window.PROJECT_NODE_ENV = '${options.env}';</script>`);
        //     done();
        //   }))
        .pipe(gulp.dest(paths.dest.html))
    // .pipe(reload({
    //     stream: true
    // }));
});


/**
 * 拷贝第三方库
 */
task('lib', () => {
    return src(paths.src.lib + '**/*.*')
        .pipe(dest(paths.dest.lib));

});

/**
 * 监听任务
 */
task('watcher', () => {
    const imgSuffix = '**/*.+(jpeg|jpg|png|svg|gif|ico)';
    watch(['!src/static/**.*', paths.src.css + '**/*.less', paths.src.css + '**/*.css'], series('css'));
    watch(['!src/static/**.*', paths.src.js + '**/*.js'], series('js'));
    watch(['!src/static/**.*', paths.src.img + imgSuffix], series('img'));
    // watch(paths.src.lib + '**/*.*', series('lib'));
    // watch(paths.src.page + '**/*.html', series('html'));
    watch(['!src/static/**.*', paths.src.page + '**/*.html'], series('fileinclude'));
});

/**
 * 本地开发代理
 */
const getProxyTable = () => {
    return [
        proxy.createProxyMiddleware('/api', {
            target: 'http://127.0.0.1:8080/', // 锦舟本地
            changeOrigin: true,
            pathRewrite: {
                '^/api/': ''
            }
        }),
    ]
};

/**
 * 创建本地服务器
 */
task('server', () => {
    browserSync.init({
        server: {
            baseDir: "build/",
            middleware: getProxyTable()
        },
        serveStatic: [{
            route: '/static',
            dir: ['./src/static']
        }],
        ui: false,
        open: false,
        files: ['**'],
        // browser: "google chrome",
        notify: true,
        online: false,
        port: 4000    //端口
    });
});

// exports.default = series('clean', parallel('css','img', 'js', 'html'), parallel('watcher', 'server'),(done) => done());

exports.default = series('clean', parallel('css', 'img', 'js', 'fileinclude'), parallel('watcher', 'server'));

exports.build = series('clean', 'lib', 'img', 'css', 'js', 'fileinclude');
