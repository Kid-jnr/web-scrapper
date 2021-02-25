const cheerio = require('cheerio');
const fetch = require('fetch-retry');

const options = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
  },
  json: true,
  retries: 5,
  retryDelay: 1000,
};

/// A function that scraps the latest release from the homepage

const latestRelease = async () => {
  try {
    const response = await fetch('https://o2tvseries.com', options);
    const body = await response.text();
    const $ = cheerio.load(body);

    const recentRelease = [];
    $('.data_list div').each((i, element) => {
      const $element = $(element);
      const name = $element.find('b:nth-child(1)').text().trim();
      const season = $element.find('b:nth-child(2)').text().trim();
      const episode = $element.contents().last().text().trim();
      recentRelease.push({ name, season, episode });
    });

    return {
      recentRelease,
    };
  } catch (err) {
    console.log(err);
  }
};

module.exports = latestRelease;
