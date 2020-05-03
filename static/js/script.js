function get_deck_info() {
    $.ajax({
        type: "POST",
        url: "/get_deck_info",
        data: $('form').serialize(),
        type: 'POST',
        success: function(response) {
            var deck_info = jQuery.parseJSON(response)
            // $('#len').html(json.len)
            // console.log(deck_info);


    if (deck_info['decklist'] != 0) {

        var download_btn = document.getElementById("download_btn");
        var percentage = 0;
        function update_download_btn() {
            percentage = percentage + Math.round(100/deck_info['images_filenames_all'].length)
            download_btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading... ' + percentage + '%'
        }

        var loadedImages = {};
        var promiseArray = deck_info['images_filenames_all'].map(function(image_url){
            update_download_btn()

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

        Promise.all(promiseArray).then(drawCanvas);
        }

    function drawCanvas(){
        download_btn.innerHTML = 'Download'
        download_btn.disabled = false;

        var options = {'radio_option_6': 6, 'radio_option_7': 7, 'radio_option_8': 8, 'radio_option_10': 10, }
        var cols = options[document.querySelector('input[name="options"]:checked').id] //which radio button selected

        var canvas = document.getElementById("canvas");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, 1792, 1200) ///! move into model

        var height_correction = 300 * (cols*0.1); ///? move into model

        canvas.width = deck_info['card_width'] * cols
        canvas.height = (deck_info['card_height'] * (Math.ceil(deck_info['decklist'].length / cols))) + height_correction;

        context.fillStyle = 'rgba(0,0,0,1)';
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















        },
        error: function(error) {
            console.log(error);
        }
    });
}





function downloadImage(){
    var download = document.getElementById("download");
    var image = document.getElementById("canvas").toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
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
    var status = document.getElementById("status_span");

    // console.log(form_input.value)
    var re = /AAE\S*/
    var deckstring = re.exec(form_input.value)
    // console.log(deckstring)

    if (deckstring != null) {
        form_input.value = deckstring[0]

        status.innerHTML = 'Seems like code';
        status.style.color = '#007700';
        download.disabled = false;
    } else {
        status.innerHTML = 'Code not found';
        status.style.color = '#aa0000';
        // status.style.background = '#BFA487';
    }
    
}