var deck_info = {'decklist': 0};
var loadedImages = {};
var download_btn = document.getElementById("get_image0");

var sliderPicker = new iro.ColorPicker("#sliderPicker", {
    width: 250,
    color: "rgba(0, 0, 0, 1)",
    padding: 10,
    margin: 8,
    borderWidth: 0,
    borderColor: "#fff",
    layout: [
    {
        component: iro.ui.Slider,
        options: {
            sliderType: 'hue'
        }
    },
    {
        component: iro.ui.Slider,
        options: {
            sliderType: 'saturation'
        }
    },
    {
        component: iro.ui.Slider,
        options: {
            sliderType: 'value'
        }
    },
    {
        component: iro.ui.Slider,
        options: {
            sliderType: 'alpha'
        }
    },
    ]
});

sliderPicker.on('color:change', function(color) {
    // console.log(color.hexString);
    drawCanvas()
});


function get_deck_info() {
    download_btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading... 0%';
    new Promise(r => setTimeout(r, 2000));
    $.ajax({
        type: "POST",
        url: "/get_deck_info",
        data: $('form').serialize(),
        type: 'POST',
        success: function(response) {
            var deck_info_incoming = jQuery.parseJSON(response)

            if (deck_info_incoming['decklist'] != 0) {

                var percentage = 0;
                function update_download_btn() {
                    percentage = percentage + Math.round(100/deck_info_incoming['images_filenames_all'].length)
                    console.log(percentage)
                    download_btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading... ' + percentage + '%'
                }

                var loadedImages_incoming = {};
                var promiseArray = deck_info_incoming['images_filenames_all'].map(function(image_url){


                    var prom = new Promise(function(resolve,reject){
                        var img = new Image();
                        img.onload = function(){
                            loadedImages[image_url] = img;
                            resolve();

                            update_download_btn()
                        };
                        img.src = image_url;
                    });
                    return prom;
                });

                Promise.all(promiseArray).then(drawCanvas);
            }

            deck_info = deck_info_incoming
            loadedImages = loadedImages_incoming
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function drawCanvas(){
    download_btn.innerHTML = 'Get images'
    download_btn.disabled = false;

    var options = {'options_cols_6': 6, 'options_cols_7': 7, 'options_cols_8': 8, 'options_cols_10': 10, }
    var cols = options[document.querySelector('input[name="options_cols"]:checked').id] //which radio button selected

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, 1792, 1200) ///! move into model

    var height_correction = 300 * (cols*0.1); ///? move into model

    canvas.width = deck_info['card_width'] * cols
    canvas.height = (deck_info['card_height'] * (Math.ceil(deck_info['decklist'].length / cols))) + height_correction;

    var background_color = sliderPicker.color.rgbaString;
    console.log(background_color)

    // context.fillStyle = 'rgba(0,0,55,1)';
    context.fillStyle = background_color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(loadedImages[deck_info['class_bg_top']], 0, 0, canvas.width, canvas.width*560/2600);  ///? move into model

    for (var i = 0; i < deck_info['decklist'].length; i++) {
        if (i <= cols-1) {
            position_x = deck_info['card_width']*i;
            position_y = deck_info['card_height']*0;
        } else if (i <= cols*2 - 1) {
            position_x = deck_info['card_width'] * (i-cols);
            position_y = deck_info['card_height'];
        } else if (i <= cols*3 - 1) {
            position_x = deck_info['card_width'] * (i-cols*2);
            position_y = deck_info['card_height']*2;
        } else if (i <= cols*4 - 1) {
            position_x = deck_info['card_width'] * (i-cols*3);
            position_y = deck_info['card_height']*3;
        } else if (i <= cols*5 - 1) {
            position_x = deck_info['card_width'] * (i-cols*4);
            position_y = deck_info['card_height']*4;
        }

        if (deck_info['decklist'][i][0]['type'] == 'HERO') {
            position_x = position_x - 7
            position_y = position_y - 20
        }

        position_y = position_y + height_correction

        if (deck_info['decklist'][i][1] == 2) {
            context.drawImage(loadedImages[deck_info['x2_image']['src']], 
                position_x + deck_info['x2_image']['position_correction'][0], 
                position_y + deck_info['x2_image']['position_correction'][1]);
        }

        context.shadowBlur = 20;
        context.shadowColor = "#000000";
        context.drawImage(loadedImages[deck_info['images_filenames_cards'][i]], position_x, position_y);
    }

    // context.shadowBlur = 0;
    // context.fillStyle = 'rgba(45,45,45,1)';
    // context.font = "36px Roboto";
    // context.fillText(deck_info['class_name'] + "'s Deck. Costs: " + deck_info['deck_cost'], 100, 120); ///? move into model
    // context.fillText("Format: " + deck_info['format'], 100, 160); ///? move into model
}



function downloadImage(){
    var currentdate = new Date(); 
    var datetime = currentdate.getFullYear() + '-' 
        + (currentdate.getMonth()+1)  + '-' 
        + currentdate.getDate() + '-'
        + currentdate.getHours() + '.'  
        + currentdate.getMinutes() + '.' 
        + currentdate.getSeconds();

    console.log(datetime)

    var download = document.getElementById("download");
    var image = document.getElementById("canvas").toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
    download.setAttribute("download", datetime + '.png');
    download.setAttribute("href", image);

}

function get_len() {
    console.log('get_len START')
    $.ajax({
        type: "POST",
        url: "/get_len",
        data: $('form').serialize(),
        type: 'POST',
        success: function(response) {
            var json = jQuery.parseJSON(response)
            // $('#len').html(json.len)
            console.log(response);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function checkDeckStringExistence(form_input) {
    var status = document.getElementById("status");

    // console.log(form_input.value)
    var re = /AAE\S*/
    var deckstring = re.exec(form_input.value)
    // console.log(deckstring)

    if (deckstring != null) {
        form_input.value = deckstring[0]

        status.innerHTML = 'Seems like code';
        status.style.color = '#1ab613';
        download.disabled = false;
    } else {
        status.innerHTML = 'Code not found';
        status.style.color = '#db3a3a';
        // status.style.background = '#BFA487';
    }
    
}



var options_btn = document.getElementById("options");
var block_options = document.getElementById('block_options');
block_options.style.display = (block_options.style.display == 'none') ? '' : 'none'
options_btn.onclick = function() {
    console.log(block_options)
    block_options.style.display = (block_options.style.display == 'none') ? '' : 'none'
}