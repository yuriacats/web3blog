#!/bin/bash
set -ux
backendUsersStatus="$(curl backend:3000/users -o /dev/null -w '%{http_code}\n' -s)"
if [[ "${backendUsersStatus}" -ne 200 ]]; then
  echo "Backend users service is not ready yet. Status code: ${backendUsersStatus}"
  exit 1
fi
