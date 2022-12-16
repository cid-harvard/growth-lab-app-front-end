console.log('Begin prerender of HTML pages');
const {metadata} = require('./src/metadata');

const fs = require('fs');
const path = require('path');
const indexFilePath = path.resolve(__dirname, './', 'dist', 'index.html');

// read in the index.html file
fs.readFile(indexFilePath, 'utf8', function(err, data) {
  console.log('Read in index.html');

  if (err) {
    return console.error(err);
  }

  metadata.forEach(({url, title, description, og_image, favicon}) => {
    let result = data;
    /* OPEN GRAPH TAGS */
    result = result.replace(/\$OG_TITLE/g, title);
    result = result.replace(/\$OG_DESCRIPTION/g, description);
    result = result.replace(/\$OG_IMAGE/g, '/og-images/' + og_image);
    result = result.replace(/\/favicon\.svg/g, favicon);

    /* TWITTER CARD TAGS */
    result = result.replace(/\$TWITTER_TITLE/g, title);
    result = result.replace(/\$TWITTER_DESCRIPTION/g, description);
    result = result.replace(/\$TWITTER_IMAGE/g, '/og-images/' + og_image);

    let filename = url.substring(1).replace(/\//g, '-');
    if (filename.length) {
      filename = filename + '.html';
    } else {
      filename = 'index.html';
    }
    fs.writeFile(path.resolve(__dirname, './', 'dist', filename), result, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Saved ' + filename);
      }
    });
  })

});
