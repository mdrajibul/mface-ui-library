/**
 * MF.utility.js
 * @package js/MF/libs
 * @class MF.utility
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * Used for basic utility functionality.
 *
 */
MF.utility = function () {
    return {
        /**
         *  used for declaring an empty function.
         *    @return void
         */
        emptyFn: function () {
        },
        /**
         *  used for general ajax call method in this cms .
         *    @param {settings} an object property
         *    @cfg {settings.url} a string type valid url
         *    @cfg {settings.data} an object type data that act as server request type data parameter
         *    @cfg {settings.type} a string type server request.[get,post,put,delete].default post
         *    @cfg {settings.afterSuccess} a custom event function which is invoked when server return a response.
         *    @cfg {settings.error} a custom event function which is invoked when server return a error or no response.
         *    @cfg {settings.beforeSend} a custom event function which is invoked before sending request.
         *    @cfg {settings.complete} a custom event function which is invoked when all process complete.
         *    @return void
         */
        callAjax: function (settings) {
            var config = {
                url: '',
                data: {},
                dataType: 'html',
                loading: true,
                type: 'post',
                notificationMessage: "Loading..",
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                success: function (data) {
                },
                error: function () {
                    $("body").MFToolTip({
                        template: MF.plugin.toolTip.TEMPLATETYPE.DIALOG,
                        content: "OOPS !! Server request failed"
                    });
                },
                beforeSend: function (notMsg) {
                    MF.plugin.NotificationMessage.showNotification(notMsg, MF.plugin.NotificationMessage.MESSAGE_TYPE.LOADING);
                },
                complete: function () {
                    MF.plugin.NotificationMessage.hideNotification();
                }
            };
            if (settings) {
                $.extend(config, settings)
            }
            $.ajax({
                type: config.type,
                url: config.url,
                data: config.data,
                cache: false,
                contentType: config.contentType,
                dataType: config.dataType,
                success: function (data) {
                    config.success(data);
                },
                error: function (data) {
                    config.error();
                },
                beforeSend: function () {
                    if (config.loading) {
                        config.beforeSend(config.notificationMessage);
                    }
                },
                complete: function () {
                    if (config.loading) {
                        config.complete();
                    }
                }
            });
        },
        /**
         *  used for reset form data
         *  @param {elm} form element object
         *    @return inherit
         */
        resetForm: function (elm) {
            return elm.get(0).reset();
        },

        /**
         *  used for SEO friendly name buildup.
         *  @param {str} a string which is manipulated as seo name
         *    @return string
         */
        seoFriendlyString: function (str) {
            if (!str) {
                return null;
            }
            str = $.trim(str.toLowerCase()).replace(/\`|\!|\%|\&|\^|\'|\"|\~|\*|\[|\]|\?/g, "").replace(/\s+/g, "-");
            return encodeURIComponent(str);
        },
        /**
         *  used for removing special character.
         *  @param {str} a string which remove special character
         *    @return string
         */
        removeSpecialChar: function (str) {
            if (!str) {
                return null;
            } else {
                return str.replace(/[^a-zA-Z 0-9]+/g, "");
            }
        },
        /**
         *  used for get full url.
         *  @param {elm} jQuery element object
         *    @return string
         * Example :
         * if your link have <a href="#item/list">Item</a>
         * Then it will produce the url - http://localhost:8080/MF/item/list
         */
        getUrl: function (elm) {
            return MF.CMSURL + elm.attr("href");
        },
        /**
         *  used for check all element in grid or table list view or other area.
         *  @param {settings} object type property
         *  @cfg {config} a private default configuration object property
         *  @cfg {config.selector} a selector name which will be handle event
         *  @cfg {config.checkEl} all selector element name/className which will be checked
         *  @cfg {config.afterShow} a custom evenet which will fire after element are checked and return checked element object for manipulation
         *  @cfg {config.isCheckbox} a boolean type property which mention the click handler is checkbox or other element
         *    @return void
         * Example :
         *  MF.utility.checkAll({selector:'#checkBtn',checkEl:'.checkElm',afterShow:function(){
         *         ... do something....
         },isCheckbox:true)
         */
        checkAll: function (settings) {
            var config = {
                selector: null,
                checkEl: null,
                afterShow: function (checkEls, el) {
                },
                isCheckbox: false
            };
            $.extend(config, settings);
            $(config.selector).bind("click", function () {
                var el = $(this);
                $(config.checkEl).each(function () {
                    var elm = $(this);
                    if (config.isCheckbox) {
                        if (el.is(":checked")) {
                            elm.prop("checked", true);
                        } else {
                            elm.prop("checked", false);
                        }
                    } else {
                        elm.prop("checked", true);
                    }
                });
                config.afterShow($(config.checkEl), el);
            })
        },
        /**
         *  used for uncheck all element in grid or table list view or other area.
         *  @param {settings} object type property
         *  @cfg {config} a private default configuration object property
         *  @cfg {config.selector} a selector name which will be handle event
         *  @cfg {config.checkEl} all selector element name/className which will be unchecked
         *  @cfg {config.afterShow} a custom evenet which will fire after element are checked and return unchecked element object for manipulation
         *  @cfg {config.isCheckbox} a boolean type property which mention the click handler is unchecked or other element
         *    @return void
         * Example :
         *  MF.utility.unCheckAll({selector:'#checkBtn',checkEl:'.checkElm',afterShow:function(){
         *         ... do something....
         },isCheckbox:true)
         */
        unCheckAll: function (settings) {
            var config = {
                selector: null, //used as selector
                checkEl: null, // which element to be checked
                afterShow: function (el) { // used after checked
                },
                isCheckbox: false // for click any checkbox globally
            };
            $.extend(config, settings);
            $(config.selector).bind("click", function () {
                $(config.checkEl).each(function () {
                    $(this).removeAttr("checked");
                });
                config.afterShow($(config.checkEl));
            })
        },
        /**
         *  used for get value for radio,checkbox input which is checked.
         *  @param {elm} a jQuery element object like $("#selector")
         *    @return string
         */
        getCheckedValue: function (elm) {
            var value = "";
            elm.each(function (i, v) {
                var el = $(this);
                if (el.attr("checked") == true) {
                    value = el.val();
                }
            });
            return value;
        },
        /**
         *  used for remove an item from array.
         *  @param {arrayName} an array item
         *  @param {arrayElement} an array data
         *    @return boolean
         */
        removeFromArray: function (arrayName, arrayElement) {
            if (arrayName.length > 0) {
                for (var i = 0; i < arrayName.length; i++) {
                    if (arrayName[i] == arrayElement) {
                        arrayName.splice(i, 1);
                        return true;
                    }
                }
            }
            return false;
        },
        /**
         *  used for generate a random string.
         *  @param {length} for output string length
         *    @return string
         */
        getRandomString: function (length) {
            var s = '';
            var randomChar = function () {
                var n = Math.floor(Math.random() * 62);
                if (n < 10) return n;
                if (n < 36) return String.fromCharCode(n + 55);
                return String.fromCharCode(n + 61);
            };
            while (s.length < length) {
                s += randomChar()
            }
            return s;
        },
        /**
         *  used for set cookie variable.
         *  @param {name} - cookie name
         *  @param {value} - cookie value
         *  @param {expires} - expires time(optional)
         *  @param {path} - path value(optional)
         *  @param {domain} - domain name(optional)
         *  @param {secure} - boolean type for mentioning cookie will be secure or not(optional)
         *    @return void
         */
        setCookie: function (name, value, expires, path, domain, secure) {
            var today = new Date();
            today.setTime(today.getTime());
            if (expires) {
                expires = expires * 1000 * 60 * 60 * 24;
            }
            var expires_date = new Date(today.getTime() + (expires));
            document.cookie = name + "::=" + value +
                ( ( expires ) ? ";expires::=" + expires_date.toGMTString() : "" ) +
                ( ( path ) ? ";path::=" + path : "" ) +
                ( ( domain ) ? ";domain::=" + domain : "" ) +
                ( ( secure ) ? ";secure::=" + secure : false );
        },
        /**
         *  used for get cookie.
         *  @param {name} - cookie name
         *    @return string
         */
        getCookie: function (name) {
            var a_all_cookies = document.cookie.split(';');
            var a_temp_cookie = '';
            var cookie_name = '';
            var cookie_value = '';
            var b_cookie_found = false;
            for (i = 0; i < a_all_cookies.length; i++) {
                a_temp_cookie = a_all_cookies[i].split('::=');
                cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
                if (cookie_name == name) {
                    b_cookie_found = true;
                    if (a_temp_cookie.length > 1) {
                        cookie_value = a_temp_cookie[1].replace(/^\s+|\s+$/g, '');
                    }
                    return cookie_value;
                }
                a_temp_cookie = null;
                cookie_name = '';
            }
            if (!b_cookie_found) {
                return null;
            }
        },
        /**
         *  used for delete cookie variable.
         *  @param {name} - cookie name
         *  @param {path} - path value(optional)
         *  @param {domain} - domain name(optional)
         *    @return void
         */
        deleteCookie: function (name, path, domain) {
            if (this.getCookie(name)) {
                document.cookie = name + "::=" +
                    ( ( path ) ? ";path::=" + path : "") +
                    ( ( domain ) ? ";domain::=" + domain : "" ) +
                    ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
            }
        },

        rowColor: function (tableElm) {
            tableElm.find('tr:even').removeClass('odd').addClass('even');
            tableElm.find('tr:odd').removeClass('even').addClass('odd');
        },
        divColor: function (divEl) {
            divEl.each(function (i) {
                var el = $(this);
                if (i % 2 == 0) {
                    el.removeClass('odd').addClass('even');
                } else {
                    el.removeClass('even').addClass('odd');
                }
            });
        },

        rowHoverBind: function (elm) {
            elm.mouseover(
                function (e) {
                    var el = $(e.target);
                    el.closest("tr").addClass("row-hover");
                }).mouseout(function (e) {
                var el = $(e.target);
                el.closest("tr").removeClass("row-hover");
            });
        },
        divHoverBind: function (elm) {
            elm.mouseover(
                function (e) {
                    $(this).addClass("div-hover");
                }).mouseout(function (e) {
                $(this).removeClass("div-hover");
            });
        },
        jsonDecode: function (str) {
            return str ? eval('(' + str + ')') : '';
        },
        /**
         * empty text selection. Used for utility operation.
         * @private
         */
        clearSelection: function () {
            if (window.getSelection) {
                if (window.getSelection().empty) {  // Chrome
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
            } else if (document.selection) {  // IE?
                document.selection.empty();
            }
        },
        ucFirst: function (str) {
            if (str && str.length > 1) {
                return str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1);
            } else if (str && str.length == 1) {
                return str.toUpperCase();
            } else {
                return "";
            }

        },
        round: function (value) {
            value = +value;

            if (isNaN(value))
                return NaN;

            // Shift
            value = value.toString().split('e');
            value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + 2) : 2)));

            // Shift back
            value = value.toString().split('e');
            return (+(value[0] + 'e' + (value[1] ? (+value[1] - 2) : -2))).toFixed(2);
        }
    }
}();
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
