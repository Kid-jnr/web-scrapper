const cheerio = require('cheerio');
const fetch = require('node-fetch');

const options = {
    headers: {
      'User-Agent': 'request'
    },
    json:true
  };

/// A function that scraps the latest release from the homepage

const latestRelease = async () =>{
    try{
        const response = await fetch('https://o2tvseries.com', options)
        const body = await response.text()  
        const $ = cheerio.load(body)

        const recentRelease = [];   
        $('.data_list div').each( (i, element) => {
            const $element = $(element);
            const name = $element.find('b:nth-child(1)').text().trim()
            const season = $element.find('b:nth-child(2)').text().trim()
            const episode = $element.contents().last().text().trim()
            recentRelease.push({name, season, episode});
        });

        return {
            recentRelease
        }
    }
    catch(err){
        console.log(err)
    }
            
}

///This function gets a list of all the genres available
const listGenres = async() =>{
    try{
        const response = await fetch('https://o2tvseries.com/search/genre',options)
        const body = await response.text()
        const $ = cheerio.load(body)
        const genreArr = []

        $('.data_list .data').each((i, element)=>{
            const $element = $(element);
            const $name = $element.find('a').text();

            genreArr.push($name)
        }); 
        
        return {genreArr} 
        }
        catch(err){
            console.log(err)
        }
}

///This function gets a list of all the series available
const listAllSeries =async () =>{
    try {
        const response = await fetch('https://o2tvseries.com/search/list_all_tv_series',options)
        const body = await response.text()            
        const $ = cheerio.load(body)

        const allSeriesLinkArr = []
        const allSeriesInfo = []

        $('.data_list .data').each((i,element) => {
            const $element = $(element);
            const $link = $element.find('a').attr('href').trim();
            allSeriesLinkArr.push({link:$link})       
        }); 

        // breaking the links into chunks to avoid socket hangup error
        var i = 0
        while (i < allSeriesLinkArr.length ) {
            const requests = allSeriesLinkArr.slice(i, i + 50).map(url => getAllInfo(url.link));
            const seriesData = await Promise.all(requests)

            seriesData.forEach( data =>{
                allSeriesInfo.push(data)
            })
            i+= 50
        }

        return {allSeriesInfo}
    }
    catch(err){
        console.log(err)
    }
}

// Takes in a list of series and returns an array of obj of each show
const getAllInfo = async (link) =>{
    try{
        const request = await fetch(link, options)
        const body = await request.text()
        const $ = cheerio.load(body);

        const movieLink = link
        const $IMBD = $('.season_name a').attr('href');
        const $name = $('.serial_name').text().trim()
        const $image = $('.tv_series_info .img img').attr('src')
        const $cast = $('.other_info div:nth-child(1) .value').text().trim()  
        const $genre = $('.other_info div:nth-child(2) .value').text().trim() 
        const $runTime = $('.other_info div:nth-child(3) .value').text().trim()
        const $seasons = $('.other_info div:nth-child(6) .value').text().trim()
        const $seasonLinks = []

        $('.data_list .data').each((i,element) => {
            const $element = $(element);
            const $link = $element.find('a').attr('href').trim();
            $seasonLinks.push( $link)     
        }); 

        const series = {
            name: $name,
            genre: $genre,
            image: $image,
            runtime: $runTime,
            seasons: $seasons,
            cast: $cast,
            link: movieLink,
            IMBD: $IMBD,
            seasonLinks: $seasonLinks.reverse()
        };
        return series
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    latestRelease,
    listGenres,
    listAllSeries
}