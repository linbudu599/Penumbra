"use strict";
console.log("Loading function ...");
var oss = require("ali-oss").Wrapper;
var fs = require("fs");
var jimp = require("jimp");
module.exports.resize = function (eventBuf, ctx, callback) {
  console.log("Received event:", eventBuf.toString());
  var event = JSON.parse(eventBuf);
  var ossEvent = event.events[0];
  // Required by OSS sdk: OSS region is prefixed with "oss-", e.g. "oss-cn-shanghai"
  var ossRegion = "oss-" + ossEvent.region;
  // Create oss client.
  var client = new oss({
    region: ossRegion,
    // Credentials can be retrieved from context
    accessKeyId: ctx.credentials.accessKeyId,
    accessKeySecret: ctx.credentials.accessKeySecret,
    stsToken: ctx.credentials.securityToken,
  });
  // Bucket name is from OSS event
  client.useBucket(ossEvent.oss.bucket.name);
  // Processed images will be saved to processed/
  var newKey = ossEvent.oss.object.key.replace("source/", "processed/");
  var tmpFile = "/tmp/processed.png";
  // Get object
  console.log("Getting object: ", ossEvent.oss.object.key);
  client
    .get(ossEvent.oss.object.key)
    .then(function (val) {
      // Read object from buffer
      jimp.read(val.content, function (err, image) {
        if (err) {
          console.error("Failed to read image");
          callback(err);
          return;
        }
        // Resize the image and save it to a tmp file
        image.resize(128, 128).write(tmpFile, function (err) {
          if (err) {
            console.error("Failed to write image locally");
            callback(err);
            return;
          }
          // Putting object back to OSS with the new key
          console.log("Putting object: ", newKey);
          client
            .put(newKey, tmpFile)
            .then(function (val) {
              console.log("Put object:", val);
              callback(null, val);
              return;
            })
            .catch(function (err) {
              console.error("Failed to put object: %j", err);
              callback(err);
              return;
            });
        });
      });
    })
    .catch(function (err) {
      console.error("Failed to get object: %j", err);
      callback(err);
      return;
    });
};
