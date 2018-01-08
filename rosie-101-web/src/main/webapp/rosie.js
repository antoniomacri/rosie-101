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

        patternEditor = ace.edit("pattern-editor");
        patternEditor.getSession().setUseWrapMode(true);

        outputEditor = ace.edit("output-editor");
        outputEditor.getSession().setUseWrapMode(true);
        outputEditor.setOptions({readOnly: true, highlightActiveLine: false, highlightGutterLine: false});
        outputEditor.renderer.$cursorLayer.element.style.display = "none";

        RosieService.createEngine().then(function (response) {
            vm.engineId = response.data;

            inputEditor.getSession().on("change", inputChanged);
            patternEditor.getSession().on("change", patternChanged);
        }).catch(function (reason) {
            outputEditor.setValue(JSON.stringify(reason, null, 2));
        });
    }

    init();


    function inputChanged() {
        vm.input = inputEditor.getValue();

        if (!vm.input) {
            outputEditor.setValue("");
            return;
        }

        matchInput();
    }

    function patternChanged() {
        vm.pattern = patternEditor.getValue();

        if (!vm.pattern) {
            outputEditor.setValue("");
            return;
        }

        compilePattern();
    }

    function matchInput() {
        if (!vm.input || !vm.patternDescriptor) {
            return;
        }

        RosieService.matchInput(vm.engineId, vm.patternDescriptor, vm.input).then(function (response) {
            outputEditor.setValue(JSON.stringify(response.data, null, 2));
        }).catch(function (reason) {
            outputEditor.setValue(JSON.stringify(reason, null, 2));
        });
    }

    function compilePattern() {
        if (!vm.pattern) {
            return;
        }

        RosieService.compilePattern(vm.engineId, vm.pattern).then(function (response) {
            if (response.data.success) {
                vm.patternDescriptor = response.data.patternDescriptor;

                inputChanged();
            }
            else {
                vm.patternDescriptor = null;
                outputEditor.setValue(JSON.stringify(response.data.errors, null, 2));
            }
        }).catch(function (reason) {
            outputEditor.setValue(JSON.stringify(reason, null, 2));
        });
    }
});

