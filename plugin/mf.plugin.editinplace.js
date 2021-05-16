/**
 * itl.plugin.editInPlace.js
 * @package js/MF/plugin
 * @class MF.plugin
 * @author Md.Rajib-Ul-Islam<mdrajibul@gmail.com>
 * used for inline edit .
 *
 */
MF.plugin.editInPlace = (function () {
    var text = "";

    function editPlaceEvent(elm, url, data, callback) {
        elm.find(".updateField").bind('click', function (e) {
            var updateElm = $(this);
            var inpValue;
            var editType = elm.attr('data-editType');
            var richArea = $(this).parents('.edit-place').find("#cke_contents_message iframe").contents().find("body");
            if (editType == 'textarea' && richArea.length > 0) {
                inpValue = richArea.html();
            } else if (editType == "radio" || editType == "checkbox") {
                inpValue = $(this).parents('.edit-place').find('input[name=editRow]:checked').val();
            } else if (editType == "combo") {
                inpValue = $(this).parents('.edit-place').find('.editRow').find("input").val();
            } else {
                inpValue = $(this).parents('.edit-place').find('.editRow').val();
            }
            if (data) {
                data.value = inpValue;
            }
            var extraInpEl = elm.find(".extraInp");
            if (extraInpEl.length > 0) {
                extraInpEl.each(function () {
                    var name = $(this).attr("name");
                    data[name] = $(this).val();
                });
            }
            if (elm.validate(true) && inpValue != "") {
                var result = true;
                MF.utility.callAjax({
                    url: url,
                    data: data,
                    dataType: 'json',
                    success: function (data) {
                        if (data) {
                            if (data.success) {
                                var putHtml = data.response || inpValue;
                                if (elm.find(".data-content").length > 0) {
                                    elm.find(".data-content").html(putHtml);
                                } else {
                                    elm.html(putHtml);
                                }
                                elm.find(".edit-place").remove();
                                if (data.defaultValue) {
                                    elm.attr("data-defaultValue", data.defaultValue);
                                }
                                if (callback && $.isFunction(callback)) {
                                    callback();
                                }
                            } else if (!data.result && data.message) {
                                result = false;
                            }
                            if (data.message) {
                                MF.plugin.NotificationMessage.showNotification(data.message, (data.success ? MF.plugin.NotificationMessage.MESSAGE_TYPE.SUCCESS : MF.plugin.NotificationMessage.MESSAGE_TYPE.FAILURE), true);
                            }
                            text = "";
                        }
                    },
                    beforeSend: function () {
                        updateElm.attr("disabled", true);
                        MF.plugin.NotificationMessage.showNotification("Saving...", MF.plugin.NotificationMessage.MESSAGE_TYPE.LOADING);
                        updateElm.parent().find("img").remove();
                        updateElm.parent().append('<img src="' + IMAGEPATH + 'system/general/wait.gif" alt="Loading...">');
                    },
                    complete: function () {
                        updateElm.removeAttr("disabled");
                        if (result) {
                            MF.plugin.NotificationMessage.hideNotification(2000);
                        }
                    }
                });
            }
        });
        elm.find(".close").bind('click', function (e) {
            if ($(this).closest('.edit-place').find(".cke_editor iframe").length > 0) {
                elm.html($(this).closest('.edit-place').find(".cke_editor iframe").contents().find("body").html());
            }
            if ($(this).closest(".edit-place").find("input:not(input[type=hidden],input[type=radio],input[type=checkbox]),textarea,select").length > 0) {
                var closestPan = $(this).closest(".clickEdit");
                if (closestPan.find(".data-content").length > 0) {
                    closestPan = closestPan.find(".data-content");
                }
                var inpText = $(this).closest(".edit-place").find("input:not(input[type=hidden]),textarea,select").val();
                if (inpText == "") {
                    inpText = text;
                }
                closestPan.html(inpText);
            }
            $(this).closest(".clickEdit").removeClass("active");
            $(this).closest('.edit-place').remove();
            text = "";
        });
        elm.find('.edit-div').find('.editRow').bind('keyup', function (e) {
            if (e.keyCode == '13' && elm.find("textarea").length < 1) {
                elm.find(".updateField").trigger("click");
            }
        });
        elm.find("input,textarea").focus();
        $(document).bind("click.editInPlace", function (e) {
            var targetEl = $(e.target);
            if (targetEl.parents(".edit-place").length < 1 && !targetEl.hasClass("edit-place")) {
                if (targetEl.parents(".cke_dialog").length > 0 || targetEl.parents(".ui-datepicker").length > 0) {
                    return true;
                }
                if (targetEl.parents(".edit-place").find(".cke_editor iframe").length > 0) {
                    elm.html($(".edit-place").find(".cke_editor iframe").contents().find("body").html());
                }
                $(".edit-place").each(function () {
                    var eachEl = $(this);
                    if (eachEl.find("input:not(input[type=hidden],input[type=radio],input[type=checkbox]),textarea,select").length > 0) {
                        var inpText = eachEl.find("input:not(input[type=hidden]),textarea,select").val();
                        if (inpText == "") {
                            inpText = text;
                        }
                        eachEl.closest(".clickEdit").html(inpText).removeClass("active");
                        eachEl.remove();
                    }
                });
                text = "";
            }
        });
    }

    function setComboString(elm, saveUrl, editDiv, comboStr, data, callback) {
        editDiv.find(".content").html(comboStr);
        editDiv.find("#editLoader").remove();
        editPlaceEvent(elm, saveUrl, data, callback);
    }

    function getFieldEditPanel(inputHTML, inlineEdit) {
        inputHTML = inputHTML || "";
        if (inlineEdit) {
            return '<div class="edit-place inlineEdit"><div class="content" >' + inputHTML + '</div><div class="button-panel"><button type="button" class="updateField">Update</button><button type="button" class="close">Close</button></div></div>';
        }
        return '<div class="edit-place"><div class="edit-div" ><span class="content">' + inputHTML + '</span><div class="button-panel"><button type="button" class="updateField">Update</button><button type="button" class="close">Close</button></div></div></div>';
    }

    return {
        editPlace: function (elm, saveUrl, comboAjaxUrl, comboStr, callback, isInline) {
            if (elm.find(".edit-place").length > 0 || elm.parents(".edit-place").length > 0) {
                return true;
            }
            var id = elm.attr('data-id');
            var editType = elm.attr('data-editType');
            var inlineEdit = elm.attr('data-inlineEdit') || (isInline || false);
            var editName = elm.attr('data-editName');
            var optionvalue = elm.attr('data-optionvalue');
            var blankValue = elm.attr('data-blankValue');
            var defaultValue = elm.attr('data-defaultValue');
            var validation = elm.attr('data-validation');
            var spinner = elm.attr('data-spinner');
            if (typeof validation == "undefined") {
                validation = "";
            }
            switch (editType) {
                case 'text':
                case 'date':
                case 'password':
                case 'hidden':
                case 'textarea':
                case 'combo':
                case 'radio':
                case 'checkbox':
                    text = !blankValue && !defaultValue ? $.trim(elm.html()) : (defaultValue ? defaultValue : "");
                    if (inlineEdit) {
                        elm.empty();
                    }
                    break;
            }
            switch (editType) {
                case 'text':
                case 'date':
                    if (elm.find(".editRow").length < 1) {
                        var extraClass = editType == "date" ? "datePicker" : "";
                        var readonly = editType == "date" ? 'readonly="readonly"' : "";
                        elm.append(getFieldEditPanel('<input ' + readonly + ' class="editRow cm-inp ' + extraClass + '" type="text" value="' + text + '" validation="' + validation + '">'));
                        if (editType == "date") {
                            elm.find('.datePicker').datepicker({
                                dateFormat: 'yy-mm-dd'
                            });
                        }
                    }
                    break;
                case 'password':
                case 'hidden':
                    if (elm.find(".editRow").length < 1) {
                        elm.append(getFieldEditPanel('<input class="editRow cm-inp" type="' + editType + '" value="' + text + '" validation="' + validation + '">'));
                    }
                    break;
                case 'textarea':
                    text = $.trim(elm.html());
                    if (elm.find(".editRow").length < 1) {
                        elm.append(getFieldEditPanel('<textarea class="editRow cm-inp" style="width:400px;height:120px;" validation="' + validation + '" id="message-' + id + '">' + text + '</textarea>'));
                        if (elm.attr('data-hasEditor') == "true") {
                            MF.view.richEditor(elm.find("textarea"), {width: 650});
                        }
                    }
                    break;
                case 'radio':
                case 'checkbox':
                    if (elm.find(".editRow").length < 1 && optionvalue) {
                        var optionObj = "";
                        if (optionvalue) {
                            optionObj = eval("(" + optionvalue + ")");
                        }
                        if (typeof optionObj == 'object') {
                            var optionHtml = "";
                            for (var key in optionObj) {
                                var checkedStr = "";
                                if (defaultValue == key) {
                                    checkedStr = 'checked="checked"';
                                }
                                optionHtml += '<label class="autoWidth"><input name="editRow" type="' + editType + '" ' + checkedStr + ' value="' + key + '" class="editRow" validation="' + validation + '">&nbsp;' + optionObj[key] + '</label>&nbsp;&nbsp;';
                            }
                            elm.append(getFieldEditPanel(optionHtml, inlineEdit)).addClass("active");
                        }
                    }
                    break;
                case 'combo':
                    var editDiv = $(getFieldEditPanel());
                    if (elm.find(".editRow").length < 1) {
                        elm.append(editDiv);

                        if (comboAjaxUrl) {
                            var ajaxURL = typeof comboAjaxUrl == "object" ? comboAjaxUrl[editName] : comboAjaxUrl;
                            MF.utility.callAjax({
                                url: ajaxURL,
                                data: {field: editName, selected: text},
                                dataType: "html",
                                success: function (comboStr) {
                                    setComboString(elm, saveUrl, editDiv, comboStr, {id: id, field: editName}, callback);
                                },
                                beforeSend: function () {
                                    editDiv.find(".content").html('<img id="editLoader" src="' + IMAGEPATH + 'system/general/wait.gif" alt="Loading...">');
                                }
                            })

                        } else if (!comboAjaxUrl && (comboStr || optionvalue)) {
                            comboStr = typeof comboStr == 'object' ? comboStr : [comboStr];
                            if (optionvalue) {
                                comboStr = eval("(" + optionvalue + ")");
                            }
                            if (typeof comboStr == 'object') {
                                var cmLength = comboStr.length;
                                var selectStr = "";
                                for (var i = 0; i < cmLength; i++) {
                                    var cmHtml = "";
                                    if (typeof comboStr[i] == 'object') {
                                        cmHtml += '<select class="editRow" validation="' + validation + '">';
                                        for (var key in comboStr[i]) {
                                            if (text == comboStr[i][key]) {
                                                selectStr = 'selected="selected"';
                                            } else {
                                                selectStr = "";
                                            }
                                            cmHtml += "<option value='" + key + "' " + selectStr + ">" + comboStr[i][key] + "</option>";
                                        }
                                        cmHtml += "</select>";
                                    }
                                    setComboString(elm, saveUrl, editDiv, cmHtml, {id: id, field: editName}, callback);
                                }
                            }
                        }
                        elm.find("select").SBOX();
                    }
                    break;
            }
            if (spinner) {
                text = !blankValue && !defaultValue ? $.trim(elm.html()) : (defaultValue ? defaultValue : "");
                if (inlineEdit) {
                    elm.empty();
                }
                var spinnerEl = elm.find(".cm-inp");
                var panelClass = "progress-inlineEdit";
                if (inlineEdit) {
                    panelClass += " inlineEdit";
                }
                var progressPanel = $('<div class="' + panelClass + '"><div class="progress-panel inb"><div id="progressPanel"></div></div><div class="inb progress-val">' + (defaultValue ? defaultValue : 0) + '%</div></div>');
                spinnerEl.before(progressPanel);
                progressPanel.find("#progressPanel").slider({
                    animate: true,
                    range: "min",
                    max: 100,
                    min: 0,
                    step: 5,
                    value: defaultValue,
                    slide: function (event, ui) {
                        progressPanel.find(".progress-val").html(ui.value + "%");
                    },
                    change: function (event, ui) {
                        spinnerEl.val(ui.value);
                    }
                });
            }
            if (editType != "combo") {
                editPlaceEvent(elm, saveUrl, {id: id, field: editName, value: elm.find(".editRow").val()}, callback);
            }
        }
    }
})();