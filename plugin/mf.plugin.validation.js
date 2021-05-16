/*
 * Validation (for jQuery)
 * version: 1.0 (22/08/2010)
 * @requires jQuery v1.2 or later
 * @author - Md.Rajib-Ul-Islam(mdrajibul@gmail.com)

 ----------------------------------------------------------------------------

 /*
 *
 * Usage:
 *
 * <code>
 HTML : <input type="text" validation="required rangeLength[4,50] max[100]" />

 JavaScript :
 $(function(){
 var myForm = $("#my_form"); // You can give className or ID for any panel div without form
 myForm.validation();
 $("#test").click(function() {
 if(!myForm.validate()) {
 do something.........
 }
 });
 });
 * </code>
 *
 */

/*
 Validation Singleton
 */
MF.plugin.Validation = function () {
    function fetchRuleName(str, left, at, space) {
        var min = left < at ? left : at;
        min = min < space ? min : space;
        return str.substring(0, min);
    }

    function fetchParam(str, index) {
        var h = str.indexOf("]", index);
        return str.substring(index, h);
    }

    function fetchIfOrValid(str, index) {
        if (str.charAt(index) == 'i') {
            var right = str.indexOf("}", index);
            if (right == -1) {
                throw "Invalid Validator";
            }
            return {ifselector: str.substring(index + 3, right), parsedIndex: right};
        } else {
            var ignoreCount = 0;

            function findRBra(index) {
                var lbra = str.indexOf("{", index);
                if (lbra == -1) {
                    lbra = str.length;
                } else {
                    var rbra = str.indexOf("}", lbra + 1);
                    if (rbra == -1) {
                        rbra = str.length;
                    }
                    if (rbra > lbra) {
                        ignoreCount++;
                        findRBra(lbra + 1);
                    }
                }
            }

            findRBra(index + 6);
            ignoreCount++;

            var right = index + 5;
            for (var f = 0; f < ignoreCount; f++) {
                right = str.indexOf("}", right + 1);
                if (right == -1) {
                    break;
                }
            }

            if (right == -1) {
                throw "Invalid Validator";
            }
            var validRuleString = str.substring(index + 6, right);
            return {valid: $.Validation.parseValidationString(validRuleString), parsedIndex: right};
        }
    }

    var rules = {
        email: {
            check: function (value) {
                if (value) {
                    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
                }
                return true;
            },
            name: "email",
            msg_template: MF.locale.validation.email
        },
        url: {
            check: function (value) {
                if (value) {
                    return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
                }
                return true;
            },
            name: "url",
            msg_template: MF.locale.validation.url
        },
        date: {
            check: function (value) {
                if (value) {
                    return !/Invalid|NaN/.test(new Date(value));
                }
                return true;
            },
            name: "date",
            msg_template: MF.locale.validation.date
        },
        daterange: {
            check: function (value) {
                if (value) {
                    return /^\d{1,2}\/\d{1,2}\/\d{4} - \d{1,2}\/\d{1,2}\/\d{4}$/.test(value);
                }
                return true;
            },
            name: "daterange",
            msg_template: MF.locale.validation.daterange
        },
        dateISO: {
            check: function (value) {
                if (value) {
                    return /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
                }
                return true;
            },
            name: "dateISO",
            msg_template: MF.locale.validation.dateISO
        },
        number: {
            check: function (value) {
                if (value) {
                    return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
                }
                return true;
            },
            name: "number",
            msg_template: MF.locale.validation.number
        },
        digits: {
            check: function (value) {
                if (value) {
                    return /^\d+$/.test(value);
                }
                return true;
            },
            name: "digits",
            msg_template: MF.locale.validation.digits
        },
        creditcard: {
            check: function (value) {
                if (value && /[^0-9-]+/.test(value)) {
                    return false;
                }
                var nCheck = 0, nDigit = 0, bEven = false;
                value = value.replace(/\D/g, "");
                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9)
                            nDigit -= 9;
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }
                return (nCheck % 10) == 0;
            },
            name: "creditcard",
            msg_template: MF.locale.validation.creditcard
        },
        required: {
            check: function (value) {
                return value ? true : false;
            },
            name: "required",
            msg_template: MF.locale.validation.required
        },
        compare: {
            check: function (value, param) {
                if (!value) {
                    return true;
                }
                var ranges = param.split(",");
                this.validationDepends = null;
                if (this["msg_template_compare" + ranges[2]]) {
                    this.msg_template = this["msg_template_compare" + ranges[2]];
                } else {
                    this.msg_template = this.msg_template_compare;
                }
                var dynamicMessage = validateByCompare(value, $("#" + ranges[0]).val(), ranges[1], ranges[2]);
                if (dynamicMessage.status !== true) {
                    if (dynamicMessage.status == "unsupported") {
                        this.msg_template = "Unsupported compare type";
                    } else {
                        this.msg_params = dynamicMessage.msg_params;
                    }
                    this.validationDepends = $("#" + ranges[0]);
                    return false;
                }
                return true;
            },
            name: "compare",
            msg_template_compare: MF.locale.validation.compare.compare,
            msg_template_comparene: MF.locale.validation.compare.comparene
        },
        range: {
            check: function (value, param) {
                var message = validateByLength(value, param, "range");
                if (message.status !== true) {
                    if (message.status == "invalid") {
                        this.msg_template = "Invalid compare type";
                    } else {
                        this.msg_params = message.msg_params;
                    }
                    return false;
                }
                return true;
            },
            name: "range",
            msg_template: MF.locale.validation.range
        },
        max: {
            check: function (value, param) {
                var message = validateByLength(value, param, "max");
                if (message.status !== true) {
                    if (message.status == "invalid") {
                        this.msg_template = "Invalid compare type";
                    } else {
                        this.msg_params = message.msg_params;
                    }
                    return false;
                }
                return true;
            },
            name: "max",
            msg_template: MF.locale.validation.max
        },
        pattern: {
            check: function (value, pattern) {
                if (value) {
                    return eval(pattern).test(value);
                }
                return true;
            },
            name: "pattern",
            msg_template: MF.locale.validation.pattern
        },
        min: {
            check: function (value, param) {
                var message = validateByLength(value, param, "min");
                if (message.status !== true) {
                    if (message.status == "invalid") {
                        this.msg_template = "Invalid compare type";
                    } else {
                        this.msg_params = message.msg_params;
                    }
                    return false;
                }
                return true;
            },
            name: "min",
            msg_template: MF.locale.validation.min
        },
        rangelength: {
            check: function (value, param) {
                var message = validateByLength(value, param, "rangelength");
                if (message.status !== true) {
                    if (message.status == "invalid") {
                        this.msg_template = "Invalid compare type";
                    } else {
                        this.msg_params = message.msg_params;
                    }
                    return false;
                }
                return true;
            },
            name: "rangelength",
            msg_template: MF.locale.validation.rangelength
        },
        maxlength: {
            check: function (value, param) {
                var message = validateByLength(value, param, "maxlength");
                if (message.status !== true) {
                    if (message.status == "invalid") {
                        this.msg_template = "Invalid compare type";
                    } else {
                        this.msg_params = message.msg_params;
                    }
                    return false;
                }
                return true;
            },
            name: "maxlength",
            msg_template: MF.locale.validation.maxlength
        },
        minlength: {
            check: function (value, param) {
                var message = validateByLength(value, param, "minlength");
                if (message.status !== true) {
                    if (message.status == "invalid") {
                        this.msg_template = "Invalid compare type";
                    } else {
                        this.msg_params = message.msg_params;
                    }
                    return false;
                }
                return true;
            },
            name: "minlength",
            msg_template: MF.locale.validation.minlength
        },
        either_required: {
            check: function (value, param) {
                param = param.split(",");
                var otherValue = $("#" + param[0]).val();
                if (value || otherValue)
                    return true;
                else {
                    this.msg_params = [param[0], param[1]];
                    return false;
                }
            },
            name: "either_required",
            msg_template: MF.locale.validation.either_required
        }
    };

    function validateByLength(value, param, type) {
        var return_msg = {status: true, msg_params: []};
        if (!value) {
            return return_msg;
        }
        var rangeValue = param.split(",");
        return_msg.msg_params = rangeValue;
        switch (type) {
            case "range" :
                value = parseInt(value, 10);
                if (value < parseInt(rangeValue[0], 10) || value > parseInt(rangeValue[1], 10)) {
                    return_msg.status = false;
                }
                break;
            case "max":
                if (value > parseFloat(rangeValue[0], 10)) {
                    return_msg.status = false;
                }
                break;
            case "min":
                if (value < parseFloat(rangeValue[0], 10)) {
                    return_msg.status = false;
                }
                break;
            case "rangelength":
                if (value.length < parseInt(rangeValue[0], 10) || value.length > parseInt(rangeValue[1], 10)) {
                    return_msg.status = false;
                }
                break;
            case "maxlength":
                if (value.length > parseInt(rangeValue[0], 10)) {
                    return_msg.status = false;
                }
                break;
            case "minlength":
                if (value.length < parseInt(rangeValue[0], 10)) {
                    return_msg.status = false;
                }
                break;
            case "default":
                return_msg.status = "invalid";
                break;
        }
        return return_msg;
    }

    var validateByCompare = function (value, compareValue, type, method) {
        var return_msg = {status: true, msg_params: []};
        if (type == "number") {
            value = parseInt(value, 10);
            compareValue = parseInt(compareValue, 10);
        }
        switch (method) {
            case "gt":
                if (type == "number" && value <= compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("greater than", compareValue);
                }
                break;
            case "gte":
                if (type == "number" && value < compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("greater than or equal", compareValue);
                }
                break;
            case "eq":
                if (type == "number" && value != compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("equal", compareValue);
                }
                else if (type == "string" && value != compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("equal", "above input");
                }
                break;
            case "ne":
                if (value == compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array(compareValue);
                }
                break;
            case "lte":
                if (type == "number" && value > compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("less than or equal", compareValue);
                }
                break;
            case "lt":
                if (type == "number" && value >= compareValue) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("less than", compareValue);
                }
                break;
            case "notNeg":
                if (type == "number" && (value + compareValue) < 1) {
                    return_msg.status = false;
                    return_msg.msg_params = new Array("greater than -", compareValue);
                }
                break;
            case "default":
                return_msg.status = "unsupported";
                break;
        }
        return return_msg;
    };

    return {
        addRule: function (name, rule) {
            rules[name] = rule;
        },
        getRule: function (name) {
            return rules[name];
        },
        parseValidationString: function (mainStr) {
            var str = $.trim(mainStr);
            var len = str.length;
            var space = str.indexOf(" ");
            if (space == -1) {
                space = len;
            }
            var leftparen = str.indexOf("[");
            if (leftparen == -1) {
                leftparen = len;
            }
            var at = str.indexOf("@");
            if (at == -1) {
                at = len;
            }
            var name = fetchRuleName(str, leftparen, at, space);
            var rule = rules[name];
            if (rule == null) {
                throw "Invalid Rule";
            }
            var v_rules = [];
            var rule = {rule: rule};
            v_rules.push(rule);
            var totalRuleLengthCount = name.length;
            if (totalRuleLengthCount == leftparen && leftparen != len) {
                if(name == 'pattern'){
                    var replaceMainStr =  mainStr.replace(name + '[', '');
                    rule.param = replaceMainStr.substring(0, (replaceMainStr.length - 1));
                }else{
                    rule.param = fetchParam(str, leftparen + 1);
                }
                totalRuleLengthCount = name.length + rule.param.length + 2;
                if (totalRuleLengthCount == at && at != len) {
                    var iforvalid = fetchIfOrValid(str, at + 1);
                    rule.ifselector = iforvalid.ifselector;
                    rule.valid = iforvalid.valid;
                    totalRuleLengthCount = iforvalid.parsedIndex + 1;
                }
            } else if (totalRuleLengthCount == at && at != len) {
                var iforvalid = fetchIfOrValid(str, at + 1);
                rule.ifselector = iforvalid.ifselector;
                rule.valid = iforvalid.valid;
                totalRuleLengthCount = iforvalid.parsedIndex + 1;
            }

            if (totalRuleLengthCount != len && str.charAt(totalRuleLengthCount) == " ") {
                var hrules = $.Validation.parseValidationString(str.substring(totalRuleLengthCount + 1));
                $.each(hrules, function () {
                    v_rules.push(this);
                })
            }
            return v_rules;
        },
        parseValidationMessage: function (str) {
            return eval("(" + str + ")");
        }
    }
};

var getFormatedMessage = function (message, params) {
    $.each(params, function (i, n) {
        message = message.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return message;
};

/*
 Panel factory
 */
/**
 * Exist panel all field jQuery Element
 */
var existPanelFieldsEl;
var Panel = function (panel) {
    var fields = [];
    existPanelFieldsEl = panel.find("input[validation], select[validation], textarea[validation]");
    existPanelFieldsEl.each(function () {
        var field = $(this);
        var validation = field.attr('validation');
        var validationMessage = field.attr('validationmsg');
        if ((typeof validation !== "undefined" && validation != "")) {
            try {
                var rules = field.data("validator");
                if (typeof rules == "undefined") {
                    rules = $.Validation.parseValidationString($.trim(validation));
                    field.data("validator", rules);
                }
                var msgRules = field.data("validatorMessage");
                if (typeof msgRules == "undefined" && validationMessage) {
                    msgRules = $.Validation.parseValidationMessage($.trim(validationMessage));
                    field.data("validatorMessage", msgRules);
                }
                fields.push(new Field(field));
            } catch (ex) {
                field.data("validator", [
                    {error: "Invalid Validator"}
                ]);
            }
        }
    });
    this.fields = fields;
};

Panel.prototype = {
    isValid: function () {
        for (field in this.fields) {
            this.fields[field].validate();
        }
        for (field in this.fields) {
            if (!this.fields[field].valid) {
                this.fields[field].field.focus();
                return false;
            }
        }
        return true;
    }
};

/*
 Field factory
 */
var Field = function (field) {
    var obj = this;
    this.field = field;
    this.valid = false;
    if (field[0].tagName.toLowerCase() == "select" || field.is("[type='file']")) {
        field.unbind("change.validator");
        field.bind("change.validator", function () {
            obj.validate(true);
        });
    } else {
        var timer;
        field.unbind("keyup.validator");
        field.bind("keyup.validator", function (e) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                obj.validate(true);
            }, 200);
        });
    }
    field.unbind("mouseover.validator mouseout.validator mousemove.validator");
    field.bind("mouseover.validator mousemove.validator", function (e) {
        obj.validate(true, e);
    });
    field.bind("mouseout.validator", function (e) {
        $(this).parent().find(".errorlist").hide();
    });

};

Field.prototype = {
    validate: function (isShowMessage, event) {
        var obj = this;
        var field = obj.field;
        var container = field.parent();
        var validators = field.data("validator");
        var validatorMessage = field.data("validatorMessage");
        if (typeof validatorMessage == "undefined") {
            validatorMessage = {};
        }
        if (!validators) {
            return;
        }
        if (field.hasClass('error')) {
            field.removeClass('error')
        }
        field.siblings(".errorlist").remove();

        function checkValidators(validators, validatorMessage) {
            var len = validators.length;
            var errorMessage = null;
            for (var type = 0; type < len; type++) {
                var validator = validators[type];
                if (typeof validator.error != "undefined") {
                    return ["Invalid validator string format"];
                }

                var check = true;
                if (validator.ifselector) {
                    if ($(validator.ifselector).length == 0) {
                        check = false;
                    }
                }
                if (check) {
                    if (validator.valid) {
                        var l_errors = checkValidators(validator.valid, validatorMessage);
                        if (l_errors.length > 0) {
                            check = false;
                        }
                    }
                    if (check) {
                        var rule = validator.rule;
                        var param = validator.param;
                        var isvalid = rule.check(field.val(), param);
                        if (isvalid !== true) {
                            var template = field.attr("message_template");
                            if (!template) {
                                template = rule.msg_template;
                            }
                            if (!template) {
                                template = "";
                            }
                            var params = field.attr("message_params");
                            if (!params) {
                                params = rule.msg_params;
                            } else {
                                params = params.split("  ");
                                $(params).each(function (i, v) {
                                    try {
                                        params[i] = eval(v);
                                    } catch (u) {
                                    }
                                });
                            }
                            if (!params) {
                                params = [];
                            }
                            if (validatorMessage && validatorMessage[rule.name]) {
                                template = validatorMessage[rule.name];
                            }
                            errorMessage = getFormatedMessage(template, params);
                            if (rule.validationDepends) {
                                var dependField = rule.validationDepends;
                                if (dependField[0].tagName.toLowerCase() == "select") {
                                    dependField.unbind("change.validator");
                                    dependField.bind("change.validator", function () {
                                        return obj.validate(true);
                                    });
                                } else {
                                    dependField.unbind("keyup.validator mouseover.validator");
                                    dependField.bind("keyup.validator mouseover.validator", function () {
                                        return obj.validate(true);
                                    });
                                }
                            }
                        }
                    }
                }

                if (errorMessage != null) {
                    break;
                }
            }
            return errorMessage;
        }

        var error = checkValidators(validators, validatorMessage);
        var errorlist = field.parent().find(".errorlist");
        if (error != null) {
            obj.valid = false;
            var proceed = obj.field.triggerHandler("invalid", error);
            if (proceed === false) {
                return;
            }
            if (errorlist.length == 0) {
                errorlist = $("<div/>").addClass("errorlist");
                field.parent().append(errorlist);
            }
            field.addClass('error');
            // For SBox
            if (field.hasClass("sbox-combo")) {
                field.closest(".w2l-sbox").find(".w2l-sbox-comboPanel").addClass("error");
            }
            // For SBOX end
            // For NiceFile
            if (field.hasClass("w2l-niceFile-validation")) {
                field.closest(".w2l-niceFile").find(".w2l-niceFile-panel").addClass("error");
            }
            // For NiceFile end
            var span = $("<span/>").addClass("pointer");
            errorlist.append(span);
            var pos = field.position();
            var width = field.outerWidth(true);
            var height = field.outerHeight();
            errorlist.css("left", "-10000px");
            errorlist.append("<span>" + error + "</span>");
            var requiredWidth = errorlist.outerWidth(true);
            var remainWidth = errorlist.offsetParent().width() - pos.left - width - 20;

            if (remainWidth > requiredWidth) {
                errorlist.css("left", (pos.left + width + 20) + "px");
                errorlist.css("top", (pos.top + 5) + "px");
                span.addClass("right-side");
            } else {
                if (event) {
                    var mousePos = event.pageX - field.offset().left;
                    var fieldWidth = field.width();
                    errorlist.removeAttr("style");
                    if ((fieldWidth - mousePos) < errorlist.width()) {
                        errorlist.css("right", 0);
                    } else {
                        errorlist.css("left", mousePos);
                    }
                    errorlist.css("top", pos.top + height + span.outerHeight() - 10);
                }
            }
            errorlist.hide();
            if (isShowMessage === true) {
                existPanelFieldsEl.each(function () {
                    $(this).parent().find(".errorlist").hide();
                });
                errorlist.show();
            }
        } else {
            obj.field.triggerHandler("valid");
            errorlist.remove();
            container.removeClass("error");
            field.removeClass('error');
            // For SBox
            if (field.hasClass("sbox-combo")) {
                field.closest(".w2l-sbox").find(".w2l-sbox-comboPanel").removeClass("error");
            }
            // For SBOX end
            // For NiceFile
            if (field.hasClass("w2l-niceFile-validation")) {
                field.closest(".w2l-niceFile").find(".w2l-niceFile-panel").removeClass("error");
            }
            // For NiceFile end
            obj.valid = true;
        }
    }
};

/*
 Validation extends by jQuery prototype
 */
$.extend($.fn, {
    validate: function (isReinit) {
        var validator = $(this).data("validatorInstance");
        if (isReinit === true || validator == null) {
            validator = new Panel(this);
            $(this).data("validatorInstance", validator);
        }
        return validator.isValid();
    }
});
$.Validation = new MF.plugin.Validation();