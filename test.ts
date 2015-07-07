import {Model as Model, prop as prop, IPropType as IPropType} from './lib';

class X extends Model {
    @prop({ type: IPropType.Array, arrayProp: { type: IPropType.Number } })
    a;
}
enum Enum1 {
    V1,
    V2,
    V3
}
class MyClass extends Model {
    @prop({ type: IPropType.Object, class: X })
    prop1;

    @prop({ type: IPropType.Enum, class: Enum1 })
    b: Enum1;
}

var a = new MyClass({ prop1: { a: [1, 2, 3] }, b: "V1" });
console.assert(a.prop1 instanceof X);
console.assert(a.b == Enum1.V1, "Invalid JSON");
try {
    new MyClass({});
    console.assert(false, "Not check required field");
} catch (e) {

}