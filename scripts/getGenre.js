const cheerio = require('cheerio');
const fetch = require('fetch-retry');

const options = {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
    },
    json:true,
    retries: 5,
    retryDelay: 1000
  };

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

module.exports = listGenres