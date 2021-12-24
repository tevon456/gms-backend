const fileUpload = require("express-fileupload");

function file() {
  return fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, //2MB max file(s) size
    },
    abortOnLimit: true,
    responseOnLimit: "Maximum file size is 2mb",
    useTempFiles: true,
    tempFileDir: "/tmp/",
  });
}

module.exports = file;
