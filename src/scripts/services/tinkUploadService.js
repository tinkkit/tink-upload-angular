'use strict';
(function(module) {
  try {
    module = angular.module('tink.upload');
  } catch (e) {
    module = angular.module('tink.upload', ['ngLodash','angularFileUpload','tink.safeApply']);
  }
  module.provider('tinkUploadService',['lodash', function (_) {
    var urls = {};
    return {
      $get: function ($upload) {
        return {
          upload: function(file,options){
            if(file.getData() instanceof window.File){
              var fileMime = file.getFileMimeType();
              var sendUrl = '';
              if(urls[fileMime]){
                sendUrl = urls[fileMime];
              }else{
                if(!urls.all){
                  //throw 'no All url is set ! in uploadservice';
                  console.log('tinkUploadService don\'t have a url to post the file to');
                }else{
                  sendUrl = urls.all;
                }
              }

              var data = angular.extend({}, {url:sendUrl,file: file.getData()}, options);
              return $upload.upload(data);
            }else{
              throw 'No instanceof uploadfile';
            }
          },
          remove: function(file){
            if(file.getData() instanceof window.File){
              //TODO
            }
          },
          addUrls: function (url,type) {
            if(type === undefined || type === null || type === ''){
              type = 'all';
              urls[type] = url;
            }else{
              if(_.isArray(type)){
                for(var i = 0;i < type.length; i++){
                  urls[type[i]] = url;
                }
              }else if(typeof type === 'string'){
                urls[type] = url;
              }
            }
          }
        };
      }
    };
  }]);
})();