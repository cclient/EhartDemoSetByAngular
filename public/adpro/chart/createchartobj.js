/**
 * Created by cdpmac on 14/12/17.
 */
(function ChartNameSpace() {
    function getYYYYMMDD(date, spliter) {
        spliter = spliter != undefined ? spliter : '-';
        return date.getFullYear() + spliter
            + ('0' + (date.getMonth() + 1)).slice(-2) + spliter
            + ('0' + date.getDate()).slice(-2);
    };
    function BaseChartObj() {
    };
    BaseChartObj.prototype.bindEvent = function () {
        var self = this;
        if (self.tableDOMId) {
            $('#' + this.tableDOMId + '').on('xhr.dt', function (e, settings, json) {
                self._ajaxComplete(json);
            });
        }
        if (self.otherIni) {
            self.otherIni();
        }
    };
    BaseChartObj.prototype.iniTable = function () {
        var self = this;
        if (!self.tableDOMId) return;
        var orderindex; //media  4 date
        function isOrderByGroupColumns(orderindex) {
            return self.groupColumnIndex && self.groupColumnIndex.indexOf(orderindex) != -1
        }
        var language = {
            "lengthMenu": "每页显示 _MENU_ 行",
            "sZeroRecords": "0条结果",
            "sInfo": "第 _PAGE_ 页 [共 _PAGES_ 页]",
            "sInfoEmpty": "无数据",
            "sSearch": "过滤:",
            "oPaginate": {
                "sFirst": "首页",
                "sLast": "最后",
                "sNext": "下一页",
                "sPrevious": "上一页"
            },
            "sInfoFiltered": "(从 _MAX_ 行中过滤)"
        };
        var columnDefs = self.groupColumnIndex ? [
            { "visible": false, "targets": self.groupColumnIndex[0] }
        ] : [];
        var columns=self.showDataValue.map(function(item){
            return   { "data": item,"defaultContent":'' }
        })
        var order = self.groupColumnIndex ? [
//            [ self.groupColumnIndex[0], 'asc' ],[self.provinceIndex,'asc']
            [ self.groupColumnIndex[0], 'asc' ]
        ] : [];
        self.table = $('#' + self.tableDOMId + '').DataTable({
            "columnDefs": columnDefs,
            "columns":columns,
            "order": order,
            "language": language,
            "displayLength": 25,
            "drawCallback": function (settings) {
                if (self.groupColumnIndex && self.groupColumnIndex.length > 0 && settings.aLastSort.length > 0) {
                    orderindex = settings.aLastSort[0].col;
                    if (orderindex == undefined) {
                        orderindex = self.groupColumnIndex[0];
                    }
                    if (self.table && orderindex == self.groupColumnIndex[0]) {
                        self.table.column(self.groupColumnIndex[0]).visible(false);
                        self.table.column(self.groupColumnIndex[1]).visible(true);
                    }
                    if (self.table && orderindex == self.groupColumnIndex[1]) {
                        self.table.column(self.groupColumnIndex[1]).visible(false);
                        self.table.column(self.groupColumnIndex[0]).visible(true);
                    }
                    if (!isOrderByGroupColumns(orderindex)) {
                        self.table.column(self.groupColumnIndex[1]).visible(true);
                        self.table.column(self.groupColumnIndex[0]).visible(true);
                    }
                    var api = this.api();
                    var rows = api.rows({page: 'current'}).nodes();
                    var last = null;
                    if (isOrderByGroupColumns(orderindex)) {
                        api.column(orderindex, {page: 'current'}).data().each(function (group, i) {
                            if (last !== group) {
                                $(rows).eq(i).before(
                                        '<tr class="group" style="background-color:bisque "><td colspan="9">' + group + '</td></tr>'
                                );
                                last = group;
                            }
                        });
                    }
                }

            }
        });
        // Order by the grouping
        $('#' + self.tableDOMId + ' tbody').on('click', 'tr.group', function () {
            var currentOrder = self.table.order()[0];
            if (currentOrder[0] === orderindex && currentOrder[1] === 'asc') {
                table.order([ orderindex, 'desc' ]).draw();
            }
            else {
                table.order([ orderindex, 'asc' ]).draw();
            }
        });
    };
    BaseChartObj.prototype._ajaxComplete = function (json) {
        var self = this;
        self.jsonData=[];
        if (self.maindivDOMId) {
            if (json && json.data && json.data.length > 0) {
                $('#' + self.maindivDOMId + '').css('display', 'block');
                self.jsonData = json.data || json;
                self.drawCanvas();
            }
        }
        $.Prompt({close:true});
    };
    BaseChartObj.prototype.loadData = function (geturlpar) {
        var self = this;
        self.queryString = geturlpar;
        var linkchar = '?';
        if (self.queryString.indexOf('?') >= 0) {
            linkchar = '&';
        }
        if (self.showDataValue) self.queryString += linkchar + 'columns=' + self.showDataValue;
        linkchar = '&';
        if (self.datebegin) self.queryString += linkchar + 'datebegin=' + self.datebegin;
        if (self.dateend) self.queryString += linkchar + 'dateend=' + self.dateend;
        if (self.tableDOMId)
            self.table.ajax.url(self.searchUrl + self.queryString).load();
        else {
            $.get(self.searchUrl + self.queryString, function (data, status) {
                self._ajaxComplete(data);
            });
        }
    };
    BaseChartObj.prototype.prepareCanvas = function () {
        var self = this;
        if (self._myChart && self._myChart.dispose) {
            self._myChart.dispose();
        }
        if (!self.domMain) {
            self.domMain = document.getElementById(self.maindivDOMId);
        }
        self._myChart = echarts.init(self.domMain);
        window.onresize = self._myChart.resize;
        self._myChart.showLoading();
    };
    BaseChartObj.prototype.iniDom = function (parentdomid) {
        var jqparentdom = $("#" + parentdomid + "");
        var self = this;
        if (self.maindivDOMId) {
            var maindivhtml = '<div class="col-xs-' + self.maindivDOMWidth + '"><div id="' + self.maindivDOMId + '" style="display: none; height: ' + self.maindivDOMHeight + 'px; cursor: default; background-color: rgba(0, 0, 0, 0);"></div></div>';
            jqparentdom.append(maindivhtml);
        }
        if (self.tableDOMId) {
            var tablehtml = '';
            tablehtml += '<div class="col-xs-' + self.tableDOMWidth + '"><table id="' + self.tableDOMId + '" class="display" cellspacing="0" width="100%">';
            var theadhtml = '', tfoothtml = '';
            theadhtml += ' <thead><tr>';
//            tfoothtml+=' <tfoot><tr>';
            for (var i = 0; i < self.showDataName.length; i++) {
                theadhtml += '<th>' + self.showDataName[i] + '</th>';
//                tfoothtml+='<th>'+self.showDataName[i]+'</th>';
            }
//            tfoothtml+='</tr></tfoot>';
            theadhtml += '</tr></thead>';
            tablehtml += theadhtml;
//            tablehtml+=tfoothtml;
            tablehtml += '</table></div>';
            jqparentdom.append(tablehtml);
        }
        if (self.otherDomIni) {
            self.otherDomIni(self.maindivDOMId);
        }
    };

    var PieTimeLineAnlysisPrototype = new BaseChartObj();
    PieTimeLineAnlysisPrototype.drawCanvas = function () {
        var self = this;
        self.prepareCanvas();
        var datebegin = new Date(self.datebegin.getTime());
        self.dateRange = [];
        while (datebegin < self.dateend) {
            self.dateRange.push(getYYYYMMDD(datebegin));
            datebegin.addDays(1);
        }
        var option = {
            timeline: {
                label: {
//                formatter : function(s) {
//                    return s.slice(0, 9);
//                }
                }
            },
            options: [
                {
                    title: {
                        text: self.title,
//                        subtext: '纯属虚构'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
//                    data:['Chrome','Firefox','Safari','IE9+','IE8-']
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {
                                show: true,
                                type: ['pie', 'funnel'],
                                option: {
                                    funnel: {
                                        x: '25%',
                                        width: '50%',
                                        funnelAlign: 'left',
                                        max: 1700
                                    }
                                }
                            },
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    }
                },
            ]
        };
        option.timeline.data = [];
        function getindex(date) {
            for (var i = 0; i < self.jsonData.length; i++) {
                if (self.jsonData[i]['date'] == date) {
                    return i;
                }
            }
            return -1;
        }
        for (var i = 0; i < self.dateRange.length; i++) {
            var date = self.dateRange[i];
            option.timeline.data.push(date);
            var series = [
                {
                    name: '浏览器（数据纯属虚构）',
                    type: 'pie'
                }
            ]
            series[0].data = [];
            var thisdateindex = getindex(date);
            for (var j = self.dataRange[0]; j <= self.dataRange[1]; j++) {
                if (thisdateindex >= 0) {
                    var datedata = self.jsonData[thisdateindex];
                    series[0].data.push({value: datedata[self.showDataValue[j]], name: self.showDataName[j]});
                }
                else
                    series[0].data.push({value: 0, name: self.showDataName[j]});
            }
            option.options[i] = option.options[i] || {};
            option.options[i].series = series;
        }
        option.options[0].legend.data = self.showDataName.slice(self.dataRange[0], self.dataRange[1] + 1);
        self._myChart.hideLoading();
        self._myChart.setOption(option, true);
    };
    function PieTimeLineAnlysis() {
        this.showDataValue = [];
        this.showDataName = [];
        this.dateRange = [];
        this.dataRange = [];
        this.searchUrl = '';
        this.tableDOMId = 'example';
    };
    PieTimeLineAnlysis.prototype = PieTimeLineAnlysisPrototype;

    var ChinaMapAnlysisPrototype = new BaseChartObj();
    ChinaMapAnlysisPrototype.drawCanvas = function () {
        var self = this;
        self.prepareCanvas();
        var echartlegend = self.showDataName.slice(self.lengendRange[0], self.lengendRange[1] + 1);
        var currentLengend = '';
        var curIndx = 0;
        var mapType = [
            'china',
            // 23个省
            '广东', '青海', '四川', '海南', '陕西',
            '甘肃', '云南', '湖南', '湖北', '黑龙江',
            '贵州', '山东', '江西', '河南', '河北',
            '山西', '安徽', '福建', '浙江', '江苏',
            '吉林', '辽宁', '台湾',
            // 5个自治区
            '新疆', '广西', '宁夏', '内蒙古', '西藏',
            // 4个直辖市
            '北京', '天津', '上海', '重庆',
            // 2个特别行政区
            '香港', '澳门'
        ];
        var mapdatacache = {};
        function updateResultDataRange(seriedata) {
            var valuelist = [];
            for (var j = 0; j < seriedata.length; j++) {
                valuelist.push(seriedata[j].value);
            }
            var max = (seriedata.length > 0) ? ( Math.max.apply(Math, valuelist)) : 0;
            var min = (seriedata.length > 0) ? ( Math.min.apply(Math, valuelist)) : 0;
            self.result.dataRange.min = min;
            self.result.dataRange.max = max;
        }
        function Bindmapdata(mapname) {
            if (mapdatacache.hasOwnProperty(mapname)) {
                self.result = mapdatacache[mapname];
                if (currentLengend) {
                    for (var i = 0; i < self.result.series.length; i++) {
                        if (self.result.series[i].name == currentLengend) {
                            updateResultDataRange(self.result.series[i].data);
                            break;
                        }
                    }
                }
                self._myChart.setOption(self.result, true);
            }
            else {
                self.result = {
                    title: {
                        text: '全国34个省市自治区统计数据',
//                        subtext : '（点击切换）'
                    },
                    tooltip: {
                        trigger: 'item'
//            formatter: '{b}'
                    },
                    legend: {
                        selectedMode: 'single',
                        orient: 'vertical',
                        x: 'right'
                    },
                    dataRange: {
                        min: 0,
                        max: 100000,
//                        color:['orange','yellow'],
                        color: ['orangered', 'yellow', 'lightskyblue'],
                        text: ['高', '低'],           // 文本，默认为数值文本
                        calculable: true
                    }
                };
                var lastname = (mapname == 'china' ? '' : '市');
                self.result.legend.data = echartlegend;
                self.result.legend.selected = {};
                self.result.series = [];
                var seriesdata = {};
                for (var j = 0; j < self.jsonData.length; j++) {
                    var item = self.jsonData[j];
                    for (var i = 0; i < echartlegend.length; i++) {
                        var legendname = echartlegend[i];
                        seriesdata[legendname] = seriesdata[legendname] || [];
                        var nameindex = (mapname == 'china' ? self.provinceIndex : self.cityIndex);
                        if (item[self.showDataValue[ i + self.lengendRange[0]]] && (mapname == 'china' || mapname.indexOf(item[self.showDataValue[self.provinceIndex]]) != -1))
                        {
                            var ishas = false;
                            for (var z = 0; z < seriesdata[legendname].length; z++) {
                                if (seriesdata[legendname][z].name == item[self.showDataValue[nameindex]] + lastname) {
                                    seriesdata[legendname][z].value += item[self.showDataValue[i + self.lengendRange[0]]];
                                    ishas = true;
                                }
                            }
                            if (!ishas) {
                                seriesdata[legendname].push({name: item[self.showDataValue[nameindex]] + lastname, value: item[self.showDataValue[i + self.lengendRange[0]]]});
                            }
                        }
                    }
                }
                for (var i = 0; i < echartlegend.length; i++) {
                    var legendname = echartlegend[i];
                    var serie = {
                        name: legendname, type: 'map',
                        mapType: mapname,
                        selectedMode: 'single',
                        itemStyle: {
                            normal: {label: {show: true}},
                            emphasis: {label: {show: true}}
                        }
                    };
                    serie.data = seriesdata[legendname] || [];
                    if (currentLengend && currentLengend == legendname) {
                        self.result.legend.selected[legendname] = true;
                        updateResultDataRange(serie.data);
                    }
                    else {
                        self.result.legend.selected[legendname] = false;
                    }
                    self.result.series.push(serie);
                }
                if (!currentLengend) {
                    self.result.legend.selected[echartlegend[0]] = true;
                    updateResultDataRange(self.result.series[0].data);
                }
                mapdatacache[mapname] = self.result;
                self._myChart.hideLoading();
                self._myChart.setOption(self.result, true);
            }
        }

//      self._myChart.on(ecConfig.EVENT.MAP_SELECTED, function (param){
        self._myChart.on('mapSelected', function (param) {
            var len = mapType.length;
            var mt = mapType[curIndx % len];
            if (mt == 'china') {
                // 全国选择时指定到选中的省份
                var selected = param.selected;
                for (var i in selected) {
                    if (selected[i]) {
                        mt = i;
                        while (len--) {
                            if (mapType[len] == mt) {
                                curIndx = len;
                            }
                        }
                        break;
                    }
                }
            }
            else {
                curIndx = 0;
                mt = 'china';
            }
            if(mt!='china'){
                self.table.column(self.provinceIndex).search(mt).draw();

            }
            else{
                self.table.column(self.provinceIndex).search("").draw();
            }
            Bindmapdata(mt);
        });
        self._myChart.on('legendSelected', function (param) {
            self.result.legend.selected = param.selected;
            for (var legend in param.selected) {
                if (param.selected[legend] === true) {
                    var index = echartlegend.indexOf(legend);
                    var seriedata = self.result.series[index];
                    currentLengend = legend;
                    updateResultDataRange(seriedata.data);
                    break;
                }
            }
            self._myChart.setOption(self.result, true);
        });
        Bindmapdata('china');
    };
    function ChinaMapAnlysis() {
        this.lengendRange = [2, 7];
        this.showDataValue = ['pubID', 'date', 'click', 'ipClick', 'ipPv', 'pv', 'uvClick', 'uvPv', 'province', 'city'];
        this.showDataName = ['媒体名称', '日期', '点击', 'ip点击', 'ip展示', '展示', 'uv点击', 'uv展示', '省', '市'];
        this.provinceIndex = this.showDataValue.length - 2;
        this.cityIndex = this.showDataValue.length - 1;
        this.groupColumnIndex = [0, 1];
        this.searchUrl = '/media/search';
//        this.tableDOMId = 'example';
//        this.maindivDOMId = 'chinamapmain';
    };
    ChinaMapAnlysis.prototype = ChinaMapAnlysisPrototype;

    var XYCompareAnlysisprototype = new BaseChartObj();
    XYCompareAnlysisprototype.drawCanvas = function () {
        var self = this;
        self.prepareCanvas();
        var XValueIndex = self.xIndex;
        var groupIndex = self.objIdIndex;
        var YValueIndex = self.showDataValue.indexOf($('#' + self.compareValueSelectDOMId + '').val());
        var  Xname=self.showDataValue[XValueIndex];

        var Yname=self.showDataValue[YValueIndex];
        var Gname=self.showDataValue[groupIndex];
        var medias = [];
        for (var i = 0; i < self.jsonData.length; i++) {
            medias.push(self.jsonData[i][Gname]);
        }
        medias = $.unique(medias);
        var allmediadata = {};
        for (var i = 0; i < self.jsonData.length; i++) {
//            var medianame = self.jsonData[i][groupIndex];
            var medianame = self.jsonData[i][Gname];
            allmediadata[medianame] = allmediadata[medianame] || {};
            if (self.jsonData[i][Yname]) {
                allmediadata[medianame][self.jsonData[i][Xname]] = allmediadata[medianame][self.jsonData[i][Xname]] || 0;
                allmediadata[medianame][self.jsonData[i][Xname]] += (self.jsonData[i][Yname] || 0);
            }
        }
        self.dateranges = [];
        var datebegin = new Date(self.datebegin.getTime());
        while (datebegin < self.dateend) {
            self.dateranges.push(getYYYYMMDD(datebegin));
            datebegin.addDays(1);
        }
        var option = {
            title: {
                text: self.title
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {},
            toolbox: {
                show: true,
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
//                data : ['周一','周二','周三','周四','周五','周六','周日']
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value}'
                    }
                }
            ],
            series: []
        };
        option.legend.data = medias;
        for (var z = 0; z < option.legend.data.length; z++) {
            var serie = {
                type: 'line',
//            data:[11, 11, 15, 13, 12, 13, 10],
                markPoint: {
                    data: [
                        {type: 'max', name: '最大值'},
                        {type: 'min', name: '最小值'}
                    ]
                },
                markLine: {
                    data: [
                        {type: 'average', name: '平均值'}
                    ]
                }
            };
            serie.name = option.legend.data[z];
            var data = [];
            for (var t = 0; t < self.dateranges.length; t++) {
                var medianame = option.legend.data[z];
                if (allmediadata[medianame][self.dateranges[t]]) {
                    data.push(allmediadata[medianame][self.dateranges[t]]);
                } else   data.push(0);

            }
            serie.data = data;
            option.series.push(serie);
        }
        option.title.text = '';
        option.xAxis[0].data = self.dateranges;
        console.log(JSON.stringify(option));
        self._myChart.hideLoading();
        self._myChart.setOption(option, true)
    };
    XYCompareAnlysisprototype.otherDomIni = function (parentdomid) {
        var self = this;

        if (self.compareValueSelectDOMId) {
//            console.log("#" + parentdomid + "");
//            console.log("#" + parentdomid + "");
            var jqparentdom = $("#" + parentdomid + "");
            var maindivhtml = '<div class="col-xs-12"><lable>比较内容</lable><select id="' + self.compareValueSelectDOMId + '" class="form-control"></select></div>';
            jqparentdom.before(maindivhtml);
        }
    };
    XYCompareAnlysisprototype.otherIni = function () {
        var self = this;
        if (this.compareValueSelectDOMId) {
            var themeSelector = $('#' + this.compareValueSelectDOMId + '');
            if (themeSelector) {
                var optionstring = '';
                for (var i = self.compareRange[0]; i <= self.compareRange[1]; i++) {
                    if (i != 0) {
                        optionstring += '<option  value="' + self.showDataValue[i] + '">' + self.showDataName[i] + '</option>'
                    }
                    else {
                        optionstring += '<option selected="true"   value="' + self.showDataValue[i] + '">' + self.showDataName[i] + '</option>'
                    }
                }
            }
            themeSelector.html(
                optionstring
            );
            $(themeSelector).on('change', function () {
                self.drawCanvas();
            });
        }
    };
    function XYCompareAnlysis() {
        this.showDataValue = ['pubID', 'date', 'click', 'ipClick', 'ipPv', 'pv', 'uvClick', 'uvPv', 'province', 'city'];
        this.showDataName = ['媒体名称', '日期', '点击', 'ip点击', 'ip展示', '展示', 'uv点示', 'uv展示', '省', '市'];
        this.groupColumnIndex = [0, 1];
        this.objIdIndex = 0;
        this.xIndex = 1;
        this.compareRange = [2, 7];
        this.searchUrl = '/media/search';
        this.compareValueSelectDOMId = 'value-select';
        this.searchUrl = '/media/search';
        this.queryString = '';
        this.maindivDOMId = 'xymain';
        this.tableDOMId = 'example';
        this.jsonData = '';
        this.dateranges = [];
    };
    XYCompareAnlysis.prototype = XYCompareAnlysisprototype;

    var PieAnlysisPrototype = new BaseChartObj();
    PieAnlysisPrototype.drawCanvas = function () {
        var self = this;
        self.prepareCanvas();
        var option = {
            title: {
                text: self.title,
//                subtext: '纯属虚构',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left'
//                data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    magicType: {
                        show: true,
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '25%',
                                width: '50%',
                                funnelAlign: 'left',
                                max: 1548
                            }
                        }
                    },
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%']
//                    data:[
//                        {value:335, name:'直接访问'},
                }
            ]
        };
            option.legend.data = self.showDataName.slice(self.dataRange[0], self.dataRange[1] + 1);
        var data = [];
        for (var z = self.dataRange[0]; z <= self.dataRange[1]; z++) {
            data.push({name: self.showDataName[z], value: self.jsonData[0][self.showDataValue[z]]});
        }
        option.series[0].data = data;
        self._myChart.hideLoading();
        this._myChart.setOption(option, true);
    };
    function PieAnlysis() {
        this.showDataValue = [];
        this.showDataName = [];
        this.dataRange = [];
        this.searchUrl = '';
    };
    PieAnlysis.prototype = PieAnlysisPrototype;

    $.createChartObj = function (chartjson) {
        for (var key in chartjson) {
            if (chartjson[key].indexOf && chartjson[key].indexOf('[') > -1) {
                var temarr = eval(chartjson[key]);
                if ($.isArray(temarr)) {
                    console.log(chartjson[key]);
                    chartjson[key] = temarr;
                }
            }
        }
        if (chartjson.charttype == 'pietimeline') {
            var pietimelineobj = new PieTimeLineAnlysis();
            $.extend(pietimelineobj, chartjson);
            return pietimelineobj;
        }
        else if (chartjson.charttype == 'bigmap') {
            var chinamapanlysis = new ChinaMapAnlysis();
            $.extend(chinamapanlysis, chartjson);
            return chinamapanlysis;
        }
        else if (chartjson.charttype == 'xycompare') {
            var xyanlysis = new XYCompareAnlysis();
            $.extend(xyanlysis, chartjson);
            return xyanlysis;
        }
        else if (chartjson.charttype == 'pie') {
            var pieanlysis = new PieAnlysis();
            $.extend(pieanlysis, chartjson);
            return pieanlysis;
        }
    };
//根据QueryString参数名称获取值
    $.getQueryStringByName = function (name) {
        var result = location.search.match(new RegExp("[\\?\\&]" + name + "=([^\\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    };
    $.iniMenu = function (menuid) {
        if (!$.configMenu) {
            $.ajax(
                {
                    url: "/getmenu",
                    async: false,
                    type: "GET",
//                    context: document.body,
                    success: function (data, satus) {
                        var data = data.nodes;
                        $.configMenu = data;
                        var html = '';
                        html += '<li class="active"><a href="/"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a></li>';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].showtype != '页面' && data[i].showtype != '图表') {
                                html += '<li class="treeview"><a href="#"><i class="fa  fa-pencil"></i><span>' + data[i].title + '</span><i class="fa pull-right fa-angle-left"></i></a><ul class="treeview-menu" style="display: none;">'
                                var children = data[i].nodes;
                                for (var j = 0; j < children.length; j++) {
                                    html += '<li><a href="' + children[j].href + '?id=' + children[j].id + '" style="margin-left: 10px;"><i class="fa fa-angle-double-right"></i>' + children[j].title + '</a></li>';
                                }
                                html += '</ul></li>';
                            }
                            else {
                                html += '<li><a href="' + data[i].href + '"><i class="fa fa-dashboard"></i> <span>' + data[i].title + '</span></a></li>';
                            }
                        }
                        $("#" + menuid + "").html(html);
                    }
                }
            );
        }
    };
    $.findChartJsons = function () {
        var id = $.getQueryStringByName('id');
        var jsons = [];
        function findcharts(obj) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].id == id) {
                    jsons.push(obj[i]);
                }
                else {
                    findcharts(obj[i].nodes);
                }
            }
        }
        findcharts($.configMenu);
        return id ? jsons[0].nodes : undefined;
    };
    $.iniMenu("sidebar-menu");
})(window, $)
