/**
 * MF.plugin.window a jquery based modal box;
 *
 * @author Md.Rajib-Ul-Islam <mdrajibul@gmail.com>
 * @param settings
 * @returns object
 */
MF.plugin.window = function (settings) {
    var config = {
        baseClass: 'w2lbox',
        id: '',
        title: 'Untitled',
        zIndex: 1000,
        style: '',
        height: undefined,
        width: undefined,
        minWidth: 200,
        minHeight: 200,
        maxHeight: undefined,
        maxWidth: undefined,
        styleTop: undefined,
        styleLeft: undefined,
        closable: true,
        closeAction: 'close', // close,hide
        draggable: true,
        resizable: false,
        collapsible: false,
        maximizable: true,
        actionToolbar: true,
        resizeCursor: 's-resize',
        closeByEscape: true,
        autoExpand: true, // Window auto expand if content increase or decrease
        dragByKey: true,
        tbar: {},
        bbar: {},
        bodyCls: '',
        extraClass: '', // extra class if needed
        listners: {
            beforeRender: undefined,
            afterRender: undefined,
            afterMaximize: undefined,
            afterRestore: undefined,
            onDrag: undefined,
            onResize: undefined,
            afterClose: undefined,
            beforeClose: undefined
        },
        autoScroll: false,
        border: true,
        modal: true,
        hideBoxByDocClick: false,
        renderTo: 'body', // where w2lbox populated
        autoLoad: { // used for autoload ajax call
            url: '',
            params: undefined,
            type: 'get',
            dataType: 'html',
            success: undefined,
            beforeSend: undefined,
            complete: undefined
        },
        html: undefined
    };
    if (settings) {
        $.extend(config, settings, true);
    }

    var thisScope = this;
    var w2lbox;
    var isDrag = false;
    var isMaximize = false;
    var isResizable = false;
    this.init = function () {
        if (config.id == "") {
            config.id = "w2lbox-" + prepareW2lboxId();
        }
        if (this.getW2lbox().length > 0) {
            this.getW2lbox().show();
        } else {
            buildW2lboxPanel();
            w2lbox = this.getW2lbox();
            if (config.html) {
                this.setContent(config.html);
            }
            if (config.autoLoad.url != '') {
                this.callAjax();
            }
            this.attachEvents();

        }
        return this;
    };
    this.getContentElement = function () {
        return w2lbox.find(".content-body");
    };
    this.setContent = function (htmlContent) {
        if (config.listners.beforeRender && $.isFunction(config.listners.beforeRender)) {
            config.listners.beforeRender(this, w2lbox, htmlContent);
        }
        var contentClass = "content-body";
        if (config.bodyCls) {
            contentClass += " " + config.bodyCls;
        }
        this.getContentElement().replaceWith($("<div class='" + contentClass + "'></div>").html(htmlContent));
        setTimeout(function () {
            thisScope.rebuild(true);
            if (config.autoLoad.success && $.isFunction(config.autoLoad.success)) {
                config.autoLoad.success(w2lbox, htmlContent);
            }
            if (config.listners.afterRender && $.isFunction(config.listners.afterRender)) {
                config.listners.afterRender(thisScope, w2lbox, htmlContent);
            }
            thisScope.rebuild();
        }, 200);
    };

    this.getW2lbox = function () {
        return $("#" + config.id);
    };
    this.setTitle = function (text) {
        var title = text || config.title;
        if (title) {
            w2lbox.find('.w2lbox-title').html(config.title);
        }
    };
    this.getTitle = function () {
        return w2lbox.find('.w2lbox-title').text();
    };

    /**
     * empty text selection. Used for utility operation.
     * @private
     */
    var clearSelection = function () {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    };

    var buildW2lboxPanel = function () {
        var w2lboxPanel = $("<div/>");
        w2lboxPanel.addClass(config.baseClass);
        if (config.extraClass) {
            w2lboxPanel.addClass(config.extraClass);
        }
        w2lboxPanel.attr("id", config.id);
        var topPanel = insertNestedRow('top');
        topPanel.find(".top-body").append($("<div/>").addClass("top-body-inner"));
        topPanel.find(".top-body-inner").append(titlePanel());
        if (config.actionToolbar === true) {
            topPanel.find(".top-body-inner").append(toolbarPanel());
        }
        w2lboxPanel.append(topPanel);
        w2lboxPanel.append(insertNestedRow('content'));
        w2lboxPanel.append(insertNestedRow('bottom'));
        if (config.style) {
            w2lboxPanel.attr('style', config.style);
        } else {
            w2lboxPanel.css({
                'visibility': 'hidden', 'position': 'absolute', 'top': -1000
            });
            if (config.width) {
                w2lboxPanel.css({
                    width: config.width
                });
            }
            if (config.height) {
                w2lboxPanel.css({
                    height: config.height
                });
            }
        }
        if (config.height) {
            w2lboxPanel.find('.content-body').css({
                width: config.width ? config.width - 18 : 'auto',
                height: config.height ? config.height - 49 : 'auto'
            });
            w2lboxPanel.find('.content-body').css({
                overflow: 'auto'
            });
        }
        if (config.maxHeight) {
            w2lboxPanel.find('.content-body').css({
                maxHeight: config.maxHeight - 49
            });
        }
        if (config.maxWidth) {
            w2lboxPanel.find('.content-body').css({
                maxWidth: config.maxWidth - 18
            });
        }
        if (config.title) {
            w2lboxPanel.find('.w2lbox-title').html(config.title);
        }
        if (!config.draggable) {
            w2lboxPanel.find(".top-left,.top-right,.top-body").css({
                cursor: 'auto'
            });
        }
        $("body").append(w2lboxPanel);
        if (config.bodyCls != "") {
            w2lboxPanel.find(".content-body").addClass(config.bodyCls);
        }
        if (config.modal === true) {
            $("body").append(maskingPanel());
        }
    };
    var insertNestedRow = function (className) {
        var rowDiv = $("<div/>");
        rowDiv.addClass(className + "-left");
        var nestedDiv = $("<div/>");
        nestedDiv.addClass(className + "-right");
        rowDiv.append(nestedDiv);
        var nestedBodyDiv = $("<div/>");
        nestedBodyDiv.addClass(className + "-body");
        nestedDiv.append(nestedBodyDiv);
        return rowDiv;
    };
    var toolbarPanel = function (className) {
        className = className ? className : "toolbar";
        var toolbarDiv = $("<div/>");
        toolbarDiv.addClass(className);
        if (config.maximizable === true) {
            var maximizeAnchor = $("<a/>");
            maximizeAnchor.addClass("maximize");
            maximizeAnchor.attr("href", "#");
            maximizeAnchor.attr("title", "Maximize Window");
            toolbarDiv.append(maximizeAnchor);

            var restoreAnchor = $("<a/>");
            restoreAnchor.addClass("restore");
            restoreAnchor.attr("href", "#");
            restoreAnchor.attr("title", "Restore Window");
            toolbarDiv.append(restoreAnchor.hide());
        }
        if (config.closable === true) {
            var closeAnchor = $("<a/>");
            closeAnchor.addClass("close");
            closeAnchor.attr("href", "#");
            closeAnchor.attr("title", "Close Window");
            toolbarDiv.append(closeAnchor);
        }
        return toolbarDiv;
    };

    var titlePanel = function () {
        var titleDiv = $("<div/>");
        titleDiv.addClass('w2lbox-title');
        return titleDiv;
    };

    var maskingPanel = function () {
        var maskingDiv = $("<div/>");
        maskingDiv.addClass("w2lbox-masking");
        maskingDiv.attr("id", "masking-" + config.id);
        return maskingDiv;
    };
    this.getMask = function () {
        return $("#masking-" + config.id);
    };
    this.rebuild = function (notVisible) {
        var getBodyOffset = this.getBodyOffset();
        var getW2lboxOffset = this.getW2lboxOffset();
        var existW2lboxLength = getExistW2lboxLength();
        var autoFixedSize = 0;
        if (existW2lboxLength > 1) {
            autoFixedSize = existW2lboxLength * 10;
        }
        var left = Math.abs((getBodyOffset.width / 2) - (getW2lboxOffset.width / 2) + getWindowScrollLeft());
        var top = Math.abs((getBodyOffset.height / 2) - (getW2lboxOffset.height / 2) + getWindowScrollTop());
        if (getW2lboxOffset.width >= getBodyOffset.width) {
            left = getWindowScrollLeft();
        }
        if (getW2lboxOffset.height >= getBodyOffset.height) {
            top = getWindowScrollTop();
        }
        w2lbox.css({
            'left': config.styleLeft ? config.styleLeft : parseInt(left, 10) + autoFixedSize,
            'top': config.styleTop ? config.styleTop : parseInt(top, 10) + autoFixedSize,
            'visibility': notVisible ? 'hidden' : 'visible',
            'z-index': this.getZindex()
        });
        if (config.autoScroll) {
            var toBottomHeight = w2lbox.find(".top-body").outerHeight() + w2lbox.find(".bottom-body").outerHeight();
            w2lbox.find(".content-body").css({maxWidth: getBodyOffset.width - 18, maxHeight: (getBodyOffset.height - toBottomHeight), overflow: 'auto'});
        }

        $("#masking-" + config.id).css({
            'z-index': parseInt(this.getZindex(), 10) - 1
        });
        $("#wmboxLoad").remove();
    };

    var getExistW2lboxLength = function () {
        return $("." + config.baseClass).length;
    };

    var prepareW2lboxId = function () {
        var w2lboxLength = getExistW2lboxLength();
        return parseInt(w2lboxLength, 10) + 1;
    };
    var getWindowScrollTop = function () {
        return $("body").scrollTop();
    };
    var getWindowScrollLeft = function () {
        return $("body").scrollLeft();
    };

    this.getZindex = function () {
        return parseInt(config.zIndex, 10) + (prepareW2lboxId() * 2);
    };

    this.getBodyOffset = function () {
        var bodyOffset = {};
        bodyOffset.width = $("body").outerWidth();
        bodyOffset.height = $("body").outerHeight();
        return bodyOffset;
    };

    this.getW2lboxOffset = function () {
        var w2lOffset = {};
        var w2lbox = this.getW2lbox();
        w2lOffset.width = parseInt(config.width ? config.width : w2lbox.outerWidth(), 10);
        w2lOffset.height = parseInt(config.height ? config.height : w2lbox.outerHeight(), 10);
        return w2lOffset;
    };

    function setDraggable() {
        // var w2lbox = thisScope.getW2lbox();
        if (config.draggable) {
            w2lbox.draggable({
                iframeFix: true,
                scroll: false,
                handle: '.top-left',
                stop: function () {
                    var el = $(this);
                    var elOffset = el.offset();
                    var elWidth = el.width();
                    var elHeight = el.height();
                    var bodyOffset = thisScope.getBodyOffset();
                    var scrollTop = getWindowScrollTop();
                    if (elOffset.top < 5) {
                        el.css("top", 0);
                    }
                    if (elOffset.left < 5) {
                        el.css("left", 0);
                    }
                    if (elOffset.left + elWidth > bodyOffset.width) {
                        var leftPosition = bodyOffset.width - elWidth;
                        if (leftPosition < 1) {
                            leftPosition = 0;
                        }
                        el.css({left: leftPosition})
                    }
                    if (elOffset.top + elHeight > bodyOffset.height + scrollTop) {
                        var topPosition = (bodyOffset.height + scrollTop) - elHeight;
                        if (topPosition < 1) {
                            topPosition = 0;
                        }
                        el.css({top: topPosition})
                    }
                },
                drag: function () {
                    isDrag = true;
                    if (typeof config.listners.onDrag == 'function') {
                        config.listners.onDrag(this);
                    }
                }
            });
        } else {
            w2lbox.draggable('disable');
        }
    }

    function setResizable() {
        if (config.resizable) {
            w2lbox.resizable({
                containment: 'body',
                minHeight: 200,
                minWidth: 400,
                resize: function (event, ui) {
                    isResizable = true;
                    if (typeof config.listners.onResize == 'function') {
                        config.listners.onResize(this, event, ui);
                    } else {
                        w2lbox.css({"width": ui.size.width});
                        var padded = w2lbox.find(".content-left").outerWidth(true) - w2lbox.find(".content-right").width();
                        w2lbox.find('.content-body').css({"width": ui.size.width - padded});
                        if (ui.size.height + 12 < $(window).height()) {
                            w2lbox.css({'height': ui.size.height});
                            w2lbox.find('.content-body').css({'height': ui.size.height - 54});
                        }
                    }
                },
                stop: function () {
                    clearSelection();
                }
            });
        } else {
            //w2lbox.resizable('disable');
            //isResizable = false;
        }
    }

    this.close = function (force) {
        if (config.closable === true || force) {
            if (typeof config.listners.beforeClose == 'function') {
                config.listners.beforeClose(w2lbox, this);
            }
            var maskPanel = this.getMask();
            if (config.closeAction == 'hide') {
                w2lbox.hide();
                maskPanel.hide();
            } else {
                w2lbox.remove();
                maskPanel.remove();
                $(document).unbind('keydown.w2lbox');
            }
            if (typeof config.listners.afterClose == 'function') {
                config.listners.afterClose(w2lbox, this);
            }
        }
    };
    this.show = function () {
        w2lbox.show();
        this.getMask().show();
    };
    var maximizePreStyle = {};

    function restore(isInternal) {
        maximizePreStyle.content ? thisScope.getContentElement().attr("style", maximizePreStyle.content) : thisScope.getContentElement().removeAttr("style");
        maximizePreStyle.content ? w2lbox.find(".content-left").attr("style", maximizePreStyle.content) : w2lbox.find(".content-left").removeAttr("style");
        maximizePreStyle.content ? w2lbox.find(".content-right").attr("style", maximizePreStyle.content) : w2lbox.find(".content-right").removeAttr("style");
        w2lbox.attr("style", maximizePreStyle.container);
        w2lbox.find(".restore").hide();
        w2lbox.find(".maximize").show();
        setDraggable();
        setResizable();
        isMaximize = false;
        if (isInternal) {
            if (config.listners.afterRestore && typeof config.listners.afterRestore == 'function') {
                config.listners.afterRestore(this, w2lbox);
            }
        }
    }

    function maximize(isInternal) {
        var bodyOffset = thisScope.getBodyOffset();
        maximizePreStyle.content = thisScope.getContentElement().attr("style");
        maximizePreStyle.container = w2lbox.attr("style");
        var elCss = {'width': bodyOffset.width, 'height': bodyOffset.height, 'maxHeight': "none"};
        w2lbox.find(".content-left").css(elCss);
        w2lbox.find(".content-right").css(elCss);
        thisScope.getContentElement().css(elCss);
        w2lbox.css({'position': 'fixed', 'top': 0, 'left': 0, 'width': bodyOffset.width, 'height': bodyOffset.height});
        w2lbox.find(".maximize").hide();
        w2lbox.find(".restore").show();
        w2lbox.draggable('disable');
        w2lbox.resizable('disable');
        isMaximize = true;
        if (isInternal) {
            if (config.listners.afterMaximize && typeof config.listners.afterMaximize == 'function') {
                config.listners.afterMaximize(this, w2lbox);
            }
        }
    }

    function setMaximizeRestore() {
        var topBody = w2lbox.find(".top-body");
        w2lbox.find("a.maximize").click(function (e) {
            topBody.addClass("headerMax");
            maximize(true);
            e.preventDefault();
        });
        w2lbox.find("a.restore").click(function (e) {
            topBody.removeClass("headerMax");
            restore(true);
            e.preventDefault();
        });
        maximizeByHeader();
    }

    this.maximize = function () {
        maximize();
    };
    this.restore = function () {
        restore();
    };
    function maximizeByHeader() {
        w2lbox.find(".top-body").bind("dblclick", function (e) {
            var el = $(this);
            if (!$(e.target).parent().hasClass("toolbar")) {
                if (!el.hasClass('headerMax')) {
                    el.addClass("headerMax");
                    maximize(true);
                } else {
                    restore(true);
                    el.removeClass("headerMax");
                }
            }
            clearSelection();
            e.preventDefault();
        });
    }

    this.attachEvents = function () {
        setCloseEvent();
        if (config.maximizable) {
            setMaximizeRestore();
        }
        setDraggable();
        setResizable();
        //rebuildZIndex();

        if (config.closeByEscape === true) {
            closeByEscapeKey();
        }
    };
    var setCloseEvent = function () {
        w2lbox.find("a.close").click(function () {
            thisScope.close();
            return false;
        });
    };

    var closeByEscapeKey = function () {
        $(document).bind('keydown.w2lbox', function (e) {
            if (e.keyCode == 27) {
                thisScope.close();
            }
            return true;
        });
    };

    var rebuildZIndex = function () {
        w2lbox.click(function () {
            var w2lboxLength = getExistW2lboxLength();
            var zIndex = parseInt(config.zIndex, 10) + 1;
            $(".w2lbox").each(function (i) {
                $(this).css({
                    'z-index': zIndex
                });
                zIndex = parseInt(zIndex, 10) + (i * 2);
            });
            w2lbox.css({
                'z-index': zIndex
            });
            var maskZIndex = config.zIndex;
            $(".w2lbox-masking").each(function (i) {
                $(this).css({
                    'z-index': maskZIndex
                });
                maskZIndex = parseInt(maskZIndex, 10) + ((i * 2) - 1);
            });
        });
    };
    this.callAjax = function () {
        $.ajax({
            url: config.autoLoad.url,
            data: config.autoLoad.params,
            type: config.autoLoad.type,
            dataType: config.autoLoad.dataType,
            cache: false,
            success: function (data) {
                thisScope.setContent(data);
            },
            beforeSend: function () {
                if ($.isFunction(config.autoLoad.beforeSend)) {
                    config.autoLoad.beforeSend();
                } else {
                    $("body").append('<img id="wmboxLoad" style="position:fixed;top:44%;left:46%;z-index:9999;" src="' + IMAGEPATH + 'system/plugin/w2lbox/loader.gif" alt="Loading...">');
                }
            },
            complete: function () {
                if ($.isFunction(config.autoLoad.complete)) {
                    config.autoLoad.complete();
                }
            }
        });
    };
    this.init();
    $(window).bind("resize.w2lbox", function () {
        if (isMaximize) {
            maximize(true);
        } else {
            thisScope.rebuild();
        }
    });
    if (config.autoExpand && w2lbox) {
        w2lbox.find(".content-left").bind("click.w2lbox", function () {
            if (!isDrag && !isMaximize && !isResizable) {
                thisScope.rebuild();
            }
            if (parseInt(w2lbox.css('top'), 10) < 5) {
                w2lbox.css("top", 0);
            }
        });
    }
};