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

        $(".messenger_messenger").on('keypress', '[name=input_chat_box], .emoji-wysiwyg-editor', function (e) {
            if (e.which == 10 || e.which == 13) {
                e.preventDefault();
                $(".messenger_messenger").find('.input_button-send').click();
            }
        });

        $(".messenger_messenger").on('click', '.input_button-send', function (e) {
            e.preventDefault();
            let message_value = $.trim($("[name=input_chat_box]")[0].emojioneArea.getText());
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
                $("[name=input_chat_box]")[0].emojioneArea.hidePicker();
                $('.emojionearea-editor').empty();
                scrollToBottom();
            }
        });

        function visibleFooterButton() {
            let message_value = $.trim($("[name=input_chat_box]")[0].emojioneArea.getText());
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
                <textarea class="input_field" name="input_chat_box"></textarea>
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
            drawEmoji();
        });

        function drawEmoji() {
            $("[name=input_chat_box]").emojioneArea({
                pickerPosition: "top",
                filtersPosition: "top",
                tonesStyle: "checkbox",
                searchPosition: "top",
                spellcheck: true,
                autocomplete: "on",
                placeholder: "Type something here",
                searchPlaceholder: "Search",
                buttonTitle: "Use the TAB key to insert emoji faster",
                dir: "ltr",
                events: {
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    focus: function (editor, event) {
                        // console.log('event:focus');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    blur: function (editor, event) {
                        // console.log('event:blur');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    mousedown: function (editor, event) {
                        // console.log('event:mousedown');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    mouseup: function (editor, event) {
                        // console.log('event:mouseup');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    click: function (editor, event) {
                        // console.log('event:click');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    keyup: function (editor, event) {
                        visibleFooterButton();
                        // console.log('event:keyup');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    keydown: function (editor, event) {
                        visibleFooterButton();
                        // console.log('event:keydown');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    keypress: function (editor, event) {
                        // console.log('event:keypress');
                        visibleFooterButton();
                        if (event.which == 10 || event.which == 13) {
                            event.preventDefault();
                            $(".messenger_messenger").find('.input_button-send').click();
                        }
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    paste: function (editor, event) {
                        // console.log('event:paste');
                    },
                    /**
                     * @param {jQuery} editor EmojioneArea input
                     * @param {Event} event jQuery Event object
                     */
                    change: function (editor, event) {
                        // console.log('event:change');
                    },
                    /**
                     * @param {jQuery} filter EmojioneArea filter
                     * @param {Event} event jQuery Event object
                     */
                    filter_click: function (filter, event) {
                        // console.log('event:filter.click, filter=' + filter.data("filter"));
                    },
                    /**
                     * @param {jQuery} button EmojioneArea emoji button
                     * @param {Event} event jQuery Event object
                     */
                    emojibtn_click: function (button, event) {
                        // console.log('event:emojibtn.click, emoji=' + button.children().data("name"));
                    },
                    /**
                     * @param {jQuery} button EmojioneArea left arrow button
                     * @param {Event} event jQuery Event object
                     */
                    arrowLeft_click: function (button, event) {
                        // console.log('event:arrowLeft.click');
                    },
                    /**
                     * @param {jQuery} button EmojioneArea right arrow button
                     * @param {Event} event jQuery Event object
                     */
                    arrowRight_click: function (button, event) {
                        // console.log('event:arrowRight.click');
                    }
                }
            });
        }
    });

});
