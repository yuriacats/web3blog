#!/bin/bash
docker-compose build
docker-compose up -d
docker-compose run integration ./integration.sh
exit_code=$?
docker-compose down
if [ ${exit_code} -ne 0 ]; then
  exit 1
fi
