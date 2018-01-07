var rosie = angular.module("rosie", ["ngResource", "ngSanitize"]);


(function () {
    "use strict";

    rosie.service("RosieService", RosieService);

    function RosieService($http) {
        var vm = this;


        vm.createEngine = function () {
            return $http.post("/rs/engines", {});
        };

        vm.deleteEngine = function (engineId) {
            return $http.delete("/rs/engines/:engineId", {engineId: engineId});
        };

        vm.getConfiguration = function (engineId) {
            return $http.get("/rs/engines/:engineId", {engineId: engineId});
        };

        vm.compilePattern = function (engineId, pattern) {
            return $http({
                method: "POST",
                url: "/rs/engines/" + encodeURI(engineId) + "/patterns",
                data: pattern,
                headers: {
                    "Content-Type": "text/plain"
                }
            });
        };

        vm.matchInput = function (engineId, patternDescriptor, input) {
            return $http({
                method: "POST",
                url: "/rs/engines/" + encodeURI(engineId) + "/patterns/" + encodeURI(patternDescriptor) + "/match",
                data: input,
                headers: {
                    "Content-Type": "text/plain"
                }
            });
        };
    }
}());


rosie.controller('MainCtrl', function (RosieService) {
    var vm = this;

    var inputEditor;
    var patternEditor;
    var outputEditor;

    function init() {
        inputEditor = ace.edit("input-editor");
        inputEditor.getSession().setUseWrapMode(true);
        inputEditor.getSession().on("change", inputChanged);

        patternEditor = ace.edit("pattern-editor");
        patternEditor.getSession().setUseWrapMode(true);
        patternEditor.getSession().on("change", patternChanged);

        outputEditor = ace.edit("output-editor");
        outputEditor.getSession().setUseWrapMode(true);
        outputEditor.setOptions({readOnly: true, highlightActiveLine: false, highlightGutterLine: false});
        outputEditor.renderer.$cursorLayer.element.style.display = "none";

        RosieService.createEngine().then(function (response) {
            vm.engineId = response.data;
        }).catch(function (e) {
            // TODO: handle error
            console.error(e);
        });
    }

    init();


    function inputChanged() {
        vm.input = inputEditor.getValue();
        if (vm.engineId && vm.patternDescriptor) {
            RosieService.matchInput(vm.engineId, vm.patternDescriptor, vm.input).then(function (response) {
                outputEditor.setValue(JSON.stringify(response.data, null, 2));
            });
        }
    }

    function patternChanged() {
        vm.pattern = patternEditor.getValue();
        if (vm.engineId) {
            RosieService.compilePattern(vm.engineId, vm.pattern).then(function (response) {
                if (response.data.success) {
                    vm.patternDescriptor = response.data.patternDescriptor;
                    RosieService.matchInput(vm.engineId, vm.patternDescriptor, vm.input).then(function (response) {
                        outputEditor.setValue(JSON.stringify(response.data, null, 2));
                    });
                } else {
                    vm.patternDescriptor = null;
                }
            });
        }
    }
});

