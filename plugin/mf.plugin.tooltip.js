/**
 * MF.plugin.toolTip a jquery based tab panel;
 *
 * @author Md.Rajib-Ul-Islam <mdrajibul@gmail.com>
 * @param settings
 * @returns object
 */
MF.plugin.toolTip = function (settings) {
    var thisClass = this;
    var TEMPLATETYPE = MF.plugin.toolTip.TEMPLATETYPE;
    var POSITION = MF.plugin.toolTip.POSITION;

    var config = {
        selector: undefined,// selector where tooltip panel create
        container: $("body"),// selector where tooltip panel create
        cls: "",// extra class for design
        style: "",// extra style for design
        position: POSITION.BOTTOM,//
        leftIndent: 5,
        topIndent: 5,
        stickyBackground: "#f7f700",// yellow
        stickyFontColor: "#000000",
        template: TEMPLATETYPE.PLAIN,// sticky,dialog,plain
        content: "",// text or object of ajax for tooltip
        autoHide: true,// auto hide tooltip
        cache: true, // data cache or not
        afterShow: undefined,// after tab content load event,
        onDrag: undefined,
        onResize: undefined,
        onClose: undefined,
        onEdit: undefined,
        editable: true,
        closable: true,
        baseZIndex: 100,
        dialogButton: {
            Close: {
                text: "Close",
                listener: {
                    click: function (el, toolTipContainer) {
                        if (toolTipContainer) {
                            toolTipContainer.remove();
                            $(".toolTip-masking").remove();
                            $(document).unbind("keydown");
                        }
                    }
                }
            }
        },
        listeners: {
            afterShow: undefined,// after tab content load event
            onDrag: undefined,
            onResize: undefined,
            onClose: undefined,
            onEdit: undefined
        }
    };

    if (settings) {
        $.extend(config, settings, true);
    }
    var thisScope = this;
    var toolTipHtml;
    var toolTipContainer;
    var toolTipBodyContainer;
    var toolTipCloseEl;
    var maskingPanel;

    this.setContent = function (content) {
        config.content = content;
    };
    this.getContent = function () {
        return config.content;
    };

    this.close = function (toolTipCont) {
        toolTipCont = toolTipCont || toolTipContainer;
        if (toolTipCont) {
            toolTipCont.remove();
            $(".toolTip-masking").remove();
            $(document).unbind("keydown");
        }
    };

    var tooltipStickyHTML = '<div class="toolTip-box sticky">\
                    <div class="toolTip-box-header"></div>\
                    <div class="toolTip-box-body"></div>\
                  </div>';

    var tooltipStickyDialogHTML = '<div class="toolTip-box dialog">\
                    <div class="toolTip-box-header"></div>\
                    <div class="toolTip-box-body"></div>\
                    <div class="toolTip-box-bottom"></div>\
                  </div>';

    var tooltipTemplateHTML = '<div class="toolTip-box plain">\
                    <div class="toolTip-box-arrow"></div>\
                    <div class="toolTip-box-content"></div>\
                  </div>';

    var loadingHTML = "<div class='tab-loader'></div>";

    function initializeVar() {
        if (config.template == TEMPLATETYPE.DIALOG) {
            toolTipHtml = tooltipStickyDialogHTML;
        } else if (config.template == TEMPLATETYPE.STICKY) {
            toolTipHtml = tooltipStickyHTML;
        } else {
            toolTipHtml = tooltipTemplateHTML;
        }
        toolTipContainer = $(toolTipHtml);
        if (config.template == TEMPLATETYPE.PLAIN) {
            var existToolTipEl = config.container.find(".toolTip-box.plain");
            if (existToolTipEl.length > 0) {
                toolTipContainer = existToolTipEl;
            } else {
                config.container.append(toolTipContainer.hide());
            }
        } else {
            config.container.append(toolTipContainer.hide());
        }
        if (config.template == TEMPLATETYPE.DIALOG || config.template == TEMPLATETYPE.STICKY) {
            toolTipBodyContainer = toolTipContainer.find(".toolTip-box-body");
        } else {
            toolTipBodyContainer = toolTipContainer.find(".toolTip-box-content");
        }
    }

    function buildContainer() {
        if (config.cls) {
            toolTipContainer.addClass(config.cls);
        }
        if (config.style) {
            toolTipContainer.attr("style", config.style);
        }
        if (config.template == TEMPLATETYPE.DIALOG) {
            $.each(config.dialogButton, function (i, b) {
                if (b) {
                    var buttonEl = $("<button/>");
                    buttonEl.attr("type", "button");
                    buttonEl.addClass("dialog-button");
                    buttonEl.text(b.text || i);
                    if (b.listener && b.listener.click) {
                        buttonEl.bind("click", function () {
                            b.listener.click($(this), toolTipContainer);
                        });
                    }
                    toolTipContainer.find(".toolTip-box-bottom").append(buttonEl);
                }
            });
            maskingPanel = $("<div/>");
            maskingPanel.addClass("toolTip-masking");
            config.container.append(maskingPanel);
        }
        if (config.template == TEMPLATETYPE.STICKY) {
            toolTipContainer.css("background", config.stickyBackground);
            toolTipBodyContainer.css("color", config.stickyFontColor);
            if (config.closable) {
                toolTipCloseEl = $("<a href=\"#\" class=\"sticky-close\">X</a>");
                toolTipContainer.find(".toolTip-box-header").append(toolTipCloseEl);
            }
        }
        if (config.template == TEMPLATETYPE.PLAIN) {
            toolTipContainer.find(".toolTip-box-arrow").addClass(config.position);
        }
    }

    function getBodyOffset() {
        var bodyOffset = {};
        bodyOffset.width = $("body").outerWidth();
        bodyOffset.height = $("body").outerHeight();
        return bodyOffset;
    }

    var getWindowScrollTop = function () {
        return $(window).scrollTop();
    };

    function bindEvent() {
        if (config.template == TEMPLATETYPE.STICKY) {
            toolTipContainer.draggable({
                iframeFix: true,
                scroll: false,
                handle: '.toolTip-box-header',
                stop: function () {
                    var el = $(this);
                    var elOffset = el.offset();
                    var elWidth = el.width();
                    var elHeight = el.height();
                    var bodyOffset = getBodyOffset();
                    var scrollTop = getWindowScrollTop();
                    if (elOffset.top < 5) {
                        el.css("top", 0);
                    }
                    if (elOffset.left < 5) {
                        el.css("left", 0);
                    }
                    if (elOffset.left + elWidth > bodyOffset.width) {
                        el.css({left: bodyOffset.width - elWidth})
                    }
                    if (elOffset.top + elHeight > bodyOffset.height + scrollTop) {
                        el.css({top: (bodyOffset.height + scrollTop) - elHeight})
                    }
                    if (typeof config.listeners.onDrag == 'function') {
                        config.listeners.onDrag(event, ui);
                    } else if (typeof config.onDrag == 'function') {
                        config.onDrag(event, ui);
                    }
                },
                start: function () {
                    makeZIndex();
                }
            });
            toolTipContainer.resizable({
                containment: 'body',
                minHeight: 100,
                minWidth: 100,
                maxWidth: 600,
                maxHeight: 600,
                resize: function (event, ui) {
                    toolTipBodyContainer.css({height: ui.size.height - 40});
                    if (ui.size.height < $(window).height()) {
                        toolTipBodyContainer.css({height: ui.size.height - 40});
                    }
                },
                start: function () {
                    makeZIndex();
                    toolTipBodyContainer.css({height: "auto", width: "auto"});
                },
                stop: function (event, ui) {
                    if (typeof config.listeners.onResize == 'function') {
                        config.listeners.onResize(event, ui);
                    } else if (typeof config.onResize == 'function') {
                        config.onResize(event, ui);
                    }
                }
            });
        }
        if (config.template == TEMPLATETYPE.STICKY && config.closable) {
            toolTipCloseEl.bind("click", function (e) {
                $(this).closest(".toolTip-box").slideUp(400, function () {
                    $(this).remove();
                });
                if (typeof config.listeners.onClose == 'function') {
                    config.listeners.onClose($(this), thisScope);
                } else if (typeof config.onClose == 'function') {
                    config.onClose($(this), thisScope);
                }
                e.preventDefault();
            });
        }

        if (config.template == TEMPLATETYPE.STICKY && config.editable) {
            toolTipBodyContainer.attr("contenteditable", true);
            toolTipBodyContainer.bind("keyup", function () {
                if (typeof config.listeners.onEdit == 'function') {
                    config.listeners.onEdit(toolTipBodyContainer.html(), toolTipBodyContainer);
                } else if (typeof config.onEdit == 'function') {
                    config.onEdit(toolTipBodyContainer.html(), toolTipBodyContainer);
                }
            });
        }
        if (config.template == TEMPLATETYPE.DIALOG) {
            $(document).bind("keydown", function (e) {
                if (e.keyCode === 116) {
                    return false;
                }
            });
        }
        if (config.template == TEMPLATETYPE.STICKY) {
            rebuildZIndex();
        }
    }

    function rebuildZIndex() {
        toolTipContainer.bind("click", function (e) {
            var targetEl = $(e.target);
            if (!targetEl.hasClass("sticky-close")) {
                makeZIndex();
            }
        });
    }

    function makeZIndex() {
        var zIndex = config.baseZIndex;
        $(".toolTip-box.sticky").each(function (i) {
            $(this).css({
                'z-index': zIndex
            });
            zIndex = parseInt(zIndex, 10) + ((i + 1) * 2);
        });
        toolTipContainer.css({
            'z-index': zIndex
        });
    }

    function makeTooltip(currEl, settings) {
        settings = settings || config.content;
        if (typeof(settings) == "object" && settings.ajax) {
            var currElData = currEl.data("mfaceTooltip");
            if (currElData) {
                var existContent = currElData.getContent();
                if (existContent) {
                    toolTipBodyContainer.html(existContent);
                    makePosition(currEl);
                } else {
                    callAjax(settings.ajax, toolTipBodyContainer, function (content) {
                        currElData.setContent(content);
                        currEl.data("mfaceTooltip", currElData);
                        makePosition(currEl);
                    });
                }
            } else {
                callAjax(settings.ajax, toolTipBodyContainer, function (content) {
                    thisClass.setContent(content);
                    makePosition(currEl);
                });
            }
        }
        else if ((typeof(settings) == "string") || (typeof(settings) == "object" && settings.html)) {
            var dataHtml = typeof(settings) == "string" ? settings : settings.html;
            config.content = dataHtml;
            toolTipBodyContainer.html(dataHtml);
            makePosition(currEl);
            if (config.listeners.afterShow) {
                config.listeners.afterShow(dataHtml);
            }
            else if (config.afterShow) {
                config.afterShow(dataHtml);
            }
        }

    }

    function makePosition(currEl) {
        var windowViewPort = $(window).width();
        var positions = {};
        var isBody = config.container.get(0).tagName.toLowerCase() == "body";
        if (isBody) {
            positions = config.template == TEMPLATETYPE.STICKY ? config.container.offset() : currEl.offset();
        } else {
            positions = config.template == TEMPLATETYPE.STICKY ? config.container.offset() : currEl.position();
            toolTipContainer.parents().each(function () {
                var pos = $(this).css('position');
                if (pos && pos != "static") {
                    windowViewPort = $(this).width();
                    return false;
                }
            });
        }

        var topPosition = positions.top + $("body").scrollTop();
        var leftPosition = positions.left + $("body").scrollLeft();

        var width = currEl.outerWidth();
        var height = currEl.outerHeight();
        var tooltipContainerHeight = toolTipContainer.outerHeight();
        var tooltipContainerWidth = toolTipContainer.outerWidth();
        toolTipContainer.css({'visibility': 'hidden', 'display': 'block'});
        if (config.template == TEMPLATETYPE.PLAIN || (!isBody && config.template == TEMPLATETYPE.STICKY)) {
            var topPos = topPosition + config.topIndent + 5;
            var leftPos = leftPosition + config.leftIndent;
            var calculateWidth = width;
            if (tooltipContainerWidth < width) {
                calculateWidth = tooltipContainerWidth;
            }
            if ((leftPosition + tooltipContainerWidth) + 5 > windowViewPort) {
                if (config.template == TEMPLATETYPE.PLAIN) {
                    if (config.position == POSITION.LEFT) {
                        topPos -= height / 2;
                    } else if (config.position == POSITION.RIGHT) {
                        topPos -= height / 2;
                    } else if (config.position == POSITION.TOP || config.position == POSITION.BOTTOM) {
                        topPos += height;
                    }
                }
                toolTipContainer.css({
                    right: "2px",
                    left: 'auto',
                    top: topPos + 'px'
                });
            } else {
                if (config.template == TEMPLATETYPE.PLAIN) {
                    if (config.position == POSITION.LEFT) {
                        leftPos -= (calculateWidth + tooltipContainerWidth / 2);
                        if (leftPos < 1) {
                            leftPos = 0;
                        }
                        topPos -= (height / 2 + tooltipContainerHeight / 2);
                    } else if (config.position == POSITION.RIGHT) {
                        leftPos += calculateWidth;
                        topPos -= height / 2 + tooltipContainerHeight / 2;
                    } else if (config.position == POSITION.TOP) {
                        if (tooltipContainerWidth < width) {
                            leftPos += (calculateWidth / 2);
                        } else {
                            leftPos -= (calculateWidth / 2);
                        }
                        topPos -= (height + tooltipContainerHeight / 2);
                    } else if (config.position == POSITION.BOTTOM) {
                        if (tooltipContainerWidth < width) {
                            leftPos += (calculateWidth / 2);
                        } else {
                            leftPos -= (calculateWidth / 2);
                        }
                        topPos += height;
                    }
                }
                toolTipContainer.css({
                    left: leftPos + 'px',
                    right: 'auto',
                    top: topPos + 'px'
                });
            }
            if (config.template == TEMPLATETYPE.PLAIN) {
                var toolTipArrowEl = toolTipContainer.find(".toolTip-box-arrow");
                if (config.position == POSITION.LEFT || config.position == POSITION.RIGHT) {
                    toolTipContainer.find(".toolTip-box-arrow").css({top: ((tooltipContainerHeight / 2) - (toolTipArrowEl.outerWidth() / 2))});
                } else if (config.position == POSITION.TOP || config.position == POSITION.BOTTOM) {
                    var arrowPosition = (leftPosition - leftPos) + (width / 2);
                    if ((leftPosition + tooltipContainerWidth) + 5 > windowViewPort) {
                        arrowPosition = windowViewPort - leftPosition;
                        if (tooltipContainerWidth < arrowPosition) {
                            arrowPosition = tooltipContainerWidth;
                        }
                        if (arrowPosition < 0) {
                            arrowPosition = 0
                        }
                        toolTipContainer.find(".toolTip-box-arrow").css({right: arrowPosition / 2, left: "auto"});
                    } else {
                        if (tooltipContainerWidth < arrowPosition) {
                            arrowPosition = tooltipContainerWidth / 2;
                        }
                        toolTipContainer.find(".toolTip-box-arrow").css({left: arrowPosition, right: "auto"});
                    }
                }
            }
        } else {
            if ((leftPosition + tooltipContainerWidth) + 5 > windowViewPort) {
                toolTipContainer.css({
                    right: "2px",
                    left: 'auto',
                    top: ((topPosition + height / 2 + config.topIndent + 5) - toolTipContainer.outerHeight() / 2) + 'px'
                });
            } else {
                toolTipContainer.css({
                    right: 'auto',
                    left: ((leftPosition + (width / 2) + config.leftIndent) - toolTipContainer.outerWidth() / 2) + 'px',
                    top: ((topPosition + height / 2 + config.topIndent + 5) - toolTipContainer.outerHeight() / 2) + 'px'
                });
            }
        }
        toolTipContainer.css('visibility', 'visible');
        thisClass.show(toolTipContainer);
        if (config.template == TEMPLATETYPE.PLAIN) {
            thisClass.hide(currEl);
        }
    }

    this.init = function () {
        initializeVar();
        buildContainer();
        bindEvent();
        return this;
    };

    this.run = function (el, data) {
        if (config.template == TEMPLATETYPE.PLAIN || config.template == TEMPLATETYPE.DIALOG) {
            el.unbind("mouseover").bind("mouseover", function () {
                makeTooltip(el, data);
            });
        } else {
            makeTooltip(el, data);
        }
    };

    this.load = function (event, data) {
        var newData;
        if (data.ajax) {
            newData = {ajax: data.ajax};
        }
        if (data.html) {
            newData = data.html;
        }
        var el = data.el;
        el.bind(event, function () {
            makeTooltip(el, newData)
        });
    };

    var callAjax = function (url, cHolder, callback) {
        if (typeof(callback) != "undefined" && typeof(callback) == "function")callback();
        cHolder.empty().append(loadingHTML);
        $.ajax(
            {
                url: url,
                cache: true,
                success: function (data) {
                    if (data) {
                        cHolder.empty().append(data);
                        if (typeof(callback) != "undefined" && typeof(callback) == "function")callback(data);
                    } else {
                        cHolder.empty().append("No data");
                    }
                }
            });
    };
    this.destroy = function () {
        toolTipContainer.remove();
    };
    this.hide = function (el) {
        el.unbind("mouseout").bind("mouseout", function () {
            toolTipContainer.css('display', 'none');
        });
    };
    this.show = function (el) {
        if (el.is(":hidden")) {
            el.css('display', 'block');
        }
    };

    $(document).bind("click", function (e) {
        var targetEl = $(e.target);
        if (!targetEl.hasClass("toolTip-box") && targetEl.parents(".toolTip-box").length < 1) {
            $(".toolTip-box:not(.toolTip-box.sticky,.toolTip-box.dialog)").hide();
        }
    });

    this.init();
};
MF.plugin.toolTip.TEMPLATETYPE = {
    STICKY: "sticky",
    DIALOG: "dialog",
    PLAIN: "plain"
};
MF.plugin.toolTip.POSITION = {
    DEFAULT: "default",
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right"
};
$(function () {
    $.fn.MFToolTip = function (configs, settings) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            if (!configs || typeof configs === 'object') {
                var currentEl = $(this);
                var selectConfig = {};

                var href = currentEl.attr("data-ajax");
                var rel = currentEl.attr("rel");
                if (!configs) {
                    configs = {};
                }
                if (selectConfig) {
                    $.extend(selectConfig, configs, true);
                }
                if (configs && configs.template == MF.plugin.toolTip.TEMPLATETYPE.STICKY) {
                    selectConfig.container = currentEl;
                }
                selectConfig.selector = currentEl;
                var newToolTip = new MF.plugin.toolTip(selectConfig);
                if (href && href.indexOf("#") < 0) {
                    newToolTip.run(currentEl, {ajax: href});
                } else if (href && href.indexOf("#") > -1 && rel) {
                    newToolTip.run(currentEl, rel);
                } else if (typeof(href) == "undefined") {
                    var title = currentEl.attr("title");
                    if (!title) {
                        title = currentEl.attr("data-tip");
                    } else {
                        $(this).removeAttr("title");
                    }
                    $(this).attr("data-tip", title);
                    newToolTip.run(currentEl, title);
                } else {
                    newToolTip.run(currentEl, selectConfig.content);
                }
                selectConfig.selector.data("mfaceTooltip", newToolTip);
                return newToolTip;
            } else if (typeof configs === 'string') {
                var tooltipInstance = $(this).data("mfaceTooltip");
                if (tooltipInstance) {
                    tooltipInstance[configs].apply(tooltipInstance, args);
                } else {
                    $.error('No tooltip instance found');
                }
            }
            else {
                $.error('Configuration not found');
            }
        });
    };
});
