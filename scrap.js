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
const listSeries = (label)=>{
    return fetch(`https://o2tvseries.com/${label}`, options)
    .then(res => res.text())
        .then( body =>{
            const $ = cheerio.load(body)
            const header = $('.header_bar').text().trim();
            const listNum = $('.data_list .data').get().length;
            const pageLinksArr = [];
            const pageCount = $('.pagination a').get().length;
            const labelList = [];

            // GET PAGINATION LINKS AND PUSH TO PAGElINKSARR ARRAY 
            $('.pagination a').each((i, element) =>{
                const $element = $(element);
                const $pageLink = $element.attr('href')

                pageLinksArr.push($pageLink);
            });


            // GET A LIST OF MOVIES IN THE SPECIFIED LABEL(CAT) AND PUSH IT TO LABELLIST ARRAY
            $('.data_list .data').each((i, element)=>{

                const $element = $(element);
                const $link = $element.find('a').attr('href');
                const $name = $element.find('a').text();

                const movie = {
                    name: $name,
                    link: $link
                }

                labelList.push(movie);

                if (labelList.length === listNum ) {
                    
                    for ( i = 1; i <= pageCount; i++) {
                        scrapPages(pageLinksArr[i-1])
                        console.log(`page scrap complete you are in page ${pageLinksArr[i-1]} `)
                        
                    }
                }
            });


            return {
                header,
                labelList
            }
           

        })
        .catch(err =>  err)
    }


const scrapPages = (link) =>{
    fetch(link, options)
        .then(res => res.text())
            .then( body =>{
                const $ = cheerio.load(body)
                $('.data_list .data').each((i, element)=>{

                    const $element = $(element);
                    const $link = $element.find('a').attr('href');
                    const $name = $element.find('a').text();
    
                    const movie = {
                        name: $name,
                        link: $link
                    }
    
                    labelList.push(movie);
                })
            })
        .catch(err =>  err)
}

module.exports = {
    loadMovies,
    listSeries

}