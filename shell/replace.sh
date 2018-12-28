#!/usr/bin/env bash
path="/root/nginx-1.14.2/html/douyu-client"
if [ -d "$path" ]; then
    mv /root/nginx-1.14.2/html/douyu-client /root/nginx-1.14.2/html/douyu-client.`date +%Y%m%d%H%M%S`
fi
\cp -rf /root/.jenkins/workspace/douyu-client /root/nginx-1.14.2/html/
echo "Replace douyu-client Success"