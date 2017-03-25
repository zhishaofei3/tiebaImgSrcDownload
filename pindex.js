"use strict";
var cheerio = require('cheerio');
//var superagent = require('superagent');
var request = require('request');
var fs = require('fs-extra');
var url = require('url');

var keywords = '美女';
var tiebaURL = 'http://tieba.baidu.com/f?ie=utf-8&fr=search&red_tag=3250217220&kw=' + encodeURIComponent(keywords);
var outputHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Title</title></head><body>${container}</body></html>';
var outputFileName = 'meinv.html';

getTieba(tiebaURL);
function getTieba(tiebaURL) {
    request(tiebaURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
//            var imgHTML = '';

            var singleURLArr = [];
            $('.j_th_tit a').each(function (i, n) {
                var url = $(n).attr('href');
                if(url == '#') {
                    return;
                }

                var singleURL = 'http://tieba.baidu.com' + url;
                singleURLArr.push(singleURL);
            });

            console.log("共" + singleURLArr.length + "个主题帖");

            var singlePageIndex = 0;
            var imgHTML = '';

            var getPageArr = function (singlePageIndex) {
                console.log('第' + singlePageIndex + '个主题帖开始');
                var singleURL = singleURLArr[singlePageIndex];
                getSingleTotalPage(singleURL, function (totalPage) {
                    var sIndex = 1;
                    var arr = [];
                    for (sIndex; sIndex <= totalPage; sIndex++) {
                        var callbackCount = 0;
                        console.log("第" + singlePageIndex + '个主题帖开始，共有' + totalPage + '页，正读取' + sIndex + '页 ' + singleURLArr[singlePageIndex]);
                        arr.push(singleURL + "?pn=" + sIndex);
                    }

                    var sOK = function (singlePageImgHTML, index) {
                        imgHTML += singlePageImgHTML;
                    }

                    let res = Promise.resolve();
                    arr.forEach(function (url, index) {
                        res = res.then(function () {
                            console.log('第' + (index + 1) + '页读取完毕');
                            if(index == (arr.length - 1)) {
                                singleOK(imgHTML);
                            }
                            return savePageImg(url).then(sOK.apply[null, index]);
                        })
                    });



//                    savePageImg(singleURL, sIndex, function (singlePageImgHTML) {
//                        callbackCount++;
//
//                        console.log(callbackCount);
//                        if (callbackCount == totalPage) {
//                            console.log('第' + singlePageIndex + '个主题帖结束');
//
//                        }
//                    });
                });
            }

            getPageArr(0);

            var singleOK = function() {
                singlePageIndex++;
                if (singlePageIndex == singleURLArr.length) {
                    console.log('全部抓取结束了');
                    outputHTML = outputHTML.replace("${container}", imgHTML);
                    fs.outputFile(outputFileName, outputHTML, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('保存结束');
                    });
                } else {
                    getPageArr(singlePageIndex);
                }
            }
        }
    });
}

function getSingleTotalPage(singleURL, callback) {
    request(singleURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var imgHTML = '';
            var lastHref = $('.pb_footer .pb_list_pager a').last().attr('href');
            var totalPage = 1;
            if (lastHref) {
                totalPage = getSingleTieTotalPage(lastHref);
            }
            callback(totalPage);
        }
    });

    function getSingleTieTotalPage(lastHref) {
        var urlObj = url.parse(lastHref, true);
        var totalPage = urlObj.query.pn;
        return totalPage;
    }
}

function savePageImg(singleURL) {
    console.log('请求地址 ' + singleURL);
    return new Promise(function (resolve, reject) {
        request(singleURL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var imgHTML = '';

                $('.BDE_Image').each(function (i, n) {
                    var imgSrc = $(n).attr('src');
                    if (imgSrc.indexOf('imgsrc.baidu.com') != -1) {
                        imgHTML += '<img src="' + imgSrc + '">';
                    }
                });
//                console.log(imgHTML);
                resolve(imgHTML);
            } else {
                reject(error);
            }
        })
    });
}

