# Tink upload Angular directive

v1.1.1

## What is this repository for?

The Tink Angular upload provides you with a drag-and-drop upload component.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

  `bower install tink-upload-angular --save`

2. Add the following files to your project:

  `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

  `<script src="bower_components/tink-upload-angular/dist/tink-upload-angular.js"></script>`


----------


## How to use

### tink-upload

### Component

###### HTML code: ######

```html
<div type="file" data-multiple="true" data-allowed-types="valid" tink-upload="" ng-model="files">
  Only images are allowed
</div>
```

To upload the file to your server you can use the upload service we made. For the moment it only supports uploading.

```javascript
// To set the url where the file need to upload to use the 'tinkUploadService' provider
tinkUploadService.addUrls('http://localhost:3000/upload');
```

If you want to change the upload service just override our service.

```javascript
// The provider
.provider('tinkUploadService', [function() {
  return {
    $get: function() {
      return {
        upload: function(file, options) {
          // This function will be called when the file is going to update
        },
        remove: function(file) {
          // This function will be called when you remove the file
        }
      };
    }
  };
}]);
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-max-file-size | `string` | `''` | If empty no max size allowed, file size is in kb.
data-allowed-types | `object` | `{}` | If empty object all files are allowed, if you want to restrict use this object and add mimetypes and extensions. `{mimeTypes:[],extensions:[]}`
data-multiple | `string | boolean` | `true` | If multiple files are allowed or not.

#### API options

We use a wrapper for `the window.File` object and these are the options:

```javascript
// Create the upload file
var file = UploadFile(fileData);

// If the file was uploaded already
var file = UploadFile(fileData, true);

// Get the original file data
file.getData();

// Get the fileName
file.getFileName();

// Progress of the upload
file.getProgress();

// Get the file size
file.getFileSize();

// Get the file extension
file.getFileExtension();

// Get the file mimetype
file.getFileMimeType();

// Cancel the upload
file.cancel();

// Upload the file
file.upload();

// Remove the file
file.remove();
```

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
