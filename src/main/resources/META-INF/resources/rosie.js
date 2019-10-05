var rosie = angular.module("rosie", ["ngResource", "ngSanitize"]);


(function () {
    "use strict";

    rosie.service("RosieService", RosieService);

    function RosieService($http) {
        var vm = this;

        vm.match = function (input, rpl, pattern, encoder) {
            return $http({
                method: "POST",
                url: "/engines/match",
                data: JSON.stringify({input: input, pattern: pattern, rpl: rpl, encoder: encoder}),
                headers: {
                    "Content-Type": "application/json"
                }
            });
        };

        vm.trace = function (input, rpl, pattern, encoder) {
            return $http({
                method: "POST",
                url: "/engines/trace",
                data: JSON.stringify({input: input, pattern: pattern, rpl: rpl, encoder: encoder}),
                headers: {
                    "Content-Type": "application/json"
                }
            });
        };
    }
}());


rosie.controller('MainCtrl', function (RosieService) {
        var vm = this;

        var inputEditor;
        var rplEditor;
        var patternEditor;
        var outputEditor;

        function init() {
            vm.encoders = [
                {name: "json", label: "JSON"},
                {name: "color", label: "Color"},
                {name: "line", label: "Line"},
                {name: "bool", label: "Boolean"}
            ];

            inputEditor = ace.edit("input-editor");
            inputEditor.getSession().setUseWrapMode(true);
            inputEditor.getSession().on('change', function () {
                localStorage.setItem("inputEditor", inputEditor.getValue());
            });
            if (localStorage.getItem("inputEditor")) {
                inputEditor.setValue(localStorage.getItem("inputEditor"));
                inputEditor.focus();
                inputEditor.gotoLine(0, 0, true);
                inputEditor.renderer.scrollToRow(0);
            }

            rplEditor = ace.edit("rpl-editor");
            rplEditor.getSession().setUseWrapMode(true);
            rplEditor.getSession().on('change', function () {
                localStorage.setItem("rplEditor", rplEditor.getValue());
            });
            if (localStorage.getItem("rplEditor")) {
                rplEditor.setValue(localStorage.getItem("rplEditor"));
                rplEditor.focus();
                rplEditor.gotoLine(0, 0, true);
                rplEditor.renderer.scrollToRow(0);
            }

            patternEditor = ace.edit("pattern-editor");
            patternEditor.getSession().setUseWrapMode(true);
            patternEditor.getSession().on('change', function () {
                localStorage.setItem("patternEditor", patternEditor.getValue());
            });
            if (localStorage.getItem("patternEditor")) {
                patternEditor.setValue(localStorage.getItem("patternEditor"));
                patternEditor.focus();
                patternEditor.gotoLine(0, 0, true);
                patternEditor.renderer.scrollToRow(0);
            }

            outputEditor = ace.edit("output-editor");
            outputEditor.getSession().setUseWrapMode(true);
            outputEditor.setOptions({readOnly: true, highlightActiveLine: false, highlightGutterLine: false});
            outputEditor.renderer.$cursorLayer.element.style.display = "none";
        }

        init();


        vm.match = function () {
            vm.rpl = rplEditor.getValue();

            vm.pattern = patternEditor.getValue();
            if (!vm.pattern) {
                outputEditor.setValue("No pattern specified.");
                return;
            }

            vm.input = inputEditor.getValue();

            RosieService.match(vm.input, vm.rpl, vm.pattern, vm.encoder)
                .then(function (response) {
                    handleMatchSuccess(response.data);
                })
                .catch(function (reason) {
                    handleError(reason);
                });
        };

        vm.trace = function () {
            vm.rpl = rplEditor.getValue();
            if (!vm.rpl) {
                outputEditor.setValue("No RPL specified.");
                return;
            }

            vm.pattern = patternEditor.getValue();
            if (!vm.pattern) {
                outputEditor.setValue("No pattern specified.");
                return;
            }

            vm.input = inputEditor.getValue();

            RosieService.trace(vm.input, vm.rpl, vm.pattern, vm.encoder)
                .then(function (response) {
                    handleTraceSuccess(response.data);
                })
                .catch(function (reason) {
                    handleError(reason);
                });
        };

        function handleMatchSuccess(data) {
            if (data.success) {
                outputEditor.setValue(JSON.stringify(data.match, null, 2), 1);
            } else {
                outputEditor.setValue(JSON.stringify(data.errors, null, 2), 1);
                $("#output-plain").text(data.errors[0].formatted)
            }
        }

        function handleTraceSuccess(data) {
            outputEditor.setValue("Matched: " + !!data.matched + "\n\n" + data.trace, 1);
        }

        function handleError(reason) {
            outputEditor.setValue(JSON.stringify(reason, null, 2), 1);
        }
    }
);
