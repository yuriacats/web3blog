#!/bin/bash
set -ux
docker-compose build
docker-compose up -d 
docker-compose exec -T integration ./integration.sh
exit_code=$?
docker-compose down
if [ ${exit_code} -ne 0 ]; then
  exit 1
fi
