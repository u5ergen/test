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

    var cols = document.querySelector('input[name="options_cols"]:checked').value //which radio button selected
    var hero_image = document.querySelector('input[name="options_bg_hero"]:checked').value
    var cards_shadows = document.querySelector('input[name="options_cards_shadow"]:checked').value
    var deck_name = document.getElementById('deck_name_input').value
    var options_deck_info = document.querySelector('input[name="options_deck_info"]:checked').value

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, 1792, 1200) ///! move into model

    var height_correction = (hero_image > 0) ? 300 * (cols*0.1) : 0; ///? move into model

    canvas.width = deck_info['card_width'] * cols
    canvas.height = (deck_info['card_height'] * (Math.ceil(deck_info['decklist'].length / cols))) + 20 + height_correction;

    var background_color = sliderPicker.color.rgbaString;
    console.log(background_color)

    // context.fillStyle = 'rgba(0,0,55,1)';
    context.fillStyle = background_color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (hero_image > 0) {context.drawImage(loadedImages[deck_info['class_bg_top']], 0, 0, canvas.width, canvas.width*560/2600)};  ///? move into model

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

        if (cards_shadows > 0) {
            context.shadowBlur = 20;
            context.shadowColor = "#000000";
        }

        if (deck_info['decklist'][i][1] == 2) {
            context.drawImage(loadedImages[deck_info['x2_image']['src']], 
                position_x + deck_info['x2_image']['position_correction'][0], 
                position_y + deck_info['x2_image']['position_correction'][1]);
        }

        context.drawImage(loadedImages[deck_info['images_filenames_cards'][i]], position_x, position_y);
    }

    if (deck_name.length > 0 && hero_image > 0) {
        context.shadowBlur = 0;
        context.fillStyle = 'rgba(0,0,0,0.65)';
        context.fillRect(0, 120, 430, 72);

        context.fillStyle = '#ffffff';
        context.font = "36px Roboto";
        context.textAlign = 'center';
        context.textBaseline = "middle";
        context.fillText(deck_name, 215, 156);
    }

    if (options_deck_info > 0 && hero_image > 0) {
        context.shadowBlur = 0;
        context.fillStyle = 'rgba(0,0,0,0.65)';
        context.fillRect(canvas.width - 430, 120, 430, 72);

        context.drawImage(loadedImages[deck_info['dust']], canvas.width - 290, 124)

        context.fillStyle = '#ffffff';
        context.font = "36px Roboto";
        context.textAlign = 'left';
        context.textBaseline = "middle";
        context.fillText(deck_info['deck_cost'], canvas.width - 234, 156);
    }
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

// --------------------Toggle Hidden---------------------- //
var options_btn = document.getElementById("options");
options_btn.onclick = function() {
    $("#hidden").toggle('fast');
}

