#!/bin/bash
# This script should not be run in CircleCI. Instead, it utilizes a docker image for mongodb.
if [ "$CI" == "" ];then
  pkill -x mongod > /dev/null
  rm -rf test/tmp/mongodb
else
  echo "[close-mongodb.sh] In CI envinroment, this script does nothing because mongodb is already launched at an external image."
fi