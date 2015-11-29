import { app, angular } from 'app/app';
import { ModFileMapper } from 'app/lib/modfile.mapper';
import { StringsMapper } from 'app/lib/strings.mapper';



class MainController {

    constructor($scope, $q) {
        this.$scope = $scope;
        this.$q = $q;
        this.mod = null;
        this.strings = {};
        this.loading = 0;
    }

    loadFile(file, handler) {
        var fileReader = new FileReader();
        fileReader.onload = () => {
            try {
                handler(file.name, fileReader.result);
            } catch (error) {
                console.error(error);
            } finally {
                this.loading--;
            }
            this.$scope.$apply();
        };
        this.loading++;
        fileReader.readAsArrayBuffer(file);
    }

    loadFiles(files, handler) {
        for (var index = 0; index < files.length; index++) {
            this.loadFile(files[index], handler);
        }
    }

    loadMod(file) {
        this.loadFile(file, (name, buffer) => {
            this.mod = {
                name: name,
                data: new ModFileMapper().readMod(buffer)
            };
        });
    }

    loadStrings(files) {
        var stringsMapper = new StringsMapper();
        this.loadFiles(files, (name, buffer) => {
            var type = stringsMapper.determineType(name);
            this.strings[type] = stringsMapper.readStrings(buffer, type);
        });
    }

}
app.controller('MainController', MainController);
