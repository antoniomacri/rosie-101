var rosie = angular.module("rosie", ["ngResource", "ngSanitize"]);


(function () {
    "use strict";

    rosie.service("RosieService", RosieService);

    function RosieService($http) {
        var vm = this;

        vm.match = function (input, rpl, pattern) {
            return $http({
                method: "POST",
                url: "/rs/engines/match",
                data: JSON.stringify({input: input, pattern: pattern, rpl: rpl}),
                headers: {
                    "Content-Type": "application/json"
                }
            });
        };

        vm.trace = function (input, rpl, pattern) {
            return $http({
                method: "POST",
                url: "/rs/engines/trace",
                data: JSON.stringify({input: input, pattern: pattern, rpl: rpl}),
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
            inputEditor = ace.edit("input-editor");
            inputEditor.getSession().setUseWrapMode(true);

            rplEditor = ace.edit("rpl-editor");
            rplEditor.getSession().setUseWrapMode(true);

            patternEditor = ace.edit("pattern-editor");
            patternEditor.getSession().setUseWrapMode(true);

            outputEditor = ace.edit("output-editor");
            outputEditor.getSession().setUseWrapMode(true);
            outputEditor.setOptions({readOnly: true, highlightActiveLine: false, highlightGutterLine: false});
            outputEditor.renderer.$cursorLayer.element.style.display = "none";
        }

        init();


        vm.match = function () {
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

            RosieService.match(vm.input, vm.rpl, vm.pattern)
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

            RosieService.trace(vm.input, vm.rpl, vm.pattern)
                .then(function (response) {
                    handleTraceSuccess(response.data);
                })
                .catch(function (reason) {
                    handleError(reason);
                });
        };

        function handleMatchSuccess(data) {
            if (data.success) {
                outputEditor.setValue(JSON.stringify(data.match, null, 2));
            } else {
                outputEditor.setValue(JSON.stringify(data.errors, null, 2));
            }
        }

        function handleTraceSuccess(data) {
            outputEditor.setValue("Matched: " + !!data.matched + "\n\n" + data.trace);
        }

        function handleError(reason) {
            outputEditor.setValue(JSON.stringify(reason, null, 2));
        }
    }
);

