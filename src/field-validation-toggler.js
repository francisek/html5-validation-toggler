(function() {

var Html5FieldValidationToggler = function(element) {
    if (element.checkValidity == undefined) {
        throw 'Element does not implement validity constraint API';
    }
    if (element.Html5FieldValidationToggler) {
        return element.Html5FieldValidationToggler;
    }
    var lastCustomValidityMessage , activated = true;
    var validationRules;

    var oldCustomValidity;
    /**
     * Override for HTMLElement.setCustomValidity()
     * @param msg
     */
    var setCustomValidityReplacement = function(msg) {
        lastCustomValidityMessage = msg;
    };

    /**
     * Resets validation rules backup
     */
    var clearValidationRules = function() {
        validationRules = {attr: {}, prop: {}};
        lastCustomValidityMessage = '';
        oldCustomValidity = null;
    };

    /**
     * Disables HTML5 validation
     */
    this.disableValidation = function() {
        if (!activated) {
            return;
        }
        // Stores validation rules
        for (var i in Html5FieldValidationToggler.validationAttributes) {
            var attrName = Html5FieldValidationToggler.validationAttributes[i];
            if (element.hasAttribute(attrName)) {
                if (element[attrName] != undefined) {
                    validationRules.prop[attrName] = element[attrName];
                } else {
                    validationRules.attr[attrName] = element.getAttribute(attrName);
                }
                element.removeAttribute(attrName);
            }
        }

        // override setCustomValidity and store last validation message
        oldCustomValidity = element.setCustomValidity;
        lastCustomValidityMessage = element.validationMessage;
        element.setCustomValidity('');
        element.setCustomValidity = setCustomValidityReplacement;
        activated = false;
    };

    /**
     * Enables HTML5 validation and restores rules
     */
    this.enableValidation = function() {
        if (activated) {
            return;
        }
        var attr = validationRules.attr;
        for (var attrName in attr) {
            element.setAttribute(attrName, attr[attrName]);
        }
        var attr = validationRules.prop;
        for (var attrName in attr) {
            element[attrName] = attr[attrName];
        }
        // restore setCustomValidity and last validation message
        element.setCustomValidity = oldCustomValidity;
        element.setCustomValidity(lastCustomValidityMessage);
        clearValidationRules();
        activated = true;
    };

    clearValidationRules();
    element.Html5FieldValidationToggler = this;
    return this;
};

Html5FieldValidationToggler.validationAttributes = ['required', 'pattern', 'min', 'max', 'step', 'maxlength'];

Html5FieldValidationToggler.isAttached = function(element) {
    return element && element.Html5FieldValidationToggler != undefined;
};

Html5FieldValidationToggler.get = function(element) {
    if (!Html5FieldValidationToggler.isAttached()) {
        new Html5FieldValidationToggler(element);
    }
    return element.Html5FieldValidationToggler;
};


var Html5FieldGroupToggler = function() {
    var fieldGroups = {};
    var noValidateDataAttr = 'data-field-group-novalidate';

    this.getNoValidateAttr = function() {
        return noValidateDataAttr;
    };

    var queryGroupElements = function(groupName) {
        return document.querySelectorAll('[data-field-group~="' + groupName + '"]');
    };
    var enableValidation = function() {
        Html5FieldValidationToggler.get(this).enableValidation();
        this.removeAttribute(noValidateDataAttr);
    };

    var disableValidation = function() {
        Html5FieldValidationToggler.get(this).disableValidation();
        this.setAttribute(noValidateDataAttr, true);
    };

    this.toggleGroupValidation = function(groupName, validate) {
        if (fieldGroups[groupName] == undefined) {
            return this;
        }
        var currentGroup = queryGroupElements(groupName);
        if (validate == undefined) {
            for (var i=currentGroup.length, el; --i >=0;) {
                el = currentGroup[i];
                if (el.hasAttribute(noValidateDataAttr)) {
                    enableValidation.call(el);
                } else {
                    disableValidation.call(el);
                }
            }
        } else if (validate) {
            for (var i=currentGroup.length, el; --i >=0;) {
                el = currentGroup[i];
                disableValidation.call(el);
            }
        } else {
            for (var i=currentGroup.length, el; --i >=0;) {
                el = currentGroup[i];
                if (el.hasAttribute(noValidateDataAttr)) {
                    enableValidation.call(el);
                }
            }
        }

        return this;
    };

    this.addValidationGroup = function(groupName) {
        fieldGroups[groupName] = {}
        return this;
    };

    this.mapGroup = function(groupName, callback) {
        if (fieldGroups[groupName] == undefined) {
            return;
        }
        return queryGroupElements(groupName).each(callback);
    };

    this.getGroups = function() {
        return fieldGroups;
    };

    return this;
};

window.Html5FieldValidationToggler = Html5FieldValidationToggler;
window.Html5FieldGroupToggler = Html5FieldGroupToggler;

})();