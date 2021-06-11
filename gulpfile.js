var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('compile', function () {
    return gulp.src('src/*.ts')
        .pipe(ts({
            "target": "es2015",
            "strict": true,
            "outDir": "./target",
            "forceConsistentCasingInFileNames": true,
            "downlevelIteration": true,
            "lib": [
                "es2015"
            ],
            "pretty": true,
            "removeComments": true,
            "incremental": true,
            "out": "extension.js",
            "noUnusedLocals": true,
            "noUnusedParameters": true
        }))
        .pipe(gulp.dest('.'));
});


gulp.task('default', function () {
    gulp.watch('*.ts', ['compile']);
});
