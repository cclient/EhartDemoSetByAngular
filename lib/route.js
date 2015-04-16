var express = require('express');
var router = express.Router();
var mongoPubDimension = require('./db/mongoPubDimension');
var mongoMenu = require('./db/mongoMenu');
var tool = require('./util/tool');
router.get('/', function (req, res) {
    if (!req.user) {
        res.redirect('/yunoauth2');
    } else {
        console.log(req.user)
        res.render('index.ejs');
    }
});

router.get('/log/realtime', function (req, res) {
    res.render('log/log.ejs');
});

router.get('/log/ipstats', function (req, res) {
    res.render('log/ipstats.ejs');
});

router.get('/logout', function (req, res) {
    res.end('bye')
})



var getMedia = require('./db/getMedia.js');
router.get('/media/mediastats', function (req, res) {
    res.render('media/mediastats.ejs');
});

router.get('/media/ajaxautomedia', function (req, res) {
    res.send(getMedia.getMatchMedia(req.query['input']));
});
router.get('/media/getmediaid', function (req, res) {
    res.send(getMedia.getMediaIds(req.query['names']));
});
router.get('/media/search', function (req, res) {
    console.log('medianames' + req.query['medianames'].split(','));
    var datebegin = req.query['datebegin'];
    var dateend = req.query['dateend'];
    var mediaids = getMedia.getMediaIds(req.query['medianames'].split(','));
    var columns = req.query['columns'].split(',');
    var dateb = new Date(datebegin);
    var datee = new Date(dateend);
    mongoPubDimension.getSearchDimension(mediaids, dateb, datee, columns, function (err, arrs) {
        var obj = {};
        obj.data = [];
        if (!err) {
            for(var i =0;i<arrs.length;i++){
                arrs[i].date=tool.getYYYYMMDD( arrs[i].date);
                arrs[i].pubID=getMedia.getMediaName( arrs[i].pubID);
                arrs[i].click=arrs[i].click||0;
                arrs[i].ipClick=arrs[i].ipClick||0;
                arrs[i].ipPv=arrs[i].ipPv||0;
                arrs[i].pv=arrs[i].pv||0;
                arrs[i].uvClick=arrs[i].uvClick||0;
                arrs[i].uvPv=arrs[i].uvPv||0;
                arrs[i].province=arrs[i].province!= "OTHER" ? arrs[i].province : "未知";
                arrs[i].city=arrs[i].city!= "NA" ? arrs[i].city : "未知";
            }
            obj.data=arrs;
        }
        res.send(obj);
    })
});

router.get('/media/piedata', function (req, res) {
    var columns = req.query['columns'].split(',');
    var obj={};
    columns.forEach(function(item){
        obj[item]=Math.floor(Math.random() * ( 100 + 1));
    })
    res.send({"data":[obj]});
})
router.get('/media/piewithtimelinedata', function (req, res) {
    var datebegin = req.query['datebegin'];
    var dateend = req.query['dateend'];
    var dateb = new Date(datebegin);
    var datee = new Date(dateend);
    var columns = req.query['columns'].split(',');
    var data=[];
    while(dateb<datee){
        var obj={};
        for(var i=0;i<columns.length;i++){
            if(columns[i]=='date'){
            }
            else{
                obj[columns[i]]=Math.floor(Math.random() * ( 100 + 1));
            }
        }
        obj.date=tool.getYYYYMMDD(dateb);
        data.push(obj);
        dateb.setDate(dateb.getDate()+1);
    }
    res.send({"data": data}
    );
})

//省份前10行
//===========
router.get('/media/mediaprovince', function (req, res) {
    res.render('media/mediaprovince.ejs');
})

router.get('/media/provincemediatop', function (req, res) {
    var province = req.query['provincename'];
    var datebegin = req.query['datebegin'];
    var dateend = req.query['dateend'];
    var dateb = new Date(datebegin);
    var datee = new Date(dateend);
    var num = req.query['num'];
    var echartlegend = req.query['echartlegend'].split(',');
    mongoPubDimension.getProvinceTop(province, echartlegend, dateb, datee, num, function (err, province) {
        res.send(province);
    });
})
//===========
//menu
//===========
router.post('/updatemenu', function (req, res) {
    var menustring = req.body['menu'][0];
    mongoMenu.upsertMenu(menustring, function (err, data) {
        console.log(err + data);
        if (err) res.send('error');
        else res.send('success')
    })
});
router.get('/getmenu', function (req, res) {
    mongoMenu.getMenu(function (err, docs) {
        console.log('menua' +err+JSON.stringify(docs));
        if (docs) {
            res.send(docs);
        }
        else {
            res.send('{"_id":1,"id": 1,"title": "模块","nodes":[]}');
        }
    })
})

//===========
module.exports = router;