//-------------SET MODULES------------//

//require file system module from the packages
const fs = require('fs'); //package name is fs (file system) - core node module

//require http module from the packages
const http = require('http');

//require URL module from packages
const url = require('url');

//--------USE VARIABLES CONTAINING MODULES---------//

//use method from fs package to read file (synchronously) and store it into a variable (sync because it is only to start the app, runs only once)
const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8'); //dirname variable is define in node.js (home folder) followed by the absolute path - Second argument is encoding (necessary)

//parse the json into an object
const laptopData = JSON.parse(json); //parse the json variable above (which containes all json file)

//create server with callback function thats going to be fired everytime someone accesses the server
const server = http.createServer((req, res) => { //use createServer method on http object, arguments are REQUEST and RESPONSE objects

  //parse URL and get its pathName and store it into my own variable
  const pathName = url.parse(req.url, true).pathname; //first argument is to access url of the request, second is so that it comes as an object

  //parse URL to get query (ids in the url) and store it (id for each laptop)
  const id = url.parse(req.url, true).query.id; //imediately gives me the id in the query object

  //Implement routing (something to do with each different URL)
  if (pathName === '/products' || pathName === '/') {
    //do something
    res.writeHead(200, {'Content-type': 'text/html'}) //write the http header to inform browser what data is coming in with the request (first argument is status, second is object with information)

    //always send the content AFTER setting the http header

    //read OVERVIEW template
    fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => { //callback function to access the data and replace it in the template

      let overviewOutput = data;

      //now read CARDS template
      fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => { //callback function to access the data and replace it in the template

        const cardOutput = laptopData.map(el => replaceTemplate(data, el)).join(''); //use map to loop and return new with templates filled in (data is template file, el is current card, this will generate the 5 cards and JOIN will put all together as a string
        overviewOutput = overviewOutput.replace('{%CARDS%}', cardOutput); //replace all the instances where there should be a card with the actual card
        //send response to the browser
        res.end(overviewOutput); //return the data with the cards already replaced
      });
    });
}
  else if (pathName === '/laptop' && id < laptopData.length) { //correct number of laptops in our server
    //do someting else
    res.writeHead(200, {'Content-type': 'text/html'}); //write the http header to inform browser what data is coming in with the request (first argument is status, second is object with information)

    //always send the content AFTER setting the http header

    //read template file asyncrounously
    fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => { //callback function to access the data and replace it in the template

      //replace string method for each template in the html with the data from the json objects
      const laptop = laptopData[id];

      //call replace template
      const output = replaceTemplate(data, laptop); //data is the template file, laptops is the json information

      //send response to the browser
      res.end(output);
    });
  }
  else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) {//ROUTE FOR THE IMAGES, test with regex
    fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => { //read the image with correct route and use callback function to do something with it

      res.writeHead(200, {'Content-type': 'image/jpg'}); //write header
      res.end(data); //respond with the data
    })
  }
  else {
    //error 404
    res.writeHead(404, {'Content-type': 'text/html'}) //write the http header to inform browser what data is coming in with the request (first argument is status, second is object with information)

    //always send the content AFTER setting the http header

    res.end('This is the response for error');
  }


});

//have to listen specific port and IP address
server.listen(1337, '127.0.0.1', () => { //1.Port, 2. ip address(localhost in this case), 3. function to know server started listening (not mandatory argument)

  console.log("Listening to requests now");

});

//CREATE FUNCTION TO REPLACE template
function replaceTemplate(originalHtml, laptop) { //arguments are the original and the laptop for the query

  //regurlar expresions because some have more than only one occurence
  let output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName); //id as index depending on url that is requested (first argmument is what has to be replaced)
  output = output.replace(/{%IMAGE%}/g, laptop.image); //output replace because replace returns a new string, so the previous template is already changed
  output = output.replace(/{%PRICE%}/g, laptop.price);
  output = output.replace(/{%SCREEN%}/g, laptop.screen);
  output = output.replace(/{%CPU%}/g, laptop.cpu);
  output = output.replace(/{%STORAGE%}/g, laptop.storage);
  output = output.replace(/{%RAM%}/g, laptop.ram);
  output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
  output = output.replace(/{%ID%}/g, laptop.id);

  return output; //to use in other functions who need this code
}
