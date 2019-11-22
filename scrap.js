const cheerio = require('cheerio');
const fetch = require('node-fetch');

const options = {
    headers: {
      'User-Agent': 'request'
    },
    json:true
  };

/// A function that loads and returns an object from the homepage///

const loadMovies = () =>{
   return fetch('https://o2tvseries.com', options)
            .then(res => res.text())
                .then( body =>{
                    const $ = cheerio.load(body)
                    const latestSeries = [];   
                    $('.data_list div').each( (i, element) => {
                        const item = $(element).text().trim();
                        latestSeries.push(item);
                    });

                    const series = [];
                    $('.series_container .series_set').each( (i, element) =>{
                        const $element = $(element);
                        const $link = $element.find('a');
                        const $label = $element.find('.label');
                        const $example = $element.find('span').eq(2);

                        const serie = {
                            link: $link.attr('href'),
                            label: $label.text().trim(),
                            example: $example.text().trim()
                        };

                        series.push(serie);

                    });
            
                    return {
                        latestSeries,
                        series
                    }
                
                })
            .catch(err =>  err)
            
}

// FUNCTION THAT LOADS A COMPLETE LIST OF SERIES FROM A SPECIFIED LABEL(CAT)
 const listSeries = async (label)=>{
    return await fetch(`https://o2tvseries.com/${label}`, options)
        .then(res => res.text())
            .then(async body =>{
                const $ = cheerio.load(body)
                const header = $('.header_bar').text().trim();

                // SELECT THE LAST PAGE LINK GET THE LAST PAGE NUMBER FROM THE LINK USING A REGEX AND SELECT THE SECOND ITEM IN THE ARRAY
                // CUS ITS THE PAGE NUMBER
                //  AND WITH IT WE CAN ITERATE THROUGH ALL THE PAGES FROM 1-LASTPAGE
                const lastPage = $('.page_nav').children().last().attr('href').match(/[0-9]+/g)[1];
                const labelList = [];

                // for loop is meant to run before console.log('hi") so that it can update the labelList before returning it
                // But it does not for some reason
            for ( i = 1; i <= parseInt(lastPage); i++) {
               await scrapPages(`https://o2tvseries.com/${label}/page${i}.html`)
                    .then((data) =>{
                        console.table(data)
                        data.forEach((element)  => {
                            // console.log(element)
                            labelList.push(element)

                        }); 
                    }).catch(err => console.log(err))
                        
                }
                console.log('hi')
  
                return {
                    header,
                    labelList
                }
            

            })
        .catch(err =>  err)
    }


const scrapPages = (link) =>{
    return fetch(link, options)
        .then(res => res.text())
            .then( body =>{
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
            })
        .catch(err =>  err)
}

module.exports = {
    loadMovies,
    listSeries

}