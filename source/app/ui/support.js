import { app, angular } from 'app/app';
import { hex4 } from 'app/lib/support';

// Register hex4 filter
app.filter('hex4', () => hex4);

/**
 * Load file directive.
 */
app.directive('loadFile', ($parse) => {
    return {
        scope: {
            multiple: '@multipleFiles',
            accept: '@acceptFile',
            handler: '&loadFile'
        },
        link: (scope, element, attrs) => {
            var input = angular.element('<input>');
            input.
                attr({
                    type: 'file',
                    style: 'display: none',
                    accept: scope.accept,
                    multiple: typeof scope.multiple !== 'undefined'
                }).
                on('change', (event) => {
                    if (!event.target.files.length) {
                        return;
                    } else if (typeof scope.multiple !== 'undefined') {
                        scope.handler({ files: event.target.files });
                    } else {
                        scope.handler({ file: event.target.files[0] });
                    }
                    scope.$apply();
                });
            element.append(input);
            element.on('click', (event) => input[0].click());
        }
    };
});
