#!/bin/sh
openssl s_client -showcerts -connect {{ logstash_host }}:443 </dev/null 2>/dev/null | sed -n '/^-----BEGIN CERT/,/^-----END CERT/p' > /etc/log_ca.cert