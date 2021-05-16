/**
 * MF.plugin.tabPanel a jquery based tab panel;
 *
 * @author Md.Rajib-Ul-Islam <mdrajibul@gmail.com>
 * @param settings
 * @returns object
 */

MF.plugin.tabPanel = function (settings) {
    var ORIENTATION = {
        TOP: "top",
        BOTTOM: "bottom",
        LEFT: "left",
        RIGHT: "right"
    };
    this.orientation = ORIENTATION;
    var config = {
        selector: null,// selector where tab panel create
        id: "", // id of tab panel. if not set ID then a automatic random id set
        cls: "",// extra class for design
        style: "",// extra style for design
        baseClass: "mface-tab-panel",// base tab panel class
        bodyClass: "mface-tab-body-panel", // body class panel for each tab item
        headerClass: "mface-tab-header-panel", // header class for each tab item
        orientation: ORIENTATION.TOP,// top,bottom,left,right
        icon: "", // global icon for each tab
        tip: "",// global tip for each tab
        quickAccess: true,// enable quick access dropdown or not
        enableSlider: true,// enable slider or not
        tabItems: [
            {
                id: "", // id of individual tab item
                header: "Tab 1",//  header of individual tab item
                content: "",// text or object of ajax for individual tab item
                url: "",// url for individual item
                icon: "",// icon of individual tab item
                tip: "",// tip of individual tab item
                isClosable: false,// individual item closable or not
                cache: true,// data cache or not
                isReload: true,
                listeners: {
                    afterLoad: undefined, // after tab content load event
                    beforeClose: undefined, // tab before item close event
                    afterClose: undefined, // tab after item close event
                    tabChanged: undefined, // tab change event. when it call then default tab change event will be loosed
                    beforeTabChanged: undefined, // before tab change event. this event fire before tab change event
                    afterTabChanged: undefined // after tab change event. this event fire after tab change event
                }
            }
        ],
        isReload: true,
        isClosable: true,// tab item closable or not
        enableAnchor: true, // enable hash/anchor or not
        contentAutoLoad: true,// load content when first time or on demand tab change
        cache: true, // data cache or not
        listeners: {
            afterLoad: undefined, // after tab content load event
            beforeClose: undefined, // tab before item close event
            afterClose: undefined, // tab after item close event
            tabChanged: undefined, // tab change event. when it call then default tab change event will be loosed
            beforeTabChanged: undefined, // before tab change event. this event fire before tab change event
            afterTabChanged: undefined // after tab change event. this event fire after tab change event
        }
    };
    if (settings) {
        $.extend(config, settings, true);
    }
    var thisScope = this;
    var tabContainer;
    var tabBodyContainer;
    var tabHeaderContainer;
    var tabHeaderItemHolder;

    var tabHeaderItemQuickAccess;
    var tabSliderLeft;
    var tabSliderRight;
    var tabHeaderHolderWidth = 0;
    var scrollRightCounter = 0;// private use to track right side slider width
    var activeTabItem;

    var tabItemStack = [];


    var mergeTabConfig = {
        id: "",
        header: "Tab 1",
        content: "",// text or object
        url: "",
        icon: "",
        tip: "",
        cache: true,
        isClosable: false,
        isReload: false,
        listeners: {
            afterLoad: undefined,
            beforeClose: undefined,
            afterClose: undefined,
            tabChanged: undefined,
            beforeTabChanged: undefined,
            afterTabChanged: undefined
        }
    };

    function buildTabHeader(settings) {
        var iconBlock = "";
        if (settings.icon) {
            if (settings.icon.startsWith("http://") || settings.icon.startsWith("https://")) {
                iconBlock = "<span class='icon url-icon'><img src='" + settings.icon + "'></span>";
            } else {
                iconBlock = "<span class='icon sprite-icon " + this.icon + "'></span>";
            }
        }
        var header = $('<li ' + (settings.tip ? 'title="' + settings.tip + '"' : '') + ' class="tab-item-header"><a href="' + ("#" + settings.id) + '" class="tab-item-link">' + iconBlock + '<span class="title">' + settings.header + '</span></a></li>');
        if (settings.isClosable) {
            header.append('<i class="close" title="Close Tab">&nbsp;</i>');
            header.css("paddingRight", 18);
        }
        if (settings.isReload) {
            var reloadIcon = $('<i class="reload" title="Reload Tab">&nbsp;</i>');
            if (settings.isClosable) {
                reloadIcon.css("right", 18);
            }
            header.append(reloadIcon);
            header.css("paddingRight", 18);
        }
        if (settings.isClosable && settings.isReload) {
            header.css("paddingRight", 32);
        }
        header.find("i.close").bind("click", function (ev) {
            close($(this), settings);
        });
        header.find("i.reload").bind("click", function (ev) {
            reload($(this), settings);
        });
        header.find("a.tab-item-link").bind("click", function (e) {
            if (settings.listeners.beforeTabChanged) {
                settings.listeners.beforeTabChanged($(this), settings);
            }
            if (settings.listeners.tabChanged) {
                settings.listeners.tabChanged($(this), settings);
            } else {
                thisScope.setActive($(this), settings);
            }
            if (settings.listeners.afterTabChanged) {
                settings.listeners.afterTabChanged($(this), settings);
            }
            if (e.originalEvent !== undefined) {
                History.navigateToPath($(this).attr("href"));
            }
            if (!config.enableAnchor) {
                e.preventDefault();
            }
        });
        return header;
    }

    function buildTabBody(settings) {
        var tabBodyItem = $("<div class=\"tab-item-body\" id=\"" + (settings.id) + "\"></div>");
        if (config.contentAutoLoad) {
            setContent(tabBodyItem, settings);
        }
        return tabBodyItem;
    }

    function makeTabSlider() {
        tabSliderLeft = $("<div class=\"tab-slider-left\"></div>");
        tabSliderRight = $("<div class=\"tab-slider-right\"></div>");
        tabHeaderContainer.append(tabSliderLeft).append(tabSliderRight);
        if (config.quickAccess) {
            if (config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM) {
                tabSliderRight.css("right", 24);
            } else {
                tabSliderRight.css("bottom", 24);
            }
        }
        tabSliderLeft.click(function () {
            updateTabSliders("left");
        });
        tabSliderRight.click(function () {
            updateTabSliders("right");
        });
        resizeHandler();
    }

    function updateTabSliders(opCode) {
        if (!tabHeaderItemHolder.is(":visible")) {
            return;
        }
        if (!tabHeaderHolderWidth) {
            resizeHandler();
            return;
        }
        tabSliderRight.removeClass("slider-disabled");
        tabSliderLeft.removeClass("slider-disabled");
        var scrollLeft = 0;
        var sliderStyle = "";
        var sliderStyleJson = {};
        if (!opCode || (opCode == "reset")) {
            if (tabHeaderHolderWidth > tabHeaderContainer.outerWidth()) {
                var padCss = config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM ? "0 22px" : "22px 0";
                if (config.quickAccess) {
                    if (config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM) {
                        padCss = "0 46px 0 22px";
                    } else {
                        padCss = "22px 0 46px 0";
                    }
                }
                if (padCss) {
                    tabHeaderContainer.css("padding", padCss);
                }
                var scrollLeftReset = 0;
                var scrollLeftResetPosition = 0;
                if (config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM) {
                    scrollLeftReset = tabHeaderItemHolder.scrollLeft();
                    scrollLeftResetPosition = tabHeaderItemHolder.position().left;
                } else {
                    scrollLeftReset = tabHeaderItemHolder.scrollTop();
                    scrollLeftResetPosition = tabHeaderItemHolder.position().top;
                }
                if (scrollLeftReset <= 0 && scrollLeftResetPosition <= 0) {
                    tabSliderLeft.addClass("slider-disabled");
                }
                tabSliderLeft.show();
                tabSliderRight.show();
            } else {
                tabSliderLeft.hide();
                tabSliderRight.hide();
                tabHeaderContainer.css("padding", 0);
            }
        } else if (opCode == "left") {
            if (config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM) {
                scrollLeft = tabHeaderItemHolder.scrollLeft();
                sliderStyle = "scrollLeft";
            } else {
                scrollLeft = tabHeaderItemHolder.scrollTop();
                sliderStyle = "scrollTop";
            }
            if (scrollLeft > 0) {
                sliderStyleJson = {};
                sliderStyleJson[sliderStyle] = scrollLeft - 100;
                tabHeaderItemHolder.animate(sliderStyleJson, 200);
            } else {
                tabSliderLeft.addClass("slider-disabled");
            }
        } else if (opCode == "right") {
            if (config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM) {
                scrollLeft = tabHeaderItemHolder.scrollLeft();
                sliderStyle = "scrollLeft";
            } else {
                scrollLeft = tabHeaderItemHolder.scrollTop();
                sliderStyle = "scrollTop";
            }
            sliderStyleJson = {};
            sliderStyleJson[sliderStyle] = scrollLeft + 100;
            tabHeaderItemHolder.animate(sliderStyleJson, 200);
            if (scrollRightCounter >= scrollLeft) {
                tabSliderRight.addClass("slider-disabled");
            }
            scrollRightCounter = scrollLeft;
        }
    }

    function resizeHandler() {
        if (tabHeaderItemHolder.is(":visible")) {
            tabHeaderHolderWidth = 0;
            tabHeaderItemHolder.find("li").each(function () {
                tabHeaderHolderWidth += $(this).outerWidth(true);
            });
            updateTabSliders();
        }
    }

    function bringInDisplay() {
        var hLeft = 0;
        var sLeft = 0;
        var sliderStyle = "";

        if (config.orientation == ORIENTATION.TOP || config.orientation == ORIENTATION.BOTTOM) {
            sLeft = tabHeaderItemHolder.scrollLeft();
            sliderStyle = "scrollLeft";
            hLeft = tabHeaderItemHolder.find("li.current").position().left;
        } else {
            sLeft = tabHeaderItemHolder.scrollTop();
            sliderStyle = "scrollTop";
            hLeft = tabHeaderItemHolder.find("li.current").position().top;
        }
        var sliderStyleJson = {};
        if (sLeft <= 0) {
            sliderStyleJson[sliderStyle] = sLeft + hLeft - 100;
            tabHeaderItemHolder.animate(sliderStyleJson, 200);
        } else {
            var hRight = hLeft + tabHeaderItemHolder.outerWidth(true);
            if (hRight > tabHeaderItemHolder.width()) {
                sliderStyleJson[sliderStyle] = hRight - tabHeaderItemHolder.width() + sLeft + 100
            }
            tabHeaderItemHolder.animate(sliderStyleJson, 200);
        }
    }

    function buildContainer() {
        if (!config.id) {
            config.id = MF.utility.getRandomString(10);
        }
        tabContainer = config.selector || $('<div/>');
        tabContainer.addClass(config.baseClass);
        tabContainer.attr("id", config.id);
        if (config.cls) {
            tabContainer.addClass(config.cls);
        }
        if (config.style) {
            tabContainer.attr("style", config.style);
        }
        tabHeaderContainer = $('<div class="' + config.headerClass + '"></div>');
        tabHeaderItemHolder = $('<ul class="tab-header-holder"></ul>');
        tabBodyContainer = $('<div class="' + config.bodyClass + '"></div>');
        tabHeaderContainer.append(tabHeaderItemHolder);
        if (config.quickAccess) {
            tabHeaderItemQuickAccess = $('<div class="tab-header-quick-access"><ul class="tab-header-holder"></ul></div>');
            tabHeaderContainer.append(tabHeaderItemQuickAccess);
        }
        if (config.orientation == ORIENTATION.BOTTOM) {
            tabContainer.append(tabBodyContainer).append(tabHeaderContainer);
        } else {
            tabContainer.append(tabHeaderContainer).append(tabBodyContainer);
        }
        tabContainer.addClass("tab-" + config.orientation);
    }

    function bindEvent() {
        if (tabHeaderItemQuickAccess) {
            tabHeaderItemQuickAccess.bind("click", function () {
                var currentTabHeaderQuickAccess = $(this);
                if (currentTabHeaderQuickAccess.hasClass("active")) {
                    currentTabHeaderQuickAccess.removeClass("active").find(".tab-header-holder").slideUp();
                } else {
                    currentTabHeaderQuickAccess.addClass("active").find(".tab-header-holder").slideDown();
                }
            });
        }
    }

    function buildHtml() {
        buildContainer();
        if (config.tabItems) {
            for (var i = 0; i < config.tabItems.length; i++) {
                var item = config.tabItems[i];
                var currentItemConfig = {};
                $.extend(currentItemConfig, mergeTabConfig, true);
                $.extend(currentItemConfig, config, true);
                $.extend(currentItemConfig, item, true);
                if (!item.id) {
                    currentItemConfig.id = "tabitem-" + (i + 1);
                }
                addItem(currentItemConfig);
            }
            tabHeaderContainer.find(".tab-item-header:first").addClass("current").show();
            tabBodyContainer.find(".tab-item-body:first").addClass("current").show();
        }
        if (config.enableSlider) {
            makeTabSlider();
        } else {
            tabHeaderContainer.addClass("tab-noWrap");
            tabHeaderItemHolder.addClass("tab-noWrap");
        }
    }

    function addItem(currentItemConfig) {
        var tabItemHeader = buildTabHeader(currentItemConfig);
        var tabItemBody = buildTabBody(currentItemConfig);
        var tabItemHeaderForQuickAccess = null;
        tabHeaderItemHolder.append(tabItemHeader);
        if (config.quickAccess) {
            tabItemHeaderForQuickAccess = tabItemHeader.clone(true);
            tabHeaderItemQuickAccess.find(".tab-header-holder").append(tabItemHeaderForQuickAccess);
        }
        tabBodyContainer.append(tabItemBody.hide());
        tabItemStack.push({
            id: currentItemConfig.id,
            config: currentItemConfig,
            header: tabItemHeader,
            quickAccess: tabItemHeaderForQuickAccess,
            body: tabItemBody
        });
    }

    function setContent(tabBodyItem, settings, acceptReload) {
        if (!acceptReload && settings.cache && tabBodyItem.hasClass("cached")) {
            return;
        }
        if (typeof settings.content == "object") {
            MF.utility.callAjax({
                url: settings.content.url,
                dataType: settings.content.dataType || "html",
                type: settings.content.type || 'get',
                success: function (resp) {
                    tabBodyItem.html(resp);
                    if (settings.listeners.afterLoad) {
                        settings.listeners.afterLoad(tabBodyItem, settings, resp);
                    }
                },
                beforeSend: function (notMsg) {
                    if (settings.content.beforeSend) {
                        settings.content.beforeSend(notMsg);
                    } else {
                        tabBodyItem.html("Loading..");
                    }
                },
                complete: function () {
                    if (settings.content.complete) {
                        settings.content.complete();
                    }
                }
            });
        } else {
            tabBodyItem.html(settings.content);
            if (settings.listeners.afterLoad) {
                settings.listeners.afterLoad(tabBodyItem, settings, settings.content);
            }
        }
        if (settings.cache) {
            tabBodyItem.addClass("cached");
        }
    }

    function close(activeScope, settings) {
        var activeObject = null;
        if (typeof activeObject == "object" && !settings) {
            activeObject = activeScope;
        } else {
            var activeId = activeScope.closest("li").find(".tab-item-link").attr("href").replace("#", "");
            activeObject = getActiveItem(activeId);
        }

        if (activeObject) {
            var activeIndex = getActiveIndex(activeObject);
            var currentActiveEl = tabHeaderItemHolder.find("li.current");
            var currentActiveIndex = activeIndex;
            if (currentActiveEl.length > 0) {
                var currentActiveId = currentActiveEl.find(".tab-item-link").attr("href").replace("#", "");
                var currentActiveObject = getActiveItem(currentActiveId);
                currentActiveIndex = getActiveIndex(currentActiveObject);
            }
            if (!settings) {
                settings = activeObject.config;
            }
            if (settings && settings.listeners.beforeClose) {
                settings.listeners.beforeClose(activeObject, settings);
            }
            var headerHref = activeObject.header.find(".tab-item-link").attr("href");
            var quickAccessMenu = tabHeaderItemQuickAccess.find("a[href=" + headerHref + "]");
            activeObject.header.remove();
            activeObject.body.remove();
            if (quickAccessMenu) {
                quickAccessMenu.remove();
            }
            if (settings && settings.listeners.afterClose) {
                settings.listeners.afterClose(activeObject, settings);
            }
            if (activeIndex != -1) {
                delete tabItemStack[activeIndex];
                activeTabItem = null;
                var loopIndex = activeIndex;
                while (tabItemStack.length > 0 && activeTabItem == null && loopIndex >= 0) {
                    if (loopIndex == 0 && tabItemStack.length > 0) {
                        activeTabItem = tabItemStack[tabItemStack.length - 1];
                    } else {
                        activeTabItem = tabItemStack[loopIndex - 1];
                    }
                    loopIndex--;
                }
                if (activeIndex == currentActiveIndex && activeTabItem) {
                    thisScope.setActive(activeTabItem, null, 1);
                }
            }
        }
    }

    function reload(activeScope, settings) {
        var activeObject = null;
        if (typeof activeObject == "object" && !settings) {
            activeObject = activeScope;
        } else {
            var activeId = activeScope.closest("li").find(".tab-item-link").attr("href").replace("#", "");
            activeObject = getActiveItem(activeId);
        }
        if (activeObject) {
            setContent(activeObject.body, settings || activeObject.config, true);
        }
    }


    function getActiveItem(selectedId) {
        var selectedItem = null;
        $.each(tabItemStack, function (i, v) {
            if (v && v.id == selectedId) {
                selectedItem = v;
                return false;
            }
        });
        return selectedItem;
    }

    function getActiveIndex(selectedObject) {
        var selectedIndex = null;
        $.each(tabItemStack, function (i, v) {
            if (v && v.id == selectedObject.id) {
                selectedIndex = i;
                return false;
            }
        });
        return selectedIndex;
    }

    this.init = function () {
        buildHtml();
        bindEvent();
        History.reLoad(function (href, event) {
            if (!event.originalEvent.state) {
                var hashUrl = event.currentTarget.location.hash;
                tabContainer.find(".tab-item-header a[href='" + (hashUrl ? hashUrl : "#" + href) + "']:not(.tab-header-quick-access a)").trigger("click");
            } else {
                location.reload();
            }
        });
        tabContainer.find(".tab-item-header a[href='" + document.location.hash + "']:not(.tab-header-quick-access a)").trigger("click");
        return this;
    };

    this.setActive = function (activeScope, settings, performUpdate) {
        var activeObject = null;
        if (typeof activeObject == "object" && !settings) {
            activeObject = activeScope;
        } else {
            var activeId = activeScope.closest("li").find(".tab-item-link").attr("href").replace("#", "");
            activeObject = getActiveItem(activeId);
        }
        if (activeObject) {
            tabHeaderContainer.find(".tab-item-header.current").removeClass("current");
            tabBodyContainer.find(".tab-item-body.current").removeClass("current").hide();
            if (config.quickAccess && activeObject.quickAccess) {
                activeObject.quickAccess.addClass("current");
            }
            activeObject.header.addClass("current");
            activeObject.body.addClass("current").show();
            activeTabItem = activeObject;
            if (!config.contentAutoLoad) {
                setContent(activeObject.body, settings || activeObject.config);
            }
            bringInDisplay();
            if (performUpdate) {
                resizeHandler();
            }
        }
    };

    this.add = function (tabConfig) {
        var currentItemConfig = {};
        $.extend(currentItemConfig, mergeTabConfig, true);
        $.extend(currentItemConfig, config, true);
        $.extend(currentItemConfig, tabConfig, true);
        if (!tabConfig.id) {
            currentItemConfig.id = "tabitem-" + (tabItemStack.length + 1);
        }
        addItem(currentItemConfig);
        this.setActive(tabItemStack[tabItemStack.length - 1], null, true);
    };

    this.delete = function (index) {
        var tabItemObj = tabItemStack[index];
        if (!tabItemObj) {
            return;
        }
        close(tabItemObj);
    };
    this.reload = function (index, tabConfig) {
        var tabItemObj = tabItemStack[index];
        if (!tabItemObj) {
            return;
        }
        var currentItemConfig = {};
        if (tabConfig) {
            $.extend(currentItemConfig, mergeTabConfig, true);
            $.extend(currentItemConfig, config, true);
            $.extend(currentItemConfig, tabConfig, true);
            tabItemObj.config = currentItemConfig;
        }
        reload(tabItemObj);
        this.setActive(tabItemObj, null, true)
    };
    this.update = function (index, tabConfig) {
        this.reload(index, tabConfig);
    };

    $(window).resize(resizeHandler);
    $(document).bind("click", function (e) {
        var targetEl = $(e.target);
        if (!targetEl.hasClass("tab-header-quick-access") && targetEl.parents(".tab-header-quick-access").length < 1) {
            tabHeaderItemQuickAccess.find(".tab-header-holder").slideUp();
        }
    });

    this.init();
};


MF.plugin.tabPanel.TABHOLDER = [];

$(function () {
    $.fn.MFTabs = function (configs, settings) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            if (!configs || typeof configs === 'object') {
                var currentEl = $(this);
                var selectConfig = undefined;
                var replacePanel;
                selectConfig = {};

                if (currentEl.attr("class")) {
                    selectConfig.cls = currentEl.attr("class");
                }
                if (currentEl.attr("style")) {
                    selectConfig.style = currentEl.attr("style");
                }
                if (currentEl.attr("id")) {
                    selectConfig.id = currentEl.attr("id");
                }

                selectConfig.tabItems = [];
                currentEl.find("ul li").each(function () {
                    var currentItem = $(this);
                    var currentItemConfig = {};
                    var currentItemAnchor = currentItem.find("a");
                    var iconEl = currentItem.find("span.icon");
                    var iconPath = "";
                    if (iconEl) {
                        if (iconEl.find("img").length > 0) {
                            iconPath = iconEl.find("img").attr("src");
                        } else {
                            iconPath = iconEl.attr("class");
                        }
                    }
                    var itemHtml = $.trim(currentItemAnchor.html());
                    var dataUrl = currentItemAnchor.attr("data-url");
                    var itemLink = currentItemAnchor.attr("href");
                    var tip = currentItem.attr("title");
                    var isClosed = currentItem.attr("data-close");
                    var isReload = currentItem.attr("data-reload");
                    var isCache = currentItem.attr("data-cache");
                    if (dataUrl) {
                        currentItemConfig.content = {};
                        currentItemConfig.content.url = dataUrl;
                    } else {
                        currentItemConfig.content = currentEl.find(itemLink).html();
                    }
                    currentItemConfig.header = itemHtml || "(untitled)";
                    if (iconPath) {
                        currentItemConfig.icon = iconPath;
                    }
                    if (tip) {
                        currentItemConfig.tip = tip;
                    }
                    if (itemLink) {
                        currentItemConfig.id = itemLink.replace("#", "");
                    }
                    currentItemConfig.isClosable = (isClosed && (isClosed == "true" || isClosed == "1")) == true;
                    currentItemConfig.cache = (isCache && (isCache == "true" || isCache == "1")) == true;
                    currentItemConfig.isReload = (isReload && (isReload == "true" || isReload == "1")) == true;
                    selectConfig.tabItems.push(currentItemConfig);
                });
                if (!configs) {
                    configs = {};
                }
                if (selectConfig) {
                    $.extend(selectConfig, configs, true);
                }
                replacePanel = $("<div/>");
                if (selectConfig.id) {
                    replacePanel.attr("id", selectConfig.id);
                    selectConfig.id = "";
                }
                if (selectConfig.cls) {
                    replacePanel.attr("class", selectConfig.cls);
                    selectConfig.cls = "";
                }
                if (selectConfig.style) {
                    replacePanel.attr("style", selectConfig.style);
                }
                currentEl.replaceWith(replacePanel);

                if (typeof selectConfig == "undefined") {
                    selectConfig = configs;
                }
                selectConfig.selector = replacePanel || $(this);
                var newTabPanel = new MF.plugin.tabPanel(selectConfig);
                selectConfig.selector.data("mfaceTabs", newTabPanel);
                MF.plugin.tabPanel.TABHOLDER.push(newTabPanel);
                return newTabPanel;

            } else if (typeof configs === 'string') {
                var tabInstance = $(this).data("mfaceTabs");
                if (tabInstance) {
                    tabInstance[configs].apply(tabInstance, args);
                } else {
                    $.error('No tab panel instance found');
                }
            }
            else {
                $.error('Configuration not found');
            }
        });
    };
});
