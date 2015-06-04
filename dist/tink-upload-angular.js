'use strict';
(function(module) {
  try {
    module = angular.module('tink.upload');
  } catch (e) {
    module = angular.module('tink.upload', ['ngLodash','ngFileUpload','tink.safeApply']);
  }
  module.factory('UploadFile',['$q','tinkUploadService',function($q,tinkUploadService) {
    var upload = null;
        // instantiate our initial object
        var uploudFile = function(data,uploaded) {
          if(!(data instanceof window.File)){
            throw 'uploadFile was no file object!';
          }
          this.fileData = data;
          if(this.fileData){
            this.fileName = this.fileData.name;
            this.fileType = this.fileData.type;
            this.fileSize = this.fileData.size;
          }


          if(uploaded){
            this.progress = 100;
          }else{
            this.progress = 0;
          }
        };


        uploudFile.prototype.getFileName = function() {
          return this.fileName;
        };

        uploudFile.prototype.getData = function() {
          return this.fileData;
        };

        uploudFile.prototype.getProgress = function() {
          return this.progress;
        };

        uploudFile.prototype.getFileSize = function() {
          return this.fileSize;
        };

        uploudFile.prototype.getFileExtension = function() {
          var posLastDot = this.getFileName().lastIndexOf('.');
          return this.getFileName().substring(posLastDot, this.getFileName().length);
        };

        uploudFile.prototype.getFileMimeType = function() {
          return this.fileType;
        };

        uploudFile.prototype.cancel = function(){
          if(upload !== null){
            if(upload.abort){
              upload.abort();
            }
          }
        };


        uploudFile.prototype.upload = function(options){
          var scope = this;
          var promise = $q.defer();
          upload = tinkUploadService.upload(this,options);
          upload.then(
            function success() {
              scope.progress=100;
              promise.resolve(scope);
            },
            function fail(){
              scope.progress=0;
              promise.reject(scope);
            },
            function notify(evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              if(isNaN(progressPercentage)){
                progressPercentage = 0;
              }
              scope.progress = progressPercentage;
              promise.notify({progress:progressPercentage,object:scope});
            });
          return promise.promise;
        };

        uploudFile.prototype.remove = function(){
          tinkUploadService.remove(this);
        };

        return uploudFile;


      }]);
})();;'use strict';
(function(module) {
  try {
    module = angular.module('tink.upload');
  } catch (e) {
    module = angular.module('tink.upload', ['ngLodash','ngFileUpload','tink.safeApply']);
  }
  module.directive('tinkUpload', ['$window', 'safeApply','UploadFile','lodash','tinkUploadService', function($window, safeApply,UploadFile,_,tinkUploadService) {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      templateUrl:'templates/tinkUpload.html',
      scope:{
        ngModel:'=',
        fieldName: '@?',
        multiple: '=?',
        allowedTypes:'=?',
        maxFileSize:'@?',
        url:'@?',
        sendOptions:'=?'
      },
      compile: function() {
        return {
          pre: function() {
          },
          post: function(scope, elem) {

            //if the ngModel is not defined we define it for you
            if(scope.ngModel === undefined){
                scope.ngModel = [];
            }

            //Config object with default values
            var config = {
              multiple: scope.multiple || true,
              removeFromServer: true,
              allowedTypes:{mimeTypes:[],extensions:[]},
              maxFileSize:scope.maxFileSize || '0',
              url: scope.url || undefined,
              options:{}
            };
            //To let the view know we have a message.
            scope.message = {};
            var holding = null;
            //Check the scope variable and change the config variable
            for(var key in config){
              if(scope[key] !== undefined){
                config[key] = scope[key];
              }
            }
            if(config.url){
              tinkUploadService.addUrls(config.url);
            }

            scope.$watchCollection('ngModel',function(newVa){
              var removed = _.difference(scope.files, newVa);
              var added = _.difference(newVa,scope.files);

              angular.forEach(removed,function(value){
                if(value instanceof UploadFile){
                  if(_.indexOf(scope.files, value)!==-1){
                    _.pull(scope.files, value);
                  }
                }
              });

              angular.forEach(added,function(value){
                if(value instanceof UploadFile){
                  if(config.multiple){
                    if(_.indexOf(scope.files, value)===-1){
                      scope.files.unshift(value);
                    }
                  }else{
                    scope.files.length = 0;
                    scope.files.unshift(value);
                  }
                }
              });
              /*if(newVa instanceof Array){
                if(newVa !== ol && newVa.length > ol.length){
                  angular.forEach(newVa,function(value){
                    if(_.indexOf(scope.files, value)===-1){
                      if(value instanceof UploadFile){
                        scope.files.push(value)
                      }else{
                        _.pull(scope.ngModel, value);
                      }
                    }
                  })
                }else if(newVa !== ol && newVa.length < ol.length){
                  angular.forEach(newVa,function(value){
                      if(value instanceof UploadFile){
                        if(_.indexOf(scope.files, value)!==-1){
                           _.pull(scope.files, value);
                        }
                      }
                  })
                }
              }else if(newVa instanceof UploadFile){
                if(_.indexOf(scope.files, newVa)===-1){
                  scope.files = [];
                  scope.files.push(newVa);
                }
              }*/
            },true);

            //function to add the liseners
            function addLisener(){
              elem.bind('dragenter', dragenter);
              elem.bind('dragleave', dragleave);
              elem.bind('dragover', dragover);
              elem.bind('drop', drop);
            }
            //Drag enter to add a class
            function dragenter(e){
              e.stopPropagation();
              e.preventDefault();
              elem.addClass('dragenter');
            }
            //Leave drag area to remove the class
            function dragleave(){
              elem.removeClass('dragenter');
            }

            //Drag over prevent default because we do not need it.
            function dragover(e){
              e.stopPropagation();
              e.preventDefault();
              elem.addClass('dragenter');
            }

            scope.undo = function(){
              if(scope.files[0]){
                scope.files[0].cancel();
                scope.files[0].remove();
                _.pull(scope.ngModel, scope.files[0]);
                //_.pull(scope.files, scope.files[0]);
              }

              holding.hold = false;
              scope.message = {};
              scope.ngModel.length = 0;
              //scope.files.length = 0;
              //scope.files.push(holding);
              scope.ngModel.push(holding);
              holding = null;
            };


            //create internal files object for use to handle the view
              scope.files = [];
            //}

            //The file is droped or selected ! same code !
            function drop(e){
              safeApply(scope,function(){
                elem.removeClass('dragenter');
                var files;
                if(e.type && e.type === 'drop'){
                  e.stopPropagation();
                  e.preventDefault();
                  //get the event
                  var dt = e.originalEvent.dataTransfer;
                   files = dt.files;
                }else{
                  files = e;
                }

                  for (var i = 0; i < files.length; i += 1) {
                    var file = new UploadFile(files[i]);

                    if(!config.multiple){
                      //if there is a file present remove this one from the server !
                      if(scope.files[0] !== null && scope.files[0] instanceof UploadFile){
                        if(!scope.files[0].error){
                          if(holding instanceof UploadFile){
                            holding.cancel();
                            holding.remove();
                            _.pull(scope.ngModel, holding);
                          }
                          scope.message.hold = true;
                          holding = scope.files[0];
                          holding.hold = true;
                        }

                        /*if(config.multiple){
                          scope.ngModel.push(holding);
                        }else{
                          scope.ngModel = holding;
                        }*/
                        //_.pull(scope.files, scope.files[0]);
                      }
                    }
                    if(config.multiple){
                      if(!(scope.ngModel instanceof Array)){
                        scope.ngModel = [];
                      }
                      scope.ngModel.unshift(file);
                    }else{
                      if(scope.ngModel !== null){
                        scope.ngModel.length = 0;
                        scope.ngModel.push(file);
                      }else{
                        scope.ngModel = [];
                        scope.ngModel.push(file);
                      }
                    }

                    //check if the type and size is oke.
                    var typeCheck = checkFileType(file);
                    var sizeCheck = checkFileSize(file);

                    if(typeCheck && sizeCheck){
                      file.upload(scope.sendOptions).then(function() {
                        //file is uploaded
                        //add the uploaded file to the ngModel
                      }, function error(file) {
                          //file is not uploaded
                          if(!file.error){
                            file.error = {};
                          }
                          file.error.fail = true;
                      }, function update() {
                        //Notification of upload
                      });

                    }else{
                      if(!file.error){
                        file.error = {};
                      }
                      if(!typeCheck){
                        file.error.type = true;
                      }
                      if(!sizeCheck){
                        file.error.size = true;
                      }
                    }

                  }

              });
            }

            /*function remove(){

            }*/

            scope.del = function(index){
              scope.files[index].cancel();
              scope.files[index].remove();

              if(config.multiple){
                //_.pull(scope.ngModel, scope.files[index]);
              }else{
                scope.ngModel.length = 0;
              }
                _.pull(scope.ngModel, scope.files[index]);
            };

            function checkFileType(file){

              var mimeType = config.allowedTypes.mimeTypes;
              var extention = config.allowedTypes.extensions;

              var fileType = file.getFileMimeType();
              var fileEx = file.getFileExtension();

              if(!mimeType || mimeType.length === 0 || !_.isArray(mimeType)) {
                  return true;
              }

              if(!extention || extention.length === 0 || !_.isArray(extention)) {
                  return true;
              }

              if(_.indexOf(mimeType, fileType) > -1){
                if(_.indexOf(extention, fileEx) > -1){
                  return true;
                }else{
                  return true;
                }
              }else{
                return false;
              }


            }

            function checkFileSize(file){
              var fileSize = _.parseInt(file.getFileSize());

              if(!config.maxFileSize){
                return true;
              }
              if(typeof config.maxFileSize === 'number'){
                if(config.maxFileSize === 0 || fileSize <= config.maxFileSize){
                  return true;
                }else{
                  return false;
                }
              }else if(typeof config.maxFileSize === 'string'){
                var maxSize = _.parseInt(config.maxFileSize);
                if(maxSize === 0 || fileSize <= maxSize){
                  return true;
                }else{
                  return false;
                }
              }else{
                return true;
              }

            }

            scope.browseFiles = function(){
               var dropzone = elem.find('.fileInput');
                dropzone.click();
            };
            scope.onFileSelect = function(files){
              drop(files);
            };

            addLisener();

          }
        };
      }
    };
  }]);
})();;angular.module('tink.upload').run(['$templateCache', function($templateCache) {
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
