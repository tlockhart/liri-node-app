//Require dotenv first for config information
require("dotenv").config();

//Require Spotify MOdule
var Spotify = require('node-spotify-api');

//Require Moment Module
var moment = require('moment');

//Require the request module
var request = require("request");

//Read keys.js and returns JSON
var keys = require("./keys");
var spotify = new Spotify(keys.spotify);

//Read external file
var fs = require("fs");

var action = process.argv[2];
//Slice the array at the third element and join everything with a space
var name = process.argv.slice(3).join(' ').replace(/'/g,'');

/*console.log("Action =" + action);
console.log("Name =" + name);*/

var spotifyCmd = "spotify-this-song";
var bandsInTownCmd = "concert-this";
var omdbCmd = "movie-this";
var fsCmd = "do-what-it-says";
var cmd = action.toLowerCase();

function interpretCmd(cmd, name){
    switch (cmd) {
        case spotifyCmd:
            //code block
            getSongInfo(name);
            break;
        case bandsInTownCmd:
            //code block
            getBandInfo(name);
            break;
        case omdbCmd:
            //code block
            getMovieInfo(name);
            //getMovieInfo
            break;
        case fsCmd:
            //code block
            getUnknownInfo();
            //getMovieInfo
            break;
        default:
        //code block
    }//switch
}//interpretCmd

function getSongInfo(name){
    if (name.length === 0) {
        //name = "Mr. Nobody";
        getDefaultSong("The Sign", "Ace of Base");
        return;
    }
    spotify
    .search({ type: 'track', query: name, limit: 5 })
    .then(function(data) {   
        for (var i = 0; i < data.tracks.items.length; i++) {
            var artist = data.tracks.items[i].album.artists[0].name;
            var album = data.tracks.items[i].album.name;
            var song = data.tracks.items[i].name;
            var previewUrl = data.tracks.items[i].preview_url;
            console.log("Artist: " + artist);
            console.log("Song Title: " + song);
            console.log("Preview URL: " + previewUrl);
            console.log("Album Title: " + album);
            console.log('******************************************************');
        }//for    
      })
      .catch(function(err){
        //console.log('Error occurred: ' + err);
        console.log('Your request was not found, but here is an alternative');
        console.log('******************************************************');
        getDefaultSong("The Sign", "Ace of Base");
      });
}//getSongInfo

function getDefaultSong(defaultTrack, defaultArtist) {
    spotify.search({ type: 'track', query: defaultTrack, limit: 10 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        //console.log(JSON.stringify(data, null, 2));
        for (var i = 0; i < data.tracks.items.length; i++) {
            if (data.tracks.items[i].album.artists[0].name === defaultArtist && data.tracks.items[i].name === defaultTrack) {
                var artist = data.tracks.items[i].album.artists[0].name;
                var album = data.tracks.items[i].album.name;
                var song = data.tracks.items[i].name;
                var previewUrl = data.tracks.items[i].preview_url;
                console.log("Artist: " + artist);
                console.log("Song Title: " + song);
                console.log("Preview URL: " + previewUrl);
                console.log("Album TItle: " + album);
                console.log("*******************************************");
            }//if
        }//for
    });//sportify
}//getDefaultSong
function getBandInfo(name) {
    /// Then run a request to the OMDB API with the movie specified
    request("https://rest.bandsintown.com/artists/" + name + "/events?app_id=codingbootcamp", function (error, response, body) {
        var myArr = [];
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            //console.log(response);
            //console.log("The movie's rating is: " + JSON.parse(body));
            myArr = JSON.parse(body);
            for (var i = 0; i < myArr.length; i++) {
                var venue = myArr[i].venue.name;
                var city = myArr[i].venue.city;
                var state = myArr[i].venue.region;
                var country = myArr[i].venue.country;
                var location = city + ", " + state + ", " + country;
                var unformattedDate = myArr[i].datetime;
                var formattedDate = moment(unformattedDate).format("l") + " " + moment(unformattedDate).format("LT");
                console.log("Venue: " + venue);
                console.log("Location: " + location);
                console.log("Date: " + formattedDate);
                console.log("*******************************************");
            }//for
        }//if
    });
}//getBandInfo

function getMovieInfo(name) {
    //If there is not name set a default movie;
    if (name.length === 0) {
        name = "Mr. Nobody";
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + name + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function (error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {
            var myArr = [];
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            //console.log(response);
            console.log("Movie Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            myArr = JSON.parse(body);
            console.log("IMDB Rating: " + getRatingsValue(JSON.stringify(myArr), "Internet Movie Database"));
            console.log("Rotten Tomatoes Rating: " + getRatingsValue(JSON.stringify(myArr), "Rotten Tomatoes"));
            console.log("Country: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
            console.log("*******************************************");
        }
    });
}//getMovieInfo
//Since Ratings are on the same level, Parse the data obj, where the ratings item equals IMDB or Rotten Tomatoes
function getRatingsObject (data, mySource) {
    //return JSON.parse(data).Ratings[0].Value;
    return JSON.parse(data).Ratings.find(function (item) {
        //console.log("Source = "+mySource);
       return item.Source === mySource;
    });
  }
  
  function getRatingsValue (data, mySource) {
      var returnValue;
      //Mititgate undefined ratings object
      if (getRatingsObject(data, mySource) != undefined){
        returnValue = getRatingsObject(data, mySource).Value;
      }
      else
      {
          returnValue = "No Ratings Found";
      }
    return returnValue;
  }

  function getUnknownInfo(){
    fs.readFile("random.txt", "utf8", function(error, data){
        //console.log(data);

        //Get data in an array
        var dataArr = data.split(",");

        //Store data from array:
        var action = dataArr[0];
        //Slice elements at the second array and join the remainder with spaces
        var name = dataArr.slice(1).join(' ').replace(/"/g,'');

        /*console.log("Action= "+action);
        console.log("Name = "+name);*/

        var cmd = action.toLowerCase();

        //Call the correct function
        interpretCmd(cmd, name);

    });
  }

  //Start Program
  interpretCmd(cmd, name);