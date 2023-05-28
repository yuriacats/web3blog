#!/bin/bash
set -ux
count=0
until mysqladmin ping -ptoor -h db ; do
  count=$((count+1))
  sleep 3
  echo "count: ${count}"
  if [ ${count} -eq 20 ]; then
    echo "connection timed out"
    exit 1
  fi
done
mysql -h db -P 3306 -u backend -ptoor -e "select * from author " webblog

backendUsersStatus="$(curl backend:3000/users -o /dev/null -w '%{http_code}\n' -s)"
if [[ "${backendUsersStatus}" -ne 200 ]]; then
  echo "Backend users service is not ready yet. Status code: ${backendUsersStatus}"
  exit 1
fi
