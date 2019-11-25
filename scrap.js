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
            const item = $(element).text().trim();
            recentRelease.push(item);
        });

        return {
            recentRelease
        }
    }
    catch(err){
        console.log(err)
    }
            
}

// FUNCTION THAT LOADS A COMPLETE LIST OF SERIES FROM A SPECIFIED LABEL(CAT)
// Remeber to remove this function as because we are getting all the movies 
// sending it to a database then sort them from there its more efficient

const listSeries = async (label)=>{
    try{
        const response = await fetch(`https://o2tvseries.com/${label}`, options)
        const body = await response.text()
        const $ = cheerio.load(body)
        
        const header = $('.header_bar').text().trim();

        // SELECT THE LAST PAGE LINK GET THE LAST PAGE NUMBER FROM THE LINK USING A REGEX AND SELECT THE SECOND ITEM IN THE ARRAY
        // CUS ITS THE PAGE NUMBER
        //  AND WITH IT WE CAN ITERATE THROUGH ALL THE PAGES FROM 1-LASTPAGE
        const lastPage = $('.page_nav').children().last().attr('href').match(/[0-9]+/g)[1];
        const labelList = [];

        for ( i = 1; i <= parseInt(lastPage); i++) {
            const data = await scrapPages(`https://o2tvseries.com/${label}/page${i}.html`)
            data.forEach((element)  => {
                labelList.push(element)

            });
        }
            return {
                header,
                labelList
            }
    }
    catch(err){
        console.log(err)
    }
}


const scrapPages = async(link) =>{
    try{
        const response = await fetch(link, options)
        const body = await response.text()
        const $ = cheerio.load(body)

        const pagesArr= [];
        $('.data_list .data').each((i, element)=>{

            const $element = $(element);
            const $link = $element.find('a').attr('href');
            const $name = $element.find('a').text();

            const movie = {
                name: $name,
                link: $link
            }
            pagesArr.push(movie)
        });
        
        return pagesArr
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
            const $link = $element.find('a').attr('href');
            const $name = $element.find('a').text();

            const genre = {
                name: $name,
                link: $link
            }
            genreArr.push(genre)
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

        /// will be comparing with allserieslinkarr.length but because of size we pick the 1st 50
        for (let i = 0; i <= 50; i++) {
            const request = await getAllInfo(allSeriesLinkArr[i].link)                     
            allSeriesInfo.push(request)
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
        const $image = $('.tv_series_info .img img').attr('src').trim()
        const $cast = $('.other_info div:nth-child(1) .value').text().trim()
        const $genre = $('.other_info div:nth-child(2) .value a').text().trim() /// fix the comma issue with output
        const $runTime = $('.other_info div:nth-child(3) .value').text().trim()
        const $rating = $('.other_info div:nth-child(5) .value').text().trim()
        const $seasons = $('.other_info div:nth-child(6) .value').text().trim()

        const series = {
            name: $name,
            genre: $genre,
            image: $image,
            runtime: $runTime,
            rating: $rating,
            seasons: $seasons,
            cast: $cast,
            link: movieLink,
            IMBD: $IMBD
        };
        return series
    }
    catch(err){
        console.log(err)
    }
}


module.exports = {
    latestRelease,
    listSeries,
    listGenres,
    listAllSeries
}