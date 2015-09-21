(function () {
    'use strict';
    angular.module('treeApp', ['ui.tree'])
        .controller('treeCtrl', function ($scope, $http) {
            $scope.load = function (scope) {
                $http({
                    method: 'get',
                    url: '/getmenu'
                }).success(function (data, status) {
                    var arr = [];
                    arr.push(data);
                    $scope.data = arr;
                }).error(function (data, status) {
                    console.log(data);
                    console.log(status);
                });
            };
            $scope.remove = function (scope) {
//                            $scope.currentModel=null;
            };
            $scope._setChartObj = function (currentModel) {
                var commonproperty = ['id', 'title', 'nodes', 'charttype', 'showtype', 'host', 'searchurl', 'maindivDOMHeight', 'maindivDOMWidth', 'maindivDOMId', 'tableDOMWidth', 'tableDOMId', 'groupColumnIndex', 'showDataName', 'showDataValue', 'queryString', 'searchUrl','lengendrange'];
                if (currentModel.charttype) {
                    currentModel[currentModel.charttype] = {};
                    for (var key in currentModel) {
                        if (currentModel.hasOwnProperty(key) && commonproperty.indexOf(key) == -1) {
                            if (key != currentModel.charttype) {
                                currentModel[currentModel.charttype][key] = currentModel[key];
                                currentModel[key] = undefined;
                            }
                        }
                    }
                }
            }
            $scope.edit = function (scope) {
                $scope.currentModel = {};
                angular.extend($scope.currentModel, scope.$modelValue);
                $scope.currentModel.showtype = '模块';
                var subdepth = scope.maxSubDepth();
                var thisdepth = scope.depth();
                if ((thisdepth == 2 && subdepth <= 1) || (thisdepth > 2 && subdepth == 1)) {
                    $scope.currentModel.href = $scope.currentModel.href || '/';
                    $scope.currentModel.showtype = '页面';
                }
                else if (subdepth == 0) {
                    $scope.currentModel.showtype = '图表';
                    $scope.currentModel.host = '';
                    $scope.currentModel.searchurl = '';
                    $scope._setChartObj($scope.currentModel);
                }
            }
            $scope.log = function (scope) {
                console.log($scope.data);
            }
            $scope.save = function (scope) {
                function updateData(inputobj, savaobj) {
                    if (inputobj.id == savaobj.id) {
                        angular.extend(inputobj, savaobj);
                    }
                    else {
                        for (var i = 0; i < inputobj.nodes.length; i++) {
                            updateData(inputobj.nodes[i], savaobj);
                        }
                    }
                }
                if ($scope.currentModel) {
                    if ($scope.currentModel.charttype && $scope.currentModel[$scope.currentModel.charttype]) {
                        angular.extend($scope.currentModel, $scope.currentModel[$scope.currentModel.charttype]);
                        $scope.currentModel[$scope.currentModel.charttype] = undefined;
                    }
                    updateData($scope.data[0], $scope.currentModel);
                    $scope._setChartObj($scope.currentModel);

                }
                console.log(JSON.stringify($scope.data));
            }
            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.moveLastToTheBeginning = function () {
                var a = $scope.data.pop();
                $scope.data.splice(0, 0, a);
            };
            $scope.newSubItem = function (scope) {
                var thisdepth = scope.depth();
                if (thisdepth <= 3) {
                    $scope.currentModel = null;
                    var nodeData = scope.$modelValue;
                    nodeData.nodes.push({
                        id: nodeData.id * 10 + nodeData.nodes.length,
                        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                        nodes: []
                    });
                }
            };
            $scope.collapseAll = function () {
                $scope.$broadcast('collapseAll');
            };
            $scope.expandAll = function () {
                $scope.$broadcast('expandAll');
            };
            $scope.data = [
                {
                    "id": 1,
                    "title": "模块",
                    "nodes": []
                }
            ];
            $scope.update = function () {
                $http({
                    data: {"menu": $scope.data},
                    method: 'post',
                    url: '/updatemenu'
                }).success(function (data, status) {
                    if (data == 'success') {
                        alert('更新成功');
                    }
                    else {
                        alert('更新失败')
                    }
                }).error(function (data, status) {
                    console.log(data);
                    console.log(status);
                    alert('更新失败');
                });
            }
        });
})();

