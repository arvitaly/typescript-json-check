export interface IProp {
    type: IPropType;
    optional?: boolean;
    class?: Function;
    params?;
    isCasting?: boolean;
    arrayProp?: IProp;
}
export enum IPropType {
    String,
    Number,
    Class,
    Array,
    Boolean,
    Any
}
export class Model {
    __props: { [index: string]: IProp };
    constructor(data?: any) {
        for (var propName in this.__props) {
            var propInfo = this.__props[propName];
            if ((typeof (propInfo.optional) === 'undefined' || propInfo.optional === true) && typeof (data[propName]) === 'undefined') {
                throw new Error('Property ' + propName + ' is not optional');
            }
            if (typeof (data[propName]) === 'undefined') {
                continue;
            }
            if (!this.check(data[propName], propInfo)) {
                throw new Error('Invalid type for property ' + propName);
            }

            switch (propInfo.type) {
                case IPropType.Class:
                    this[propName] = eval('new propInfo.class(data[propName]);');
                    break;
                case IPropType.Array:
                    this[propName] = data[propName];
                    break;
                default:
                    this[propName] = data[propName];
                    break;
            }
        }
    }
    check(value, propInfo: IProp) {
        switch (propInfo.type) {
            case IPropType.String:
                if (!(typeof value === 'string' || value instanceof String)) {
                    return false;
                }
                return true;
            case IPropType.Array:
                if (!(typeof value === 'array' || value instanceof Array)) {
                    return false;
                }
                if (!propInfo.arrayProp) {
                    return true;
                }
                var arr = <Array<any>>value;
                for (var i = 0; i < arr.length; i++) {
                    if (!this.check(arr[i], propInfo.arrayProp)) {
                        return false;
                    }
                }
                return true;
            case IPropType.Number:
                if (!(typeof value === 'number' || value instanceof Number)) {
                    if (!propInfo.isCasting) {
                        return false;
                    }
                    return !isNaN(value);
                }
                return true;
            case IPropType.Class:
                return this.isPlainObject(value);
            case IPropType.Boolean:
                if (!(typeof value === 'boolean' || value instanceof Boolean)) {
                    if (!propInfo.isCasting) {
                        return false;
                    }
                    return true;
                }
                return true;
            case IPropType.Any:
                return true;
            default:
                throw new Error('Unknown type');
        }
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === '[object Object]'
            && typeof val === 'object';
    }
    isObjectObject(o) {
        return this.isObject(o) === true
            && Object.prototype.toString.call(o) === '[object Object]';
    }

    isPlainObject(o) {
        var ctor, prot;
        if (this.isObjectObject(o) === false) return false;
        ctor = o.constructor;
        if (typeof ctor !== 'function') return false;
        prot = ctor.prototype;
        if (this.isObjectObject(prot) === false) return false;
        if (prot.hasOwnProperty('isPrototypeOf') === false) {
            return false;
        }
        return true;
    }
}
export function prop(info: IProp) {
    return (target: Object, propertyKey: string) => {
        target['__props'] = target['__props'] || {};
        target['__props'][propertyKey] = info;
    }
}