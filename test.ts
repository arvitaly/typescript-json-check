import {Model as Model, prop as prop, PropType as PropType} from './lib';

class X extends Model {
    @prop({ type: PropType.Array, arrayProp: { type: PropType.Number } })
    a;
}
enum Enum1 {
    V1,
    V2,
    V3 
}
class MyClass extends Model {
    @prop({ type: PropType.Object, class: X })
    prop1;
    @prop({ type: PropType.String })
    propString;
    @prop({ type: PropType.Enum, class: Enum1 })
    b: Enum1;
}

class TestString extends Model {
    @prop({ type: PropType.String })
    prop: string;
}

var a = new MyClass({ propString: "afaf", prop1: { a: [1, 2, 3] }, b: "V1" });
console.assert(a.prop1 instanceof X);
console.assert(a.b === Enum1.V1, "Invalid JSON");
console.assert(a.propString === "afaf");
try {
    new TestString({ prop: 123 });
    console.assert(false, "Not check string field");
} catch (e) {
}
try {
    new MyClass({});
    console.assert(false, "Not check required field");
} catch (e) {

}

class B extends Model {
    @prop({ type: PropType.String })
    ap2;
}
class A extends B {
    @prop({ type: PropType.String })
    ap1;
}
try {
    var c = new B({ ap2: "daf", ap1: "df", t: "dfs" });
    console.assert(false, "Not throw unknown properties");
} catch (e) {
}
