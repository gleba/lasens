import { ISens } from "../core";
export declare function installMixin(sens: ISens<any>): {
    data(...a: any[]): any;
    beforeCreate(): void;
    created(): void;
    beforeDestroy(): void;
};
