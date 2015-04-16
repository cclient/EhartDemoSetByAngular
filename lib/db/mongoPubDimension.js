var pubDimensionColl = require('./mongo').pubDimensionColl();
var async=require('async');
var getMedia=require('./getMedia.js');


exports.upsertDimension = function (date, pubID, updateObj, callback) {
	pubDimensionColl.update({date: date, pubID: pubID }, {$set: updateObj}, {upsert: true}, callback);
}

exports.getSearchDimension=function(mediaids,datebegin,dateend,columns,callback){
    var query=null;
    console.log('mediaids'+mediaids);
    if(mediaids&&mediaids.length>0){
        query={$and:[{date:{$gte:datebegin,$lte:dateend}},{pubID:{$in:mediaids}}]};
    }
    else{
        query={date:{$gte:datebegin,$lte:dateend}};
    }
    console.log('query search'+JSON.stringify(query));
    pubDimensionColl.find(query,columns).toArray(function(err,arrs){
        if(err) console.log(err);
        callback(err,arrs);});
}

exports.getProvinceTop=function getProvinceTop(provincename,echartlegend,datebegin,dateend,num,done){
    var query={};
    if(datebegin||dateend){
        var date={};
        if(datebegin)  date['$gte']=datebegin;
        if(dateend)  date['$lte']=dateend;
        query['$and']=[date,{province:provincename}];
    }
    if(provincename){
        if(date){
            query['$and']=[{date:date},{province:provincename}];
        }
        else query.province=provincename;
    }
    else{
        if(date){
            query.date=date;
        }

    }
    var province={};
    echartlegend.forEach(function(legenitem){
        province[legenitem]={};
    });
    var cursor= pubDimensionColl.find(query);
    var goNext = true;
    async.whilst(
        function () {
            return goNext;
        },
        function (callback) {
            setTimeout(function(){
                cursor.nextObject(function (err, item) {
                    if(item){
                        echartlegend.forEach(function(valueitem){
                            if(item[valueitem]){
                                province[valueitem][item.pubID]=province[valueitem][item.pubID]||0;
                                province[valueitem][item.pubID]+=item[valueitem];
                            }
                        });
                        callback();
                    }
                    else{
                        goNext=false;
                        callback();
                    }
                })
            },1);
        },
        function (err) {
            echartlegend.forEach(function(legenitem){
                var arr=[];
                for(var pub in province[legenitem]){
                    arr.push({pubID:getMedia.getMediaName(pub),value:province[legenitem][pub]});
                }
                arr.sort(function(x,y){return y.value- x.value})
                if(arr.length>num&&num>0){
                    arr.length=num;
                }
                province[legenitem]=arr;
            });
            done(err,province);
        }
    );
}