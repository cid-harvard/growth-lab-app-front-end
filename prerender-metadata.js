console.log('Begin prerender of HTML pages');
const {metadata} = require('./src/metaData');

const fs = require('fs');
const path = require('path');
const indexFilePath = path.resolve(__dirname, './', 'build', 'index.html');

// read in the index.html file
fs.readFile(indexFilePath, 'utf8', function(err, data) {
  console.log('Read in index.html');

  if (err) {
    return console.error(err);
  }

  metadata.forEach(({url, title, description}) => {
    let result = data;
    result = result.replace(/\$OG_TITLE/g, title);
    result = result.replace(/\$OG_DESCRIPTION/g, description);
    let filename = url.substring(1).replace(/\//g, '-');
    if (filename.length) {
      filename = filename + '.html';
    } else {
      filename = 'index.html';
    }
    fs.writeFile(path.resolve(__dirname, './', 'build', filename), result, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Saved ' + filename);
      }
    });
  })

});

const nginxTemplatePath = path.resolve(__dirname, './', 'config', 'nginx_template.conf');
const nginxFilePath = path.resolve(__dirname, './', 'config', 'nginx.conf');
// read in the nginx.conf file
fs.readFile(nginxTemplatePath, 'utf8', function(err, data) {
  console.log('Read in nginx.conf');
  if (err) {
    return console.error(err);
  }

  let result = data;
  let urls = '';
  metadata.forEach(({url}) => {
    let filename = url.substring(1).replace(/\//g, '-');
    if (filename.length) {
      filename = filename + '.html';
    } else {
      filename = 'index.html';
    }
    urls = urls + `\n        rewrite ^${url}                            /${filename}`;
    console.log(`Add nginx rule: rewrite ^${url} -> /${filename}`);
  })
  result = result.replace(/\#{%URLS%}/g, urls);
  fs.writeFile(nginxFilePath, result, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Saved nginx.conf');
    }
  });

});