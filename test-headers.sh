#!/bin/bash

echo "Testing direct App Runner URL:"
curl -I https://qiypwsyuxm.us-east-1.awsapprunner.com/ 2>/dev/null | head -10

echo -e "\n\nTesting CloudFront URL:"
curl -I https://new.surefilter.us/ 2>/dev/null | head -10

echo -e "\n\nTesting with verbose headers to see what CloudFront sends:"
curl -v https://new.surefilter.us/ 2>&1 | grep -E "^(<|>)" | head -20
