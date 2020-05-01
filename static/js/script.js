var decklist = {{ decklist|tojson }};
var bg_top = {{ bg_top|tojson }};
var images = {{ images_filenames|tojson }};
var site = "https://art.hearthstonejson.com/v1/render/latest/enUS/256x/{{decklist[0][0]['id']}}.png";


// var images = [];
var x = [];
var y = [];
for (var i = 0; i < decklist.length; i++) {
    // images[i] = "https://art.hearthstonejson.com/v1/render/latest/enUS/256x/"+decklist[i][0]['id']+".png";
    x[i] = decklist[i][2][0]
    y[i] = decklist[i][2][1]
}

images[images.length] = bg_top //"static/images/bg_top_rogue.jpg"
images[images.length] = "static/images/x2-42.png"


var loadedImages = {};
var promiseArray = images.map(function(image_url){
   var prom = new Promise(function(resolve,reject){
       var img = new Image();
       img.onload = function(){
           loadedImages[image_url] = img;
           resolve();
       };
       img.src = image_url;
   });
   return prom;
});

Promise.all(promiseArray).then(imagesRedraw);

function imagesLoaded(){
    console.log(document.querySelector('input[name="options"]:checked').id) //which radio button selected

   //start canvas work.
   //when needing to draw image, access the loaded image in loadedImages
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    // context.fillStyle = 'rgba(0,55,0,0.5)';
    // context.fillRect(0, 0, canvas.width, canvas.height);

    var x2 = images[images.length-1]
    for (var i = 0; i < decklist.length+1; i++) {
        context.drawImage(loadedImages[images[i]], x[i], y[i]);
        if (decklist[i][1] == 2) {
            context.drawImage(loadedImages[x2], x[i]+98, y[i]+340);
        }
    }
   // context.drawImage(loadedImages[images[0]], 300, 100);
   console.log(loadedImages[images[0]])
   console.log(loadedImages[images[images.length - 1]])
}

function imagesRedraw(){

    var options = {'radio_option_6': 6, 'radio_option_7': 7, 'radio_option_8': 8, 'radio_option_10': 6, }
    var cols = options[document.querySelector('input[name="options"]:checked').id] //which radio button selected
    console.log(cols)

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, 1792, 1200)


    var card_width = 256;
    var card_height = 388;
    var card_down = 340;
    var height_correction = 300 * (cols*0.1);

    canvas.width = card_width * cols
    canvas.height = (card_height * (Math.ceil(decklist.length / cols))) + height_correction;
    // console.log(Math.ceil(decklist.length / cols))

    context.fillStyle = 'rgba(0,0,0,1)';
    // context.fillStyle = 'rgba(33,20,57,1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    //bg_top
    context.drawImage(loadedImages[images[images.length - 2]], 0, 0, canvas.width, canvas.width*560/2600);


    for (var i = 0; i < decklist.length; i++) {

        if (i <= cols-1) {
            xxx = card_width*i;
            yyy = card_height*0;
        } else if (i <= cols*2 - 1) {
            xxx = card_width * (i-cols);
            yyy = card_height;
        } else if (i <= cols*3 - 1) {
            xxx = card_width * (i-cols*2);
            yyy = card_height*2;
        } else if (i <= cols*4 - 1) {
            xxx = card_width * (i-cols*3);
            yyy = card_height*3;
        } else if (i <= cols*5 - 1) {
            xxx = card_width * (i-cols*4);
            yyy = card_height*4;
        }

        if (decklist[i][0]['type'] == 'HERO') {
            xxx = xxx - 7
            yyy = yyy - 23
        }

        yyy = yyy + height_correction

        if (decklist[i][1] == 2) {
            context.drawImage(loadedImages[images[images.length - 1]], xxx+98, yyy+340);
        }
        context.drawImage(loadedImages[images[i]], xxx, yyy);
    }
}


    function download_image(){
        var download = document.getElementById("download");
        var image = document.getElementById("canvas").toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
        download.setAttribute("href", image);

    }