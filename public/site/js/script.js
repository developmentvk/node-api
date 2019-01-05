'use strict';

$(function () {


    /*
    |--------------------------------------------------------------------------
    | Configure your website
    |--------------------------------------------------------------------------
    |
    | We provided several configuration variables for your ease of development.
    | Read their complete description and modify them based on your need.
    |
    */

    thesaas.config({

        /*
        |--------------------------------------------------------------------------
        | Google API Key
        |--------------------------------------------------------------------------
        |
        | Here you may specify your Google API key if you need to use Google Maps
        | in your application
        |
        | https://developers.google.com/maps/documentation/javascript/get-api-key
        |
        */

        googleApiKey: 'AIzaSyDRBLFOTTh2NFM93HpUA4ZrA99yKnCAsto1',

        /*
        |--------------------------------------------------------------------------
        | Google Analytics Tracking
        |--------------------------------------------------------------------------
        |
        | If you want to use Google Analytics, you can specify your Tracking ID in
        | this option. Your key would be a value like: UA-12345678-9
        |
        */

        googleAnalyticsId: '',

        /*
        |--------------------------------------------------------------------------
        | Smooth Scroll
        |--------------------------------------------------------------------------
        |
        | If true, the browser's scrollbar moves smoothly on scroll and gives your
        | visitor a better experience for scrolling.
        |
        */

        smoothScroll: true

    });





    /*
    |--------------------------------------------------------------------------
    | Custom Javascript code
    |--------------------------------------------------------------------------
    |
    | Now that you configured your website, you can write additional Javascript
    | code below this comment. You might want to add more plugins and initialize
    | them in this file.
    |
    */


    // CHAT BOOT MESSENGER////////////////////////


    $(document).ready(function () {
        $(".chat_on").click(function () {
            $(".layout").toggle();
            $(".chat_on").hide(300);
        });

        $(".chat_close_icon").click(function () {
            $(".layout").hide();
            $(".chat_on").show(300);
        });

        $('.messenger_messenger').on('input', '[name=input_chat_box]', function (e) {
            visibleFooterButton();
        });

        $(".messenger_messenger").on('keypress', '[name=input_chat_box]', function (e) {
            if (e.which == 10 || e.which == 13) {
                e.preventDefault();
                $(".messenger_messenger").find('.input_button-send').click();
            }
        });

        $(".messenger_messenger").on('click', '.input_button-send', function (e) {
            e.preventDefault();
            let message_value = $.trim($('[name=input_chat_box]').val());
            if (message_value.length > 0) {
                let timestamp = moment(new Date()).format('hh:mm A');
                let html = `<div class="answer left">
                    <div class="avatar">
                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="User name">
                        <div class="status online"></div>
                    </div>
                    <div class="name">Alexander Herthic</div>
                    <div class="text">${message_value}</div>
                    <div class="time">${timestamp} <small><i>sending...</i></small></div>
                </div>`;
                html += `<div class="answer right">
                    <div class="avatar">
                        <img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="User name">
                        <div class="status offline"></div>
                    </div>
                    <div class="name">Alexander Herthic</div>
                    <div class="text">${message_value}</div>
                    <div class="time">${timestamp}</div>
                </div>`;
                $('.messenger_content').find('.messages_list').append(html);
                $('[name=input_chat_box]').val('');
                scrollToBottom();
            }
        });

        function visibleFooterButton() {
            let message_value = $.trim($('[name=input_chat_box]').val());
            if (message_value.length > 0) {
                $('.input_button-attachment').css('display', "none");
                $('.input_button-send').css('display', "block");
            } else {
                $('.input_button-attachment').css('display', "block");
                $('.input_button-send').css('display', "none");
            }
        }

        function buildFooterButton() {
            return `<div class="input input-blank">
                <textarea class="input_field" name="input_chat_box" placeholder="Send a message..." style="height: 20px;"></textarea>
                <button class="input_button input_button-emoji">
                    <div class="icon" style="width: 18px; height: 18px;">
                        <svg width="56px" height="56px" viewBox="1332 47 56 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 18px; height: 18px;">
                            <g id="emoji" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(1332.000000, 47.000000)">
                                <path d="M28,56 C12.536027,56 0,43.463973 0,28 C0,12.536027 12.536027,0 28,0 C43.463973,0 56,12.536027 56,28 C56,43.463973 43.463973,56 28,56 Z M28,50 C40.1502645,50 50,40.1502645 50,28 C50,15.8497355 40.1502645,6 28,6 C15.8497355,6 6,15.8497355 6,28 C6,40.1502645 15.8497355,50 28,50 Z" id="Oval-8" fill="#96AAB4" fill-rule="nonzero"></path>
                                <path d="M28,47 C18.0588745,47 10,38.9411255 10,29 C10,27.5224898 11.5469487,26.5550499 12.8754068,27.2017612 C13.0116063,27.2662365 13.0926181,27.3037345 13.1866998,27.3464814 C13.4611235,27.4711684 13.7819537,27.6111958 14.1451774,27.7627577 C15.1908595,28.199088 16.3591406,28.6365764 17.6173846,29.0449298 C21.1841638,30.2025005 24.7379224,30.8945075 28,30.8945075 C31.2620776,30.8945075 34.8158362,30.2025005 38.3826154,29.0449298 C39.6408594,28.6365764 40.8091405,28.199088 41.8548226,27.7627577 C42.2180463,27.6111958 42.5388765,27.4711684 42.8133002,27.3464814 C42.9073819,27.3037345 42.9883937,27.2662365 43.0558366,27.2344634 C44.4530513,26.5550499 46,27.5224898 46,29 C46,38.9411255 37.9411255,47 28,47 Z M28,43 C34.6510529,43 40.2188483,38.3620234 41.6456177,32.1438387 C40.9980758,32.3847069 40.320642,32.6213409 39.6173846,32.8495777 C35.6841638,34.1260741 31.7379224,34.8945075 28,34.8945075 C24.2620776,34.8945075 20.3158362,34.1260741 16.3826154,32.8495777 C15.679358,32.6213409 15.0019242,32.3847069 14.3543823,32.1438387 C15.7811517,38.3620234 21.3489471,43 28,43 Z" id="Oval-8" fill="#96AAB4" fill-rule="nonzero"></path>
                                <path d="M19,15 L19,20 C19,21.1045695 19.8954305,22 21,22 C22.1045695,22 23,21.1045695 23,20 L23,15 C23,13.8954305 22.1045695,13 21,13 C19.8954305,13 19,13.8954305 19,15 Z" id="Line" fill="#96AAB4" fill-rule="nonzero"></path>
                                <path d="M32,15 L32,20 C32,21.1045695 32.8954305,22 34,22 C35.1045695,22 36,21.1045695 36,20 L36,15 C36,13.8954305 35.1045695,13 34,13 C32.8954305,13 32,13.8954305 32,15 Z" id="Line-Copy-2" fill="#96AAB4" fill-rule="nonzero"></path>
                            </g>
                        </svg>
                    </div>
                </button>
                <button class="input_button input_button-attachment">
                    <div class="icon" style="width: 18px; height: 18px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" ratio="1">
                            <circle cx="16.1" cy="6.1" r="1.1"></circle>
                            <rect fill="none" stroke="#96AAB4" x="0.5" y="2.5" width="19" height="15"></rect>
                            <polyline fill="none" stroke="#96AAB4" stroke-width="1.01" points="4,13 8,9 13,14"></polyline>
                            <polyline fill="none" stroke="#96AAB4" stroke-width="1.01" points="11,12 12.5,10.5 16,14"></polyline>
                        </svg>
                    </div>
                </button>
                <button class="input_button input_button-send" style="display:none">
                    <div class="icon" style="width: 18px; height: 18px;">
                        <svg width="57px" height="54px" viewBox="1496 193 57 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 18px; height: 18px;">
                            <g id="Group-9-Copy-3" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(1523.000000, 220.000000) rotate(-270.000000) translate(-1523.000000, -220.000000) translate(1499.000000, 193.000000)">
                                <path d="M5.42994667,44.5306122 L16.5955554,44.5306122 L21.049938,20.423658 C21.6518463,17.1661523 26.3121212,17.1441362 26.9447801,20.3958097 L31.6405465,44.5306122 L42.5313185,44.5306122 L23.9806326,7.0871633 L5.42994667,44.5306122 Z M22.0420732,48.0757124 C21.779222,49.4982538 20.5386331,50.5306122 19.0920112,50.5306122 L1.59009899,50.5306122 C-1.20169244,50.5306122 -2.87079654,47.7697069 -1.64625638,45.2980459 L20.8461928,-0.101616237 C22.1967178,-2.8275701 25.7710778,-2.81438868 27.1150723,-0.101616237 L49.6075215,45.2980459 C50.8414042,47.7885641 49.1422456,50.5306122 46.3613062,50.5306122 L29.1679835,50.5306122 C27.7320366,50.5306122 26.4974445,49.5130766 26.2232033,48.1035608 L24.0760553,37.0678766 L22.0420732,48.0757124 Z" id="sendicon" fill="#96AAB4" fill-rule="nonzero"></path>
                            </g>
                        </svg>
                    </div>
                </button>
            </div>`;
        }

        function scrollToBottom() {
            var height = 0;
            $('div.messenger_content div.messages_list div.answer').each(function (i, value) {
                height += parseInt($(this).height());
            });
            height += '';
            $('div.messenger_content div.messages').animate({ scrollTop: height });
            visibleFooterButton();
            $('.answer').find('.time small').remove();
        }

        $('.messenger_content').on('click', '#lc-chat-register-button', function (e) {
            e.preventDefault();
            $('.messenger_content').find('.messages_list').html('');
            $('.messenger_content').find('.chat_footer').html(buildFooterButton());

        });
    });

});
