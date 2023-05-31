#!/bin/bash
set -ux

URL_STATUS_TEST(){
  local url="$1"
  local backendUsersStatus="$(curl "${url}" -o /dev/null -w '%{http_code}\n' -s)"
if [[ "${backendUsersStatus}" -ne 200 ]]; then
  echo "Backend users service is not ready yet. Status code: ${backendUsersStatus}"
  exit 1
fi
}

URL_GREP_TEST(){
local url="$1"
local target="$2"
URL_STATUS_TEST ${url}
local frontendTest="$(curl "${url}" | grep "${target}")"
if [ $? -ne 0 ]; then
  echo "${url} :page does not have ${target} "
  exit 1
fi
}

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


URL_GREP_TEST "backend:8000/users" "yuria" 
URL_GREP_TEST "backend:8000/posts/8557AF75A904DEEF4E00" "テスト"
URL_STATUS_TEST "backend:8000/posts/855F4E00"
URL_GREP_TEST "frontend:3000" "yuria"
