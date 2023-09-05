import angular from 'angular';

// Load dependencies
import 'angular-material';

/**
 * Define global application module.
 */
var app = angular.module('bethparser', [
    'ngMaterial'
]);

/**
 * Loading screen directive.
 */
app.directive('loadingScreen', ($animate, $timeout) => {
    return {
        link: (scope, element) =>  $timeout(() => $animate.addClass(element, 'hidden'))
    };
});

export { app as app, angular as angular };
export default app;
