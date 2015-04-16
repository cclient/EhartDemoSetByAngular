var fs = require('fs'),
    allMediaInfo=[];

console.info('Loading City DB...');

var data = fs.readFileSync(__dirname + '/adpro_account.tsv');
var lines = (data + '').split('\n');
lines.forEach(function (line) {
    if(line){
        allMediaInfo.push(line.split(' '));
    }
})

//前端控件的API，现无沅操作id 元素，因此先写为后端转换
exports.getMatchMedia=function(input){
    var matchmedianame=[];
    allMediaInfo.forEach(function(item){
        if(item[2].indexOf(input)==0){
            matchmedianame.push(item[2]);
        }
    })
    console.log(matchmedianame);
    return matchmedianame;
}

exports.getMediaName=function(mediaId){
    for(var i =0;i<allMediaInfo.length;i++){
        var mediainfo=allMediaInfo[i];
        if(mediainfo[0]==mediaId) {
            return mediainfo[2];
        }
    }
}

exports.getMediaIds=function(medianames){
    var mediaids=[];
    medianames.forEach(function(inputname){
        if(inputname){
            console.log('input medianame'+inputname);
            allMediaInfo.forEach(function(mediainfo){
                if(mediainfo[2]==inputname){
                    mediaids.push(mediainfo[0]);
                }
            });
        }
    });
    console.log('MEDIAS '+mediaids);
    return mediaids;
}

