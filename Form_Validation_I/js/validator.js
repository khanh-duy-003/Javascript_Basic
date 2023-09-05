function Validator(options) {

    var selectorRules = {};

    // Hàm thực validate
    function validate (inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        // var errorMessage = rule.test(inputElement.value);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rules & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }

        return !errorMessage;
    };

    // Lấy element của for, cầm validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);

                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if (typeof options.onsubmit === 'function') {
                    console.log('vpop')
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        return (values[input.name] = input.value) && values;
                    }, {});

                    options.onSubmit(formValues);
                }
            }
        }


        // Lặp qua mỗi rule và xử lý ( Lắng nghe sự kiện blur, input,... )
        options.rules.forEach(rule => {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            
            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            };

        });
    }
};

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function(selector, message) {
    return {
        selector : selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
};

Validator.isEmail = function(selector, message) {
    return {
        selector : selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    }
};

Validator.minLength = function(selector, min, message) {
    return {
        selector : selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
};

Validator.isComfirmed = function(selector, getConfirmValue, message) {
    return {
        selector : selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || `Giá trị nhập vào không chính xác`;
        }
    }
};