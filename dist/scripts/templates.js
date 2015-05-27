angular.module('tink.upload').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/tinkUpload.html',
    "<div class=upload> <div class=upload-zone> <div> <strong translate>Sleep hier een bestand</strong> <span translate>of klik om te bladeren</span>\n" +
    "<input class=upload-file-input name={{fieldName}} type=file ngf-select ngf-change=onFileSelect($files) ngf-multiple=multiple>  </div> <span class=help-block data-ng-transclude>Toegelaten bestanden: jpg, gif, png, pdf. Maximum grootte: 2MB</span> </div> <p class=upload-file-change data-ng-if=message.hold>De vorige file werd vervangen. <a data-ng-mouseup=undo($event)>Ongedaan maken.</a></p> <ul class=upload-files> <li data-ng-repeat=\"file in files\" data-ng-class=\"{'success': !file.error && file.getProgress() === 100, 'error': file.error}\"> <span class=upload-filename>{{file.getFileName()}}</span>\n" +
    "<span class=upload-fileoptions> <button class=upload-btn-delete data-ng-click=del($index) data-ng-if=\"file.getProgress() === 100 || file.error\"><span class=sr-only>Verwijder</span></button>\n" +
    "<span class=upload-feedback data-ng-if=\"!file.error && file.getProgress() !== 100\">{{file.getProgress()}}%</span> </span>\n" +
    "<span class=upload-error data-ng-if=file.error> <span data-ng-if=file.error.type>Dit bestandstype is niet toegelaten.</span>\n" +
    "<span data-ng-if=file.error.size>Dit bestand overschrijdt de toegelaten bestandsgrootte.</span>\n" +
    "<span data-ng-if=\"!file.error.type && !file.error.size\">Er is een fout opgetreden bij het uploaden. Probeer het opnieuw.</span> </span>\n" +
    "<span class=upload-progress style=\"width: {{file.getProgress()}}%\"></span> </li> </ul> </div>"
  );

}]);
