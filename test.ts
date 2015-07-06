import {Model as Model, prop as prop, IPropType as IPropType} from './lib';
class X extends Model {
    @prop({ type: IPropType.Array, arrayProp: { type: IPropType.Number } })
    a;
}
class MyClass extends Model {
    @prop({ type: IPropType.Class, class: X })
    prop1;
}

var a = new MyClass({ prop1: { a: [1, 2, 3] } });

new MyClass({});