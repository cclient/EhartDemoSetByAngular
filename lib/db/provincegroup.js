/**
 * Created by cdpmac on 14/12/11.
 */

var pubDimensionColl = require('./mongo').pubDimensionColl();
var async=require('async');
function getProvinceTop(provincename,echartlegend,datebegin,dateend){
    var query={};
    if(datebegin||dateend){
        var date={};
        if(datebegin)  date['$gte']=datebegin;
        if(dateend)  date['$lte']=datebegin;
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
    console.log(JSON.stringify(query));


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
            console.log('end'+JSON.stringify(province));
            echartlegend.forEach(function(legenitem){
                var arr=[];
                for(var pub in province[legenitem]){
                    arr.push({pubID:pub,value:province[legenitem][pub]});
                }
                arr.sort(function(x,y){return y.value- x.value});
                province[legenitem]=arr;
            });
        }
    );
}

getProvinceTop('北京',['ipPv','uvPv']);

function groupProvince(item,echartlegend,provinceinfos,done){
    var cursor=   pubDimensionColl.find({province:item});
    var insertProvinceObj={
        province:item
    };
    echartlegend.forEach(function(item){
        insertProvinceObj[item]=0;
    });
    var goNext = true;
    async.whilst(
        function () {
            return goNext;
        },

        function (callback) {
            setTimeout(function(){
                cursor.nextObject(function (err, item) {
                    if(item){
                        echartlegend.forEach(function(colm){
                            if(item[colm]){
                                insertProvinceObj[colm]+=item[colm];
                            }
                        });
                        callback();
                    }
                    else{
                        goNext=false;
                        callback();
                    }
                })
            },2);
        },
        function (err) {
            console.log(insertProvinceObj);
            provinceinfos.push(insertProvinceObj);
            done&&done();
        }
    );
}
exports.groupProvince=groupProvince;

exports.getAllProvince=function(needcolum,datebegin,dateend,calldone){

    pubDimensionColl.distinct('province',function(err,provincenames){
        var echartlegend=['click','ipClick','ipPv','pv','uvClick','uvPv'];
        var provinceinfos=[];
        async.series({
            getAllProvinceInfos: function(callback){
                var i=provincenames.length;
                async.whilst(
                    function () {
                        i--;
                        return i>=0;
                    },
                    function (done) {
                        console.log(i);
                        groupProvince(provincenames[i],echartlegend,provinceinfos,done);
                    },
                    function (err) {
                        callback();
                    }
                );
            }
        }, function (err) {
            calldone(err,provinceinfos);
        })
    });
}

function groupCity(city,provincename,echartlegend,citys,done){
    var  cursor=pubDimensionColl.find({province:provincename,city:city});
    var insertCityObj={
        city:city,
        province:provincename
    };
    echartlegend.forEach(function(colu){
        insertCityObj[colu]=0;
    });
    var goNext = true;
    async.whilst(
        function () {
            return goNext;
        },
        function (callback) {
            setTimeout(function(){
                cursor.nextObject(function (err, item) {
                    if(item){
                        echartlegend.forEach(function(colm){
                            if(item[colm]){
                                insertCityObj[colm]+=item[colm];
                            }
                        });
                        callback();
                    }
                    else{
                        goNext=false;
                        callback();
                    }
                })
            },3);
        },
        function (err) {
            citys.push(insertCityObj);
            console.log(citys);
            done&&done();
//                    }
        }
    );
}
exports.getProvinceCity=function(needcolum,provincename,datebegin,dateend,calldone){
    pubDimensionColl.distinct('city',{province:provincename},function(err,citynames){
        console.log(citynames);
        var echartlegend=['click','ipClick','ipPv','pv','uvClick','uvPv'];
        var cityinfos=[];
        async.series({
            getProvinceCityInfos: function(callback){
                var i=citynames.length;
                async.whilst(
                    function () {
                        i--;
                        return i>=0;
                    },
                    function (done) {
                        console.log('city'+citynames[i]);
                        groupCity(citynames[i],provincename,echartlegend,cityinfos,done);
                    },
                    function (err) {
                        callback();
                    }
                );
            }
        }, function (err) {
            console.log('end'+cityinfos);
            calldone(err,cityinfos);
        })
    });
}

exports.getAllProvinceDimension=function(needcolum,datebegin,dateend,callback){
    needcolum.push('province');
    pubDimensionColl.find({},needcolum)
        .limit(20).toArray(function(err,arrs){
            callback(err,arrs);
        });
}

exports.getCityDimension=function(needcolum,provincename,datebegin,dateend,callback){
    needcolum.push('city');
    pubDimensionColl.find({province:provincename,date:datebegin},needcolum)
        .limit(20).toArray(function(err,arrs){
            callback(err,arrs);
        });
}


