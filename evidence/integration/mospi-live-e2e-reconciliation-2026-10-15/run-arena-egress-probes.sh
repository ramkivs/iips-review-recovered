#!/usr/bin/env bash
# MoSPI live E2E — Arena egress / route probe script (READ-ONLY, no credentials).
#
# Purpose : re-establish, inside the Arena execution environment, (a) whether the
#           documented MoSPI public hosts are reachable, (b) whether the private
#           NAS server address advertised by the official NAS OpenAPI spec is
#           reachable, and (c) what the IRR `/api/macro/*` route answers.
# Scope   : investigation only. No application code, configuration, credential,
#           endpoint selection or governance record is touched by this script.
# Evidence: every command below was executed on 2026-10-15 (UTC) in the Arena
#           sandbox recorded in the transcript header.
#
# Usage: bash run-arena-egress-probes.sh
set -u

APP_PORT="${EXEC_TRANSPORT_PORT:-8799}"
CPI_DOC_URL='https://api.mospi.gov.in/api/cpi/getCPIIndex?base_year=2012&series=Current&state_code=99&Format=JSON&page=1'
IIP_DOC_URL='https://api.mospi.gov.in/api/iip/getIIPMonthly?base_year=2011-12&type=General&Format=JSON&page=1'
IIP_APP_URL='https://api.mospi.gov.in/api/iip/getIipData?base_year=2022-23&frequency=Annually&type=Sectoral&category_code=2&subcategory_code=022011-1210&Format=JSON&limit=1&page=1'
NAS_PUBLIC_URL='https://api.mospi.gov.in/api/nas/getNASData?base_year=2022-23&series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&limit=1&page=1'
NAS_PRIVATE_URL='http://10.24.89.9:5000/api/nas/getNASData?series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&page=1'
SWAGGER_NAS_URL='https://api.mospi.gov.in/layout/swagger_user_nas.yaml'

echo "############ 0. ENVIRONMENT ############"
echo "date(UTC)            : $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "E2B_SANDBOX          : ${E2B_SANDBOX:-<unset>}"
echo "E2B_SANDBOX_ID       : ${E2B_SANDBOX_ID:-<unset>}"
echo "E2B_TEMPLATE_ID      : ${E2B_TEMPLATE_ID:-<unset>}"
echo "node                 : $(node --version)"
echo "curl                 : $(curl --version | head -1)"
echo "http_proxy/https_proxy env : ${http_proxy:-<unset>} / ${https_proxy:-<unset>}"
echo "NODE_EXTRA_CA_CERTS  : ${NODE_EXTRA_CA_CERTS:-<unset>}"
echo "resolv.conf          : $(tr '\n' ' ' < /etc/resolv.conf)"
echo "default route        : $(ip route | head -1)"
echo

echo "############ 1. DNS (resolution is NOT the failure layer) ############"
getent hosts api.mospi.gov.in || echo "api.mospi.gov.in: no result"
getent hosts www.mospi.gov.in || echo "www.mospi.gov.in: no result"
echo

echo "############ 2. CONTROL HOST (allowlisted egress works) ############"
curl -s -o /dev/null -w 'curl  https://github.com/            -> exit=%{exitcode} http=%{http_code} remote=%{remote_ip} total=%{time_total}\n' --connect-timeout 5 --max-time 15 https://github.com/
curl -s -o /dev/null -w 'curl  https://registry.npmjs.org/     -> exit=%{exitcode} http=%{http_code} remote=%{remote_ip} total=%{time_total}\n' --connect-timeout 5 --max-time 15 https://registry.npmjs.org/
echo "--- interception evidence: who issued the certificate for an ALLOWED host ---"
curl -sv -o /dev/null --max-time 10 https://github.com/ 2>&1 | grep -i -E "^\*  subject:|^\*  issuer:|SSL certificate verify" | head -4
echo

echo "############ 3. DOCUMENTED CPI ENDPOINT (exact Windows-tested request) ############"
echo "URL: ${CPI_DOC_URL}"
curl -sv -o /tmp/cpi.out -w '\ncurl -> exit=%{exitcode} http=%{http_code} ct=%{content_type} remote=%{remote_ip} connect=%{time_connect} total=%{time_total} size=%{size_download}\n' \
  --connect-timeout 8 --max-time 20 "$CPI_DOC_URL" 2>&1 | grep -E "Trying|Connected|SSL_connect|Empty reply|curl: \(|curl ->|HTTP/" | head -10
echo "bytes received: $([ -f /tmp/cpi.out ] && wc -c < /tmp/cpi.out || echo 0)"
echo

echo "############ 4. DOCUMENTED IIP MONTHLY ENDPOINT (exact Windows-tested request) ############"
echo "URL: ${IIP_DOC_URL}"
curl -sv -o /tmp/iip.out -w '\ncurl -> exit=%{exitcode} http=%{http_code} ct=%{content_type} remote=%{remote_ip} total=%{time_total} size=%{size_download}\n' \
  --connect-timeout 8 --max-time 20 "$IIP_DOC_URL" 2>&1 | grep -E "Trying|Connected|SSL_connect|curl: \(|curl ->|HTTP/" | head -10
echo "bytes received: $([ -f /tmp/iip.out ] && wc -c < /tmp/iip.out || echo 0)"
echo

echo "############ 5. IIP ROUTE THE APPLICATION ACTUALLY CALLS ############"
echo "URL: ${IIP_APP_URL}"
curl -s -o /dev/null -w 'curl -> exit=%{exitcode} http=%{http_code} size=%{size_download} total=%{time_total}\n' --connect-timeout 8 --max-time 20 "$IIP_APP_URL"
echo

echo "############ 6. NAS — PUBLIC HOST ROUTE THE APPLICATION ACTUALLY CALLS ############"
echo "URL: ${NAS_PUBLIC_URL}"
curl -s -o /dev/null -w 'curl -> exit=%{exitcode} http=%{http_code} size=%{size_download} total=%{time_total}\n' --connect-timeout 8 --max-time 20 "$NAS_PUBLIC_URL"
echo

echo "############ 7. NAS — PRIVATE SERVER ADVERTISED BY THE NAS OPENAPI SPEC ############"
echo "URL: ${NAS_PRIVATE_URL}"
echo "route lookup: $(ip route get 10.24.89.9 2>&1 | head -1)"
echo -n "TCP /dev/tcp 10.24.89.9:5000 (8s cap) -> "
timeout 8 bash -c 'exec 3<>/dev/tcp/10.24.89.9/5000' 2>/dev/null && echo "CONNECTED" || echo "NO CONNECTION (timeout/refused)"
curl -s -o /dev/null -w 'curl -> exit=%{exitcode} http=%{http_code} remote=%{remote_ip} connect=%{time_connect} total=%{time_total}\n' --connect-timeout 5 --max-time 5 "$NAS_PRIVATE_URL"
echo

echo "############ 8. AUTHORITATIVE SPEC FETCH FROM ARENA (negative control) ############"
echo "URL: ${SWAGGER_NAS_URL}"
curl -s -o /dev/null -w 'curl -> exit=%{exitcode} http=%{http_code} size=%{size_download} total=%{time_total}\n' --connect-timeout 8 --max-time 20 "$SWAGGER_NAS_URL"
echo

echo "############ 9. NODE (undici) CAUSE CHAIN — the exact failure layer ############"
node "$(dirname "$0")/arena-egress-probe.mjs" || echo "(probe script not present)"
echo

echo "############ 10. IRR /api/macro/* LIVE ROUTE PROBES (application wrapper) ############"
for p in cpi iip "nas?indicator=GVA"; do
  echo "--- GET http://localhost:${APP_PORT}/api/macro/${p}"
  curl -s -w '\nHTTP=%{http_code} CT=%{content_type} total=%{time_total}\n' --max-time 120 "http://localhost:${APP_PORT}/api/macro/${p}"
  echo
done
echo "############ END ############"
