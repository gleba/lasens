"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const install_mixin_1 = require("./install-mixin");
function LaVue(sens) {
    sens.renew();
    return {
        install(_Vue, options, ...a) {
            _Vue.mixin(install_mixin_1.installMixin(sens));
        }
    };
}
exports.LaVue = LaVue;
