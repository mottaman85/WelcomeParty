var express = require('express.io');
var color = require('colors');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsUpmI2cLcd  = require ('jsupm_i2clcd');
var mraa = require ('mraa');
var LCD  = require ('jsupm_i2clcd');


var index = require('./routes/index');

var Twitter = require('twitter');
require('request');
var client = new Twitter({
  consumer_key: 'XEG1PfDYYiS7rEJLLbDKj3u0R',
  consumer_secret: 'QYiqvjkTYHhPQyIuGHdTvzfNKAt3zqGBcUZqhs2UssW59VwWp3',
  access_token_key: '136483822-7TfPhZmbdNr4lUhE33XeWPTz42qQaL9doSdSFdP6',
  access_token_secret: '5LuCMj9KlH1e6nuKdbX3naW267HQo6FWVRKtCtbEgR4Up'
});


client.stream('statuses/filter', {track: 'IntelMakerMX'}, function(stream) {
  stream.on('data', function(tweet) {
      var str = tweet.text;
      console.log(str);

  });

  stream.on('error', function(error) {
    throw error;
  });

});

var lcd = require('jsupm_i2clcd');
    var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    display.setCursor(0,0)
    function rotateColors(display) {
        var red = 0;
        var green = 0;
        var blue = 0;
        display.setColor(red, green, blue);
        setInterval(function() {
            blue += 64;
            if (blue > 255) {
                blue = 0;
                green += 64;
                if (green > 255) {
                    green = 0;
                    red += 64;
                    if (red > 255) {
                        red = 0;
                    }
                }
            }
            display.setColor(red, green, blue);
            /*display.setCursor(0,0);
            display.write('red=' + red + ' grn=' + green + '  ');
            display.setCursor(1,0);
            display.write('blue=' + blue + '   ');  // extra padding clears out previous text
            */
        }, 1000);
    }


var app = express();
app.http().io();

app.listen(3001);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());




/**********************************************
**
** CONFIGURACION DE LAS RUTAS ESTATICAS
**
************************************************/
app.use(express.static('webapp'));
app.use(express.static('uploads'));
app.use('/stats', express.static('bower_components'));
app.use(express.static('node_modules/express.io'))


/**********************************************
**
** CONFIGURACION DE MIDLEWARE
**
************************************************/
app.use(function(req, res, next){
  //req.db = db;
  next();
})

app.get('/', function(req, res){
    console.log("Dash...");
  	res.sendfile('views/welcome.html');
});

app.post('/messageLCD', function(req, res){
    display.setCursor(0,0)
    display.setCursor(1, 1);
    display.write('hi ' + req.body.autor);
    rotateColors(display);
    req.io.route('messageChange');
    res.send({});
});

/**********************************************
**
** CONFIGURACION DE ROUTES
**
************************************************/
//app.use('/', index);




// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.io.route('messageChange', function(req){
  console.log("on messageChange");
  console.log(req.body)
  req.io.broadcast('messageChangeParty', req.body);
  req.io.respond({hello: 'from io route'})
});

// production error handler
// no stacktraces leaked to user



module.exports = app;
