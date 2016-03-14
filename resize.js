/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, require */

/*
    Notes: 
        Connection to the Zeal NASty server is required to use the directories defined below. To connect from Zeal Network, Finder -> Go -> Connect To Server... 
            Server Address: smb://10.0.1.6
            Username/Password: See index card by Alex's desk
            
        Image resize documentation: https://www.npmjs.com/package/gulp-image-resize
*/

var gulp = require('gulp'),
    rename = require("gulp-rename"), // not used now, but probably will in the future
    imageResize = require('gulp-image-resize'),
    fs = require('fs'),
    path = require('path'),
    sunglassDir = '/Volumes/Zeal NASty/Zeal Library/PRODUCT IMAGERY/_SunglassCollection/',
    gogglesDir = '/Volumes/Zeal NASty/Zeal Library/PRODUCT IMAGERY/_Goggle_Collection/',
    localDir = './img/';

// I dug this data from the .pdf and .xlsx files you provided 
var skus = {
        sunglasses: [
            10732, 10733, 10734, 10721, 10723, 10725, 10873, 10938, 10940, 10939, 10414, 10415, 10416, 10516, 10517, 11162, 11163, 11164, 11165, 11169, 11170, 11171, 10888, 10889, 10891, 10420, 10421, 10941, 10942, 10943, 11116, 11117, 11118, 11005, 11114, 11115, 10004, 10005, 10394, 11064, 11032, 10944, 10945, 10946, 10874, 10875, 10877, 10951, 10952, 10953, 10954, 10955, 10956, 10648, 10652, 10654, 10655, 10729, 10730, 10731, 10878, 10879, 10880, 11022, 10011, 10017, 10398, 10892, 11065, 11066, 10727, 10728, 10395, 10771, 10772, 10962, 11031, 10958, 11033, 10959, 10960, 10961, 11034, 11023, 11024, 11025, 11027, 11028, 11029
        ],
        goggles: [
            11123, 10290, 10796, 10795, 10794, 10474, 11137, 11139, 10798, 10468, 11141, 10469, 10472, 10473, 10799, 11221, 11151, 10802, 10804, 10805, 10803, 11153, 10807, 11148, 10808, 10810, 10811, 11150, 11215, 10462, 10463, 10782, 10783, 10784, 10785, 11129, 10787, 10788, 10341, 10786, 11133, 10789, 11131, 10790, 11213, 10260, 10465, 10483, 10816, 10814, 10815, 10481, 10793, 11230, 10791, 10792, 10287, 10288, 11127, 10298, 10818, 10819, 10820, 10988
        ]
    },
    imageOptions = {
        width: 391,
        height: 261,
        crop: true,
        quality: 1, //0 (worst) to 1 (best)
        format: 'jpg',
        gravity: 'center' // NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast
    };

/* 
    Finds all jpg images in @dir and subdirectories, returns array of files
*/
function walkSync(dir) {
    'use strict';
    var fs = require('fs'),
        files = fs.readdirSync(dir),
        filelist = [];
    files.forEach(function (file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', filelist);
        } else {
            var extension = path.extname(file);
            if (extension === '.jpg' || extension === '.jpeg') {
                filelist.push(dir + file);
            }
        }
    });
    return filelist;
}

/*
    Get all directories in @path 
*/
function getDirectories(path) {
    'use strict';
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

gulp.task('default', function () {
    'use strict';
    var filelist = [];

    console.log('Creating filelist...');

    /*
        Combs through a directory, finds all valid go-forward SKUs, and creates an object
        for each sku with properties:
            SKU
            productName (i.e. 'Carson', 'Emerson', etc as organized on server)
            skuFolder   (name of the folder specific to the sku)
            files       Array of absolute filenames
        
        All data is pushed to object 'filelist'
    */
    getDirectories(sunglassDir).forEach(function (dir1) {
        if (dir1 !== '_Discontinued') {
            getDirectories(sunglassDir + dir1).forEach(function (dir2) {
                // ignore folders that don't start with the sku we want
                var sku = parseInt(dir2.substring(0, 5), 10);
                if (skus.sunglasses.indexOf(sku) > 0) {
                    // sku folder match, dive in
                    filelist.push({
                        'sku': sku,
                        'productName': dir1,
                        'skuFolder': dir2,
                        'files': walkSync(sunglassDir + dir1 + '/' + dir2 + '/')
                    });
                }
            });
        }
    });

    console.log('Filelist creation complete.');
    console.log('Starting resize...');

    /*
        Resize happens here. 
    */
    filelist.forEach(function (product) {
        console.log('resizing file with sku ' + product.sku);
        
        // this is where the files will be saved
        var dir = './img/' + product.sku + '/' + imageOptions.width + 'x' + imageOptions.height + '/';
        product.files.forEach(function (file) {
            gulp.src(file)
                .pipe(imageResize({
                    width: imageOptions.width,
                    height: imageOptions.height,
                    crop: imageOptions.crop,
                    quality: imageOptions.quality,
                    format: imageOptions.format,
                    gravity: imageOptions.gravity
                }))
                .pipe(gulp.dest(dir));
        });
    });
});

// run the task. This takes a while and will probably take up 100% CPU
gulp.start('default');
