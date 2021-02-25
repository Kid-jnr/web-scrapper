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

///This function gets a list of all the series available
const listAllSeries = async () => {
  try {
    const response = await fetch(
      'https://o2tvseries.com/search/list_all_tv_series',
      options
    );
    const body = await response.text();
    const $ = cheerio.load(body);

    const allSeriesLinkArr = [];
    const allSeriesInfo = [];

    $('.data_list .data').each((i, element) => {
      const $element = $(element);
      const $link = $element.find('a').attr('href').trim();
      allSeriesLinkArr.push({ link: $link });
    });

    // breaking the links into chunks to avoid socket hangup error
    /// add this later allSeriesLinkArr.length
    var i = 0;
    while (i < 50) {
      const requests = allSeriesLinkArr
        .slice(i + 600, i + 653)
        .map((url) => getAllInfo(url.link));
      const seriesData = await Promise.all(requests);

      seriesData.forEach((data) => {
        allSeriesInfo.push(data);
      });
      i += 50;
    }

    return { allSeriesInfo };
  } catch (err) {
    console.log(err);
  }
};

// Takes in a list of series and returns an array of obj of each show
const getAllInfo = async (link) => {
  try {
    const request = await fetch(link, options);
    const body = await request.text();
    const $ = cheerio.load(body);

    const movieLink = link;
    const $IMBD = $('.season_name a').attr('href');
    const $name = $('.serial_name').text().trim();
    const $image = $('.tv_series_info .img img').attr('src');
    const $cast = $('.other_info div:nth-child(1) .value')
      .text()
      .trim()
      .split(',');
    const $genre = 'hello';
    const $runTime = $('.other_info div:nth-child(3) .value').text().trim();
    const $seasonsCount = $('.other_info div:nth-child(6) .value')
      .text()
      .trim();
    const $seasons = [];
    const $seasonInfo = [];

    $('.data_list .data').each((i, element) => {
      const $element = $(element);
      const $link = $element.find('a').attr('href').trim();
      const $seasonName = $element.find('a').text().trim();

      $seasonInfo.push({
        seasonLink: $link,
        seasonName: $seasonName,
      });
    });

    var i = 0;
    while ((i, i < $seasonInfo.length)) {
      const data = await getSeriesInfo(
        $seasonInfo[i].seasonLink,
        $seasonInfo[i].seasonName,
        $name
      );
      $seasons.push(data);
      i++;
    }

    const series = {
      name: $name,
      genre: $genre,
      image: $image,
      runtime: $runTime,
      seasonsCount: $seasonsCount,
      cast: $cast,
      link: movieLink,
      IMBD: $IMBD,
      seasons: $seasons.reverse(),
    };
    return series;
  } catch (err) {
    console.log(err);
  }
};

/// gets info like episodes etc for each series
/// takes in the season link, season name and serialName
const getSeriesInfo = async (link, seasonName) => {
  try {
    const request = await fetch(link, options);
    const body = await request.text();
    const $ = cheerio.load(body);

    const $seasonName = seasonName; /// season 1, 2, 3 etc
    const $episodes = [];
    ///calculate number of pages if any exists
    const $episodeCount = $('.other_info div:last-child .value').text().trim();
    const pages = Math.ceil(parseInt($episodeCount) / 10);

    var i = 1;
    while (i <= pages) {
      const $link = link.replace('index.html', `page${i}.html`);
      const data = await page($link);
      data.forEach((result) => {
        $episodes.push(result);
      });
      i++;
    }

    return {
      season: $seasonName,
      episodeCount: $episodeCount,
      episodes: $episodes.reverse(),
    };
  } catch (error) {
    console.log(error);
  }
};

///handles pagination
const page = async (pageLink) => {
  try {
    const request = await fetch(pageLink, options);
    const body = await request.text();
    const $ = cheerio.load(body);
    const $data_list = $('.data_list .data').toArray();

    const $episode = [];

    var index = 0;
    while (index < $data_list.length) {
      const $element = $($data_list[index]);
      const $episodeLink = $element.find('a').attr('href').trim();
      const $episodeName = $element.find('a').text().trim();

      const data = await downloadLink($episodeLink);

      $episode.push({
        episode: $episodeName,
        link: $episodeLink,
        Dlink: data,
      });
      index++;
    }

    return $episode;
  } catch (error) {
    console.log(error);
  }
};

// remember to fix
// new link gen http://d1.o2tv.org/Making%20a%20Murderer/Season%2002/Making%20a%20Murderer%20-%20S02E01%20HD%20(TvShows4Mobile.Com).mp4
// old link gen http://d10.o2tvseries.club/Making%20a%20Murderer/Season%2002/Click%20to%20Download%20Episode%2001%20in%20Mp4%20
const downloadLink = async (episodeLink) => {
  try {
    const request = await fetch(episodeLink, options);
    const body = await request.text();
    const $ = cheerio.load(body);

    /// replace white spcaes with %20 for download link generation
    const seasonName = $('.breadcrumb a:nth-child(4)')
      .text()
      .trim()
      .replace(/[\s]+/g, '%20');
    const serialName = $('.breadcrumb a:nth-child(3)')
      .text()
      .trim()
      .replace(/[\s]+/g, '%20');
    const dLinks = [];

    $('.data_list .data a').each((i, element) => {
      if (i <= 1) {
        const $element = $(element).text().trim().replace(/[\s]+/g, '%20');
        const dLink = `http://d10.o2tvseries.club/${serialName}/${seasonName}/${$element}`;

        dLinks.push(dLink);
      } else {
        return false;
      }
    });

    return dLinks;
  } catch (error) {
    console.log(error);
  }
};

module.exports = listAllSeries;
