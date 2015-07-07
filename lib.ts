export interface IProp {
    type: PropType;
    optional?: boolean;
    class?;
    params?;
    isCasting?: boolean;
    arrayProp?: IProp;
}
export enum PropType {
    String,
    Number,
    Object,
    Array,
    Boolean,
    Any,
    Enum
}
export interface IModelOptions {
    allowUnknownProps: boolean;
}
export class Model {
    __props: { [index: string]: IProp };
    constructor(data: any, options?:IModelOptions) {
        if (!this.isPlainObject(data)) {
            throw new Error('Data is not plain object');
        }
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
                case PropType.Object:
                    if (!propInfo.class) {
                        propInfo.class = Object;
                    }
                    this[propName] = eval('new propInfo.class(data[propName]);');
                    break;
                case PropType.Enum:
                    if (!propInfo.class) {
                        this[propName] = data[propName];
                    } else {
                        this[propName] = propInfo.class[data[propName]];
                    }
                    break;
                case PropType.Array:
                    this[propName] = data[propName];
                    break;
                default:
                    this[propName] = data[propName];
                    break;
            }
            delete data[propName];
        }
        var props = Object.keys(data);
        if (props.length > 0 && (!options || options.allowUnknownProps === false) ) {
            throw new Error('Unknown properties ' + props);
        }
    }
    check(value, propInfo: IProp) {
        switch (propInfo.type) {
            case PropType.Enum:
                if (!/^[A-z]/gi.test(value)) {
                    return false;
                }
                if (!propInfo.class) {
                    return true;
                } else {
                    return typeof (propInfo.class[value]) !== 'undefined';
                }
            case PropType.String:
                if (!(typeof value === 'string' || value instanceof String)) {
                    return false;
                }
                return true;
            case PropType.Array:
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
            case PropType.Number:
                if (!(typeof value === 'number' || value instanceof Number)) {
                    if (!propInfo.isCasting) {
                        return false;
                    }
                    return !isNaN(value);
                }
                return true; 
            case PropType.Object:
                return this.isPlainObject(value);
            case PropType.Boolean:
                if (!(typeof value === 'boolean' || value instanceof Boolean)) {
                    if (!propInfo.isCasting) {
                        return false;
                    }
                    return true;
                }
                return true;
            case PropType.Any:
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
        
        target['__props'] = target.hasOwnProperty('__props') ? target['__props'] : {};
        target['__props'][propertyKey] = info;
    }
}