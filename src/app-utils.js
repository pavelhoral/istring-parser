angular.module('bethparser').

    factory('hex4', function() {
        return function(number) {
            var hex = (+number).toString(16).toUpperCase();
            return '000000'.substring(0, 6 - hex.length) + hex;
        };
    }).

    filter('hex4', function(hex4) {
        return hex4;
    });
