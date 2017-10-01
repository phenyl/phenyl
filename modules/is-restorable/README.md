# What is "Restorable"

Restorable is a characteristic of JavaScript classes whose instance meets the following requirement.

```js
const jsonStr = JSON.stringify(instance)
const plain = JSON.parse(jsonStr)
const newInstance = new TheClass(instance)

assert.deepEqual(newInstance, instance)
```

# Why is Restorable important
Usually, class information are removed through network or storages as it communicate by binary or string.

Recently, more and more environments support JSON and JavaScript.
Model sharing between Node.js and browser (or mobile app like React Native)

Restorable instances can be available over environments.


# Efficient restorable
constructor uses sub instance if it's set.

# どこまでassign()がやるか
使う側が、こいつはnewしてくれって、頼む感じ => $new演算子


