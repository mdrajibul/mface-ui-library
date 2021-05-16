/**
 * MF.plugin.message.js
 * @package js/MF/plugin
 * @class MF.plugin
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * used for common layout event .
 *
 */
MF.plugin.NotificationMessage = (function () {

    var defaults = {
        template: "<div class=\"notifyMessagePanel\">\
                        <div class=\"image-panel\"></div>\
                        <div class=\"message\"></div>\
                        <div class=\"close\">X</div>\
                    </div>",
        message: 'Loading...',
        messageType: 'loading',// loading,success,failure,warning,
        showIcon: true
    };

    var messageMainContainer;
    var messageContainer;
    var hideShowCounter = 0;

    function initialize(options) {
        if (options) {
            $.extend(defaults, options, true);
        }
        messageMainContainer = $("body").find("#notificationContainer");
        if (messageMainContainer.length < 1) {
            messageMainContainer = $("<div/>").attr("id", "notificationContainer");
            $("body").append(messageMainContainer);
        }
        messageContainer = $(defaults.template);
        setMessageType();
        setMessage();
        showNotification();
        messageContainer.find(".close").bind("click.notification", function () {
            hideNotification(200, $(this));
        });
        // auto hide
        var timeLimit = 2000;
        messageMainContainer.find(".notifyMessagePanel").each(function () {
            var currEl = $(this);
            timeLimit += 1500;
            var notificationTimer = currEl.data("notificationTimer");
            if (notificationTimer) {
                clearTimeout(notificationTimer);
            }
            var timerObj = setTimeout(function () {
                currEl.find(".close").trigger("click.notification");
            }, timeLimit);
            currEl.data("notificationTimer", timerObj);
        });
        // mouse over effect
        timeLimit = 2000;
        messageMainContainer.find(".notifyMessagePanel").each(function () {
            var currEl = $(this);
            timeLimit += 1500;
            currEl.unbind("mouseover").bind("mouseover",function () {
                var notificationTimer = currEl.data("notificationTimer");
                clearTimeout(notificationTimer);
            }).unbind("mouseout").bind("mouseout", function () {
                    var timerObj = setTimeout(function () {
                        currEl.find(".close").trigger("click.notification");
                    }, timeLimit);
                    currEl.data("notificationTimer", timerObj);
                });
        });
    }

    function setMessageType(messageType) {
        if (messageContainer) {
            var messagePanel = messageContainer.find(".message-panel");
            var imagePanel = messageContainer.find(".image-panel");
            if (defaults.showIcon) {
                if (imagePanel.length > 0) {
                    imagePanel.addClass(messageType || defaults.messageType);
                }
            } else {
                imagePanel.remove();
            }
            if (messagePanel.length > 0) {
                messagePanel.addClass(messageType || defaults.messageType);
            }
            messageContainer.addClass(messageType || defaults.messageType);
        }
    }

    function setMessage(message) {
        if (messageContainer) {
            messageContainer.find(".message").html((message || defaults.message));
        }
    }

    function showNotification() {
        hideShowCounter = 1;
        messageMainContainer.append(messageContainer);
        // messageContainer.css({left: ($("body").width() / 2 - messageContainer.width() / 2)});
        /* messageContainer.slideDown(50, function () {
         hideShowCounter = 0;
         }); */
        messageContainer.show().animate({"right": 30}, 200, function () {
            hideShowCounter = 0;
        });
        if ($("body").find("#notificationContainer").length < 1) {
            $("body").append(messageMainContainer);
        }
    }

    function hideNotification(interval, el) {
        if (hideShowCounter == 0) {
            var container = el ? el.closest(".notifyMessagePanel") : messageContainer;
            container.animate({"right": -30}, interval || 200, function () {
                container.remove();
            });

        }
    }

    function removeAll(interval) {
        var container = $(".notifyMessagePanel");
        container.animate({"right": -30}, interval || 40, function () {
            container.remove();
        });
    }

    return {
        MESSAGE_TYPE: {
            SUCCESS: "success",
            LOADING: "loading",
            FAILURE: "failure",
            WARNING: "warning"
        },
        init: function (options) {
            initialize(options);
        },
        getContainer: function () {
            return messageContainer;
        },
        setMessageType: function (messageType) {
            setMessageType(messageType);
        },
        showNotification: function (message, messageType, removeOther) {
            if (removeOther) {
                removeAll(1);
            }
            if (message) {
                defaults.message = message;
            }
            if (messageType) {
                defaults.messageType = messageType;
            }
            initialize();
        },
        hideNotification: function (interval) {
            hideNotification(interval);
        }
    }
}());