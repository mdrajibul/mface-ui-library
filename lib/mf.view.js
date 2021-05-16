/**
 * MF.view.js
 * @package js/MF/libs
 * @class MF.view
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * Used as view related global functionality .
 *
 */
MF.view = (function () {
    var dialog;// global dialog instance
    return {
        /**
         *
         * Combo Box Item Per Page Number
         */
        comboBoxItemPerPage: 20,
        /**
         * user access/permission variable
         */
        permission: {},
        /**
         *  used for ajax pagination.
         *  @method _loadAjaxPaginationRequest used as private variable which is useful for ajax pagination
         *  @param {settings} configuration object
         *  @cfg {settings.elm} specify element name for handling event
         *  @cfg {settings.loadEl} specify load container where data loaded.
         *  @cfg {settings.isInner} specify load data by inner method in server side(optional)
         *  @cfg {settings.appendUrl} specify extra params need to be pass when ajax call (optional)
         *  @cfg {settings.afterShow} a custom event function which is invoked when get ajax response(optional)
         *  @return void|boolean
         */
        _loadAjaxPaginationRequest: function (config, url, el) {
            if (url && config.appendUrl != null) {
                if (url.indexOf("?") < 0) {
                    url += "?";
                }
                url = url.replace(config.appendUrl, "");
                url += config.appendUrl;
            }
            var loadEl = config.loadEl ? config.loadEl : $("#" + el.parents(".tab-panel-content").attr("id"));
            var loadPanel = config.loadEl.find(".table-grid");
            if (loadPanel.length < 1) {
                loadPanel = config.loadEl;
            }
            MF.utility.callAjax({
                url: url,
                type: 'get',
                dataType: 'html',
                success: function (data) {
                    loadEl.html(data);
                    if (config.reloadEvent) {
                        config.reload = true;
                        MF.view.ajaxPagination(config);
                        MF.utility.rowColor(config.loadEl.find("table"));
                    }
                    config.afterShow();
                },
                beforeSend: function () {

                    MF.view.loadMask(loadPanel);
                },
                complete: function () {
                    MF.view.hideMask(loadPanel);
                }
            });
            return false;
        },

        ajaxPagination: function (settings) {
            var config = {
                elm: ".pagination a",
                loadEl: null,
                reloadEvent: true,
                tabElm: null,
                maxUrl: '',
                gridSearchEvent: "enter",// enter or keyup
                isInner: false,
                appendUrl: null,
                afterShow: function () {
                }
            };
            if (settings) {
                $.extend(config, settings);
            }
            var paginationLink = config.elm;
            if (typeof config.elm == "string" || config.reload) {
                paginationLink = config.loadEl.find(config.elm);
            }
            MF.view.combo.gridShowPerPageItem(config.loadEl.find(".page-showItem"), 'itemPerPageMenu', {
                cls: 'no-border', width: 100, autoWidth: false, emptyText: '',
                value: config.loadEl.find("input[name=limit]").val(),
                onSelect: function (el, data) {
                    config.loadEl.find("input[name=limit]").val(data.id);
                    config.loadEl.find(".frmSearchModule").trigger("submit");
                }
            });
            paginationLink.bind("click", function (e) {
                var el = $(this);
                var href = el.attr("href");
                if (e.originalEvent !== undefined) {
                    History.navigateToPath(href);
                }
                return MF.view._loadAjaxPaginationRequest(config, href, el);
            });
            config.loadEl.find('th a.sortable').bind("click", function (e) {
                var el = $(this);
                var href = el.attr("href");
                return MF.view._loadAjaxPaginationRequest(config, href, el);
            });
            MF.utility.checkAll({
                selector: config.loadEl.find('.checkAll'),
                checkEl: config.loadEl.find('.checked'),
                isCheckbox: true
            });
            /**
             * Search handler event bind
             */
            config.loadEl.find('th').bind("mouseover", function (e) {
                var el = $(this);
                el.find(".grid-search-handler").css({visibility: "visible"});
            });
            config.loadEl.find('.grid-search-handler').bind("click", function (e) {
                config.loadEl.find(".grid-search-handler").css({visibility: "hidden"});
                config.loadEl.find('.grid-search-panel').slideUp(100);
                var el = $(this);
                var searchPanel = el.parent().find(".grid-search-panel");
                searchPanel.is(":hidden") ? searchPanel.slideDown(100) : searchPanel.slideUp(100);
            });
            config.loadEl.find('form input[type=radio].search-inp,form input[type=checkbox].search-inp,form textarea.search-inp,form select.search-inp').bind("change",
                function (e) {
                    var currEl = $(this);
                    config.loadEl.find(".frmSearchModule").trigger("submit");
                    MF.view.focusElement(currEl);
                });
            if (config.gridSearchEvent == "keyup") {
                var keyUpCounter = 0;
                config.loadEl.find('form textarea.search-inp,form input.search-inp').bind("keyup",
                    function (e) {
                        var currEl = $(this);
                        if (keyUpCounter < 1) {
                            keyUpCounter = 1;
                            setTimeout(function () {
                                config.loadEl.find(".frmSearchModule").trigger("submit");
                                MF.view.focusElement(currEl);
                                keyUpCounter = 0;
                            }, 100000);
                        }
                    });
            }
            if (config.gridSearchEvent == "enter") {
                config.loadEl.find('form input.search-inp').keydown(function (e) {
                    var key = e.which ? e.which : e.keyCode;
                    if (key == '13') {
                        config.loadEl.find(".frmSearchModule").trigger("submit");
                        MF.view.focusElement($(this));
                    }
                });
                config.loadEl.find('form textarea.search-inp').keydown(function (e) {
                    var key = e.which ? e.which : e.keyCode;
                    if (e.ctrlKey && key == '13') {
                        config.loadEl.find(".frmSearchModule").trigger("submit");
                        MF.view.focusElement($(this));
                    }
                });
            }
            /**
             * Search handler event bind finish
             */
            $(document).bind('click.gridPagination', function (e) {
                var targetEl = $(e.target);
                if (targetEl.parents(".grid-search-menu").length < 1 && !targetEl.hasClass("grid-search-menu")) {
                    config.loadEl.find('.grid-search-panel').slideUp(100);
                    config.loadEl.find(".grid-search-handler").css({visibility: "hidden"});
                }
            });
        },
        loadMask: function (loadEl, height, loadingImagePath) {
            var elm = $("<div/>");
            elm.addClass('masking');
            loadingImagePath = loadingImagePath || MF.IMAGEPATH + "system/general/loader.gif";
            var loadingImageEl = $('<img src="' + loadingImagePath + '" alt="Loading...">');
            elm.append(loadingImageEl);
            loadEl.append(elm).show();
            var containerHeight = height || loadEl.height();
            var marginTopHeight = (containerHeight / 2) - (loadingImageEl.height() / 2);
            elm.find('img').css({'margin-top': marginTopHeight});
        },
        hideMask: function (loadEl) {
            loadEl.find(".masking").remove();
        },
        /**
         *  used for delete an item from database.
         *  @param {settings} configuration object
         *  @cfg {settings.messageElm} jQuery element object with message text which will render to dialog box.
         *  @cfg {settings.deleteElm} jQuery element object which would be deleted.
         *  @cfg {settings.urlParams} the parameters which need to be pass as request to the server(optional)
         *  @cfg {settings.title} dialogBox title(optional)
         *  @cfg {settings.width} dialogBox width.default 400(optional)
         *  @cfg {settings.height} dialogBox height.default 140(optional)
         *  @cfg {settings._showMessageBox} a private function which invoke after delete is completed
         *  @cfg {settings.afterDelete} a custom event function which is invoked after delete is completed(optional)
         *  @cfg {settings.beforeDelete} a custom event function which is invoked before delete is precessed(optional)
         *  @return void
         */
        itemDelete: function ($messageEl, url, settings) {
            var config = {
                width: 400,
                height: 140,
                title: MF.locale.common.confirm + '?',
                afterDelete: function (resp) {
                },
                showMessage: true,
                closable: false,
                dataType: "json",
                deleteMethod: "POST",
                urlParams: {},
                beforeDelete: function () {
                }
            };
            if (settings) {
                $.extend(config, settings, true);
            }

            $("body").MFToolTip({
                template: MF.plugin.toolTip.TEMPLATETYPE.DIALOG,
                content: $messageEl.html(),
                modal: true,
                title: config.title,
                width: config.width,
                closable: config.closable,
                zIndex: 2000,
                dialogButton: {
                    OK: {
                        text: MF.locale.common.yes,
                        listener: {
                            click: function () {
                                MF.utility.callAjax({
                                    url: url,
                                    data: config.urlParams,
                                    dataType: config.dataType,
                                    type: config.deleteMethod,
                                    loading: false,
                                    success: function (data) {
                                        config.afterDelete(data);
                                        $("body").MFToolTip("close");
                                    },
                                    beforeSend: function () {
                                        $("body").MFToolTip("close");
                                        MF.plugin.NotificationMessage.showNotification(MF.locale.common.deleting + "...");
                                    }
                                });
                            }
                        }
                    },
                    Close: {
                        text: MF.locale.common.no,
                        listener: {
                            click: function (el, toolTipContainer) {
                                $("body").MFToolTip("close");
                            }
                        }
                    }
                }
            });
        },
        setDefaultFormBeforeSend: function ($form, config) {
            $("body").addClass("curWait");
            config._btnValue = $form.find(".btnSubmit").html();
            if (config.btnLoadingText) {
                $form.find(".btnSubmit").html(config.btnLoadingText);
            }
            $form.find(".btnSubmit").attr("disabled", true);
            if (config.autoModal) {
                MF.view.loadMask($form);
            }
        },
        setDefaultFormAfterSuccess: function ($form, config) {
            $("body").removeClass("curWait");
            config.buttonEnabled($form);
            if (config.autoModal) {
                MF.view.hideMask($form);
            }
        },
        /**
         * Simple form submit function.
         * @param $form - jQuery from element object
         * @param settings
         */
        formSubmit: function ($form, settings) {
            var config = {
                _btnValue: '',
                resetForm: false,
                data: undefined,
                autoModal: true,
                errorAlert: false,
                btnLoadingText: 'Saving..',
                beforeSend: function ($form, config) {
                    MF.view.setDefaultFormBeforeSend($form, config);
                },
                buttonEnabled: function ($form) {
                    $form.find(".btnSubmit").html(this._btnValue);
                    $form.find(".btnSubmit").removeAttr("disabled");
                },
                beforeFormSubmit: undefined,
                afterSuccess: undefined
            };
            if (typeof settings != 'undefined') {
                $.extend(config, settings);
            }
            $form.submit(function (event, params) {
                if ($(this).validate(true)) {
                    $(this).ajaxSubmit({
                        resetForm: config.resetForm,
                        data: config.data,
                        dataType: settings.dataType ? settings.dataType : 'json',
                        beforeSubmit: function () {
                            if (typeof config.beforeFormSubmit != 'undefined') {
                                config.beforeFormSubmit($form, config);
                            }
                            if (typeof config.beforeSend != 'undefined') {
                                config.beforeSend($form, config);
                            }
                        },
                        success: function (resp, statusText, xhr) {
                            if (typeof config.afterSuccess != 'undefined') {
                                config.afterSuccess(resp, $form, params);
                            }
                        },
                        complete: function () {
                            MF.view.setDefaultFormAfterSuccess($form, config);
                        }
                    });
                } else {
                    if (config.errorAlert) {
                        MF.view.validationErrorModal();
                    }
                }
                return false;
            })
        },
        validationErrorModal: function (message) {
            message = message || "Some validation errors occur.Please check all inputs.";
            $("<p>" + message + "</p>").dialog({
                modal: true,
                title: 'Validation Error!!',
                buttons: {
                    Ok: function () {
                        $(this).dialog("close");
                    }
                }
            });
        },
        headerToggle: function (viewPanel) {
            viewPanel.find(".header-title").click(function (e) {
                if ($(e.target).hasClass("header-command") || $(e.target).hasClass("noClick")) {
                    return true;
                }
                var elm = $(this);
                var targetPanel = elm.next();
                if (!targetPanel.is(":hidden")) {
                    targetPanel.slideUp(200);
                    elm.find('span').removeClass('expand').addClass('collapse');
                } else {
                    targetPanel.slideDown(200);
                    elm.find('span').removeClass('collapse').addClass('expand');
                }
            });
        },
        gridHeaderToggle: function (viewPanel) {
            viewPanel.find(".grid-head").bind("click", function () {
                var el = $(this);
                var targetEl = viewPanel.find(".table-grid");
                var toggleEl = el.find("span");
                if (toggleEl.hasClass("panel-down")) {
                    targetEl.slideUp(200);
                    toggleEl.removeClass('panel-down').addClass('panel-up');
                } else {
                    targetEl.slideDown(200);
                    toggleEl.removeClass('panel-up').addClass('panel-down');
                }
            });
        },
        /**
         * Common form validation error message
         * @param $form
         * @param message
         */
        populateErrorMessage: function ($form, message) {
            var errorField = $form.find(".errorMessage");
            if (errorField.length < 1) {
                $form.prepend("<div class='errorMessage'>" + message + "</div>");
            } else {
                errorField.html(message);
            }
        },
        /**
         * Grid panel table row sort
         * @param el
         * @param ajaxUrl
         * @param ajaxData
         * @param afterSuccess
         */
        tableSort: function (el, ajaxUrl, ajaxData, afterSuccess) {
            el.tableDnD({
                onDragClass: "cell-drag",
                onDrop: function (table, row) {
                    var rows = table.tBodies[0].rows;
                    var rowIds = '';
                    var length = rows.length;
                    for (var i = 0; i < length; i++) {
                        var divider = "||";
                        if (i == length - 1) {
                            divider = "";
                        }
                        rowIds += $(rows[i]).attr('data-id') + divider;
                    }
                    MF.utility.rowColor(el);
                    if (rowIds != "") {
                        MF.utility.callAjax({
                            url: ajaxUrl,
                            data: ajaxData(rowIds),
                            type: "put",
                            success: function (data) {
                                if ($.isFunction(afterSuccess)) {
                                    afterSuccess(data);
                                }
                            }
                        })
                    }
                }
            });
        },
        /**
         * make any textarea auto expandable
         * @param el
         */
        makeExpandTextArea: function (el) {
            el = el || $(".expandInput");
            var currentExpandableTextarea = null;
            el.bind("click", function () {
                currentExpandableTextarea = $(this);
                currentExpandableTextarea.css({"height": 100});
            });
            $(document).bind("click.expandInput", function (e) {
                var targetEl = $(e.target);
                if (!targetEl.hasClass("expandInput") && currentExpandableTextarea && !targetEl.hasClass("btnSubmit")) {
                    currentExpandableTextarea.css({"height": 30});
                }
            });
        },
        /**
         * date picker common function
         * @param elm
         * @param _options
         */
        datePicker: function (elm, _options) {
            var options = {
                dateFormat: 'yy-mm-dd',
                changeMonth: true,
                changeYear: true,
                yearRange: "-120:+30"
            };
            if (_options) {
                $.extend(options, _options);
            }
            if (elm.datepicker) {
                elm.datepicker(options);
            }
        },
        /**
         * date picker with time common function
         * @param elm
         * @param _options
         */
        dateTimePicker: function (elm, _options) {
            var options = {
                dateFormat: 'yy-mm-dd',
                timeFormat: 'HH:mm:ss',
                changeMonth: true,
                changeYear: true,
                yearRange: "-120:+30"
            };
            if (_options) {
                $.extend(options, _options);
            }
            if (elm.datetimepicker) {
                elm.datetimepicker(options);
            }
        },
        /**
         * Get Alert Box
         * @param settings - settings like width,height,title
         * @param message - Message that want to show
         * @param callback - callback will trigger after yes button click
         */
        getAlert: function (settings, message, callback) {
            var config = {
                width: 400,
                height: 140,
                title: MF.locale.common.alert
            };
            if (settings) {
                $.extend(config, settings);
            }

            $("body").MFToolTip({
                template: MF.plugin.toolTip.TEMPLATETYPE.DIALOG,
                content: message,
                modal: true,
                title: config.title,
                width: config.width,
                closable: config.closable,
                zIndex: 2000,
                dialogButton: {
                    OK: {
                        text: MF.locale.common.ok,
                        listener: {
                            click: function () {
                                if (callback && $.isFunction(callback)) {
                                    callback();
                                }
                                $("body").MFToolTip("close");
                            }
                        }
                    }
                }
            });
        },
        /**
         * Get Confirm Box
         * @param settings - settings like width,height,title
         * @param message - Message that want to show
         * @param callback - callback will trigger after yes button click
         */
        getConfirm: function (settings, message, callback) {
            var config = {
                width: 400,
                height: 140,
                title: MF.locale.common.confirm + '?'
            };
            if (settings) {
                $.extend(config, settings);
            }

            $("body").MFToolTip({
                template: MF.plugin.toolTip.TEMPLATETYPE.DIALOG,
                content: message,
                modal: true,
                title: config.title,
                width: config.width,
                closable: config.closable,
                zIndex: 2000,
                dialogButton: {
                    OK: {
                        text: MF.locale.common.yes,
                        listener: {
                            click: function () {
                                if (callback && $.isFunction(callback)) {
                                    callback();
                                }
                                $("body").MFToolTip("close");
                            }
                        }
                    },
                    Close: {
                        text: MF.locale.common.no,
                        listener: {
                            click: function (el, toolTipContainer) {
                                $("body").MFToolTip("close");
                            }
                        }
                    }
                }
            });

            $("<p>" + message + "</p>").dialog({
                resizable: false,
                height: config.height,
                modal: true,
                title: config.title,
                width: config.width,
                zIndex: 2000,
                buttons: [
                    {
                        text: MF.locale.common.yes,
                        click: function () {
                            if (callback && $.isFunction(callback)) {
                                callback()
                            }
                        }
                    },
                    {
                        text: MF.locale.common.no,
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ]
            });
        },
        /**
         * Get dialog - singleton
         * @param el
         * @param options
         * @param callBack
         */
        getDialog: function (el, options, callBack) {
            var dialogDefaults = {
                title: MF.locale.common.viewDetails,
                modal: true,
                width: 600,
                position: 'top',
                loadingText: MF.locale.common.loading + '...'
            };
            if (options) {
                $.extend(dialogDefaults, options, true)
            }
            $(el).bind("click", function () {
                var href = $(this).attr("href");
                if (!dialog) {
                    dialog = $("<p id='detailDialog'>" + dialogDefaults.loadingText + "</p>").dialog({
                        title: dialogDefaults.title,
                        modal: dialogDefaults.modal,
                        width: dialogDefaults.width,
                        position: dialogDefaults.position
                    });
                } else {
                    dialog.dialog("open");
                    dialog.html(dialogDefaults.loadingText);
                }
                MF.utility.callAjax({
                    url: href,
                    success: function (data) {
                        dialog.html(data);
                        if (callBack && $.isFunction(callBack)) {
                            callBack();
                        }
                    }
                });
                return false;
            })
        },
        /**
         * Make tabs
         * @param el
         * @param afterComplete
         */
        makeTab: function (el, afterComplete) {
            $(el).tabs({
                fx: {
                    opacity: 'toggle'
                },
                ajaxOptions: {
                    error: function (xhr, status, index, anchor) {
                        $(anchor.hash).html("Couldn't load this tab. Please try again.");
                    },
                    complete: function () {
                        if (afterComplete && $.isFunction(afterComplete)) {
                            afterComplete();
                        }
                    }
                }
            });
        },
        focusElement: function (currEl) {
            if (currEl) {
                var strLength = currEl.val().length;
                currEl.focus();
                currEl[0].setSelectionRange(strLength, strLength);
            }
        }
    }
}());