interface MyObject {
  readonly id: number;
  name: string;
}

const source1: MyObject = { id: 1, name: 'Object 1' };
const source2: MyObject = { id: 1, name: 'Object 2' };

const mergedObject = Object.assign(source1, source2);

console.log('mergedObject', mergedObject); 
// Output: { id: 1, name: 'Object 2' }