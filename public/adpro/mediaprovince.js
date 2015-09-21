/**
 * Created by cuidapeng on 14-12-3.
 */
var echarts;


function CreateObj() {
    this.showDataValue = ['ipPv', 'uvPv'];
    this.showDataName = ['ip展示', 'uv展示'];
    this.topnum = 20;
    this.maindivDOMId = 'main' ;
    this.datebegin;
    this.dateend;
    this.topDivParentId = 'divtopten' ;
    this.serachUrl = '/media/provincemediatop';
    this.queryString = '';
}
CreateObj.prototype = {
    drawCanvas: function () {
        var self = this;
        if (!self.domMain) {
            self.domMain = document.getElementById(self.maindivDOMId);
        }
        self._myChart = echarts.init(self.domMain);
        window.onresize = self._myChart.resize;
        function Bindmapdata(mapname) {
            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
                },
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    x: 'right',
                    y: 'center',
                    feature: {
                        mark: {show: true},
                        dataView: {show: true, readOnly: false},
                        restore: {show: true},
                        saveAsImage: {show: true}
                    }
                },
                roamController: {
                    show: true,
                    x: 'right',
                    mapTypeControl: {
                        'china': true
                    }
                },
                series: [
                    {
                        name: '中国',
                        type: 'map',
                        mapType: 'china',
//                        selectedMode : 'multiple',
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {label: {show: true}},
                            emphasis: {label: {show: true}}
                        },
                        data: [
                            {name: '广东', selected: false}
                        ]
                    }
                ]
            };
            option.series[0].mapType = mapname;
            self._myChart.setOption(option, true);
        }

        self._myChart.on('mapSelected', function (param) {
            self.getDataRange();
            var provincename = '';
            var mt;
            var selected = param.selected;
            for (var i in selected) {
                if (selected[i]) {
                    mt = i;
                    break;
                }
            }
            self.queryString = '?num=' + self.topnum + '&provincename=' + mt + '&datebegin=' + self.datebegin + '&dateend=' + self.dateend + '&echartlegend=' + self.showDataValue;
            $.get(self.serachUrl + self.queryString, function (data, status) {
                    var html = '<div style="width:100%;text-align:center">' + mt + ' 数据top ' + self.topnum + '</div>';
                    for (var i = 0; i < self.showDataValue.length; i++) {
                        var datatype = self.showDataValue[i];
                        html += '<div style="display:inline-block">' + self.showDataName[i] + '<ol>';
                        for (var j = 0; j < data[datatype].length; j++) {
                            html += '<li>' + data[datatype][j].pubID + ' ' + data[datatype][j].value + '</li>';
                        }
                        html += '</ol></div>'
                    }
                    $('#' + self.topDivParentId + '').html(html);
                }
            );
        });
        Bindmapdata('china');
    },
    getDataRange: function () {
        var self = this;
        var alldate = $('#datepicker-calendar').DatePickerGetDate();
        self.databegin = alldate[0][0];
        self.dateend = alldate[0][1];
    }
};

var queryobj = new CreateObj();
//queryobj.setDataRange();
queryobj.drawCanvas();