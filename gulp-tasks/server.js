'use strict';
/* eslint-disable no-console */
const config = require('../config');
const express = require('express');
const os = require('os');
const serverRendering = require('./_serverRendering.js');
const timeout = require('connect-timeout');
const https = require('https');
const fs = require('fs');

const app = express();

function getLocalIpAddresses() {
  const netInterfaces = os.networkInterfaces();
  const addresses = [];
  Object.keys(netInterfaces).forEach((netInterface) => {
    // omit virtual interfaces.
    if (netInterface.includes('VMware') || netInterface.includes('vboxnet')) return;

    netInterfaces[netInterface].forEach((netAddrObj) => {
      if (netAddrObj.family === 'IPv4') {
        addresses.push(netAddrObj.address);
      }
    });
  });
  return addresses;
}

const serverRenderingHandler = (bundleName, req, res, next) => {
  serverRendering
  .generateMarkup(req.url, bundleName)
  .then((statusObj) => {
    if (statusObj.redirect) {
      res.redirect(301, statusObj.redirect.pathname + statusObj.redirect.search);
    } else if (statusObj.error) {
      console.log(statusObj.error);
      next(statusObj.error);
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(statusObj.data);
    }
  });
};

module.exports = () => {
  function serverTask() {
    /*
     * Disable cache for easier debug
     */
    app.get('/*', (req, res, next) => {
      if (req.url.match(/\.(jpg|png|gif|otf|eot|ttf)$/)) {
        // cache images and fonts
        return next();
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');
      next();
    });
    app.disable('etag');

    /*
     * Set timeout for long-running requests.
     */
    app.use(timeout(30000));

    app.use(haltOnTimeout);

    /*
     * serve all static files from dist/ directory.
     */
    app.use(express.static(config.DESTINATION_DIR, {
      dotfiles: 'ignore',
      index: 'index.html',
      maxAge: '8h'
    }));

    app.use(haltOnTimeout);

    /*
     * serve all static files from assets/ directory.
     */
    app.use(express.static(config.ASSETS_DIR, {
      dotfiles: 'ignore',
      maxAge: '8h'
    }));

    app.use(haltOnTimeout);

    /*
     * server-side rendering for react components.
     */
    app.use((req, res, next) => {
      const bundleName = 'app.js';
      serverRenderingHandler(bundleName, req, res, next);
    });

    app.use(haltOnTimeout);

    /*
     * start server
     */
    const serverStartedCallback = () => {
      const printAddr = (addr) => {
        return `https://${addr}:${config.SERVER_PORT}`;
      };

      let serverStartedMsg = `-------------------
SERVER STARTED
Go to ${printAddr(config.SERVER_HOST)}`;

      if (config.SERVER_HOST === '0.0.0.0') {
        serverStartedMsg += '\nDetected network address:';
        getLocalIpAddresses().forEach((addr) => {
          serverStartedMsg += `\n${printAddr(addr)}`;
        });
      }

      serverStartedMsg += '\n-------------------';
      console.log(serverStartedMsg);
    };

    const options = {
      key: fs.readFileSync(`${config.BASE_DIR}/server.key`),
      cert: fs.readFileSync(`${config.BASE_DIR}/server.crt`),
      requestCert: false,
      rejectUnauthorized: false
    };

    https
      .createServer(options, app)
      .listen(config.SERVER_PORT, serverStartedCallback);
  }

  return serverTask;
};

function haltOnTimeout(req, res, next) {
  if (!req.timedout) next();
}

function getKey() {
  return `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpSvXthJDERVyW
t3czLfgmzafh8VwGlqgcfQB7tPFBvBCwt1Y51ytTaqbaowqn5FkzrjsXyke3jLPY
AH0Z1TqZW7yvpcSocbqEyq+f6euGrr8MrlZ3gkm/+bslmxDN59J2hamqb2L1dlHG
nYTyRHi3OBHA4Foso39iDk17us4gdyuxtVMvRRbOgzisMpTTWehBwkCh+vJOkPnT
F2VvN2wCKLQlGdTgjqHivkaDKjZM3FZ/AZoczotvURbKNX7tC0yS8m5TEMxXAlOd
x/gWZa+eqCOvn3qtcpJDr4aXN93Tcs7+wBc6UY0T7jLMDrNDR6MkoaRO5420oEzW
7D8lW0JnAgMBAAECggEAUmjNn4IlMI3tPObxbSYHAuigvUGPQRvMmRWWiyGxQYUJ
gOS2YjCmhBRKResRMFpdu+UoGfQbhjPFhjPysgUU4fuAteZVfYPjPmomJQurXeQp
10P0jneLbBrmqa869mjPkGePiIpxWzjuJOegBIklVFdEeSYdb1Zll3eL61urpKxj
DSQ8FqQ9L1wi2dKf6eYGrOWCBMMSgZWknOYSSYKXuYDhzRhTM4+8W+k0gB9hXLGW
RwSBvmRFo2YoYq1BvW+nCCfPDJ3jvQhHMCN3ByvpsChO0DuSLFXoBJnMlu6yED3e
NKxCAJ0NXZwNrsZR/uoArFAkplJ+xCwPbRRWw8mRkQKBgQDf9yjk4CpWvgwf4g4n
FMdZ3bNExI74opJSx8s1XHj6qsq11SUFT1OXTV9+Eo9gAoDf8uiplz4ZB3o4MFex
0Vz9XOxxncS3eW/o803yHiTbT637Fw74vcwDBfebyZjdaSpTgwTVifONyGnb/f1L
P1rWE3IaSOpxljETY1SC6OxWVwKBgQDBgeCqa9A3b2uDCJ3ptsXwr90xXJzSbEqc
QUKzjqNsKzMh44+ewGD4M8nVdwV2ShOrJpPsliifUCYWsHM4nDF9RuRd+Bji/Xwr
zpwJob372THAkAoYQ04MCYp5JJ6xVbBeB31Vo4UELCyRvvQ0AtFRDP2KAvp3DwJE
hSf2yAxKcQKBgFIyzzJ5R3DAnYiSGemkCapk4OerUGHWoOd65oz2HHy7dFyaFtVF
EQPl5NdLjo2JPa1z5IphtOvQv72hmH3tvjhLA4iLg+hmzHjt2zyybYqESvFtvBP0
7MxrQz5NFiqk72DpJDwPPnFaDegs5urYHMmXJ3iYLFt16RsZiKnnPN5PAoGAH4+Q
VhtphXEdxuxj3RebZys313I0fbl93chjGagdDWpqV4+nAAx+hFzmAXP9JxLj7FlJ
bR/8lidbXv3+fPA0visO2ii53mPbmcWD+6ous2H0VGTp0JVBqILx29pWK7Q/JMbx
8ULPUiPmTQspB0aiXybQP29G7J49D3HsV7q/DnECgYEAq2yhg9tJ97uUtV6bz+vT
F4RwqhDFsniKSgxEmzL6Nael1ANVn0UG4cq9rEDct7HR0Mdd8V5Z/IU3dNYoxZL6
vTLR50hJvksRDgD0dWHJyntz/XQI0/w9eUjSaHM39jIObTW3tKZ/ldV1q7ORZjex
P57b8qxP03yoWICz23GJD50=
-----END PRIVATE KEY-----`;
}

function getCert() {
  return `-----BEGIN CERTIFICATE REQUEST-----
MIIC9DCCAd4CAQAwgYAxfjAQBgNVBAMMCWxvY2FsaG9zdDAfBgkqhkiG9w0BCQET
EmNlemFyeUBub3dhay5jbGljazAHBgNVBAsTADATBgNVBAoTDFNsZWVweUtpdHRl
bjAHBgNVBAkTADAHBgNVBAcTADAHBgNVBAgTADAHBgNVBBETADAHBgNVBAYTADCC
ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKlK9e2EkMRFXJa3dzMt+CbN
p+HxXAaWqBx9AHu08UG8ELC3VjnXK1NqptqjCqfkWTOuOxfKR7eMs9gAfRnVOplb
vK+lxKhxuoTKr5/p64auvwyuVneCSb/5uyWbEM3n0naFqapvYvV2UcadhPJEeLc4
EcDgWiyjf2IOTXu6ziB3K7G1Uy9FFs6DOKwylNNZ6EHCQKH68k6Q+dMXZW83bAIo
tCUZ1OCOoeK+RoMqNkzcVn8BmhzOi29RFso1fu0LTJLyblMQzFcCU53H+BZlr56o
I6+feq1ykkOvhpc33dNyzv7AFzpRjRPuMswOs0NHoyShpE7njbSgTNbsPyVbQmcC
AwEAAaAwMC4GCSqGSIb3DQEJDjEhMB8wHQYDVR0OBBYEFLjzqAGMnKi7s9qYvs/W
h9nUrTPUMAsGCSqGSIb3DQEBCwOCAQEAH0YLrnjwCvVSxDD6JSBJIwRey8AgHosD
ulPY65h+PfgrMWA/rkmik0sRV0WgYGOur37xOlVbnaS98ILvt0UybiIy0NPUDCYd
pChJpQlx4Tcc2MbrZtrJ3WI9dCqNGV5NklvZPvgQc11fcp2kr/uPKDHS5E1/Nx/8
p0cDMMdzOIqom+5s/29EfrpDsiCdqfDR/+tQuLV4jM/LPr7UvO0UpmIQhvOJYXs4
7gOSAMP/3P4L5jp8Vivav9C9AT4cM1+cmwnsqs6A7XRyVrDPgceo08duPwvz5CnP
j0cpafZdyWSpk4+8lGHXLyLd+RSWHqpvxfS7O3SfpRvrUnVB9zBIIQ==
-----END CERTIFICATE REQUEST-----`;
}
