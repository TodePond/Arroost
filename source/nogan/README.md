# Nogan

Nogan is the virtual machine that contains and runs the node-based language behind Arroost.

```js
const nogan = createNogan()
```

## Cells

You can make cells in it.

```js
const nogan = createNogan()
const cell = createCell(nogan)
```

## Firing

You can fire a cell.

```js
const nogan = createNogan()
const cell = createCell(nogan)
fireCell(nogan, {id: cell.id})
```

## Peaking

You can peak at a cell to check if it's firing.

```js
const nogan = createNogan()
const cell = createCell(nogan)

const before = getPeak(nogan, {id: cell.id})
print(before.result) //false

fireCell(nogan, {id: cell.id})

const after = getPeak(nogan, {id: cell.id})
print(after.result) //true
```

## Wires

You can connect cells together with wires.

```js
const nogan = createNogan()
const source = createCell(nogan)
const target = createCell(nogan)

createWire(nogan, {source: source.id, target: target.id})
```

## Spreading

When a cell fires, it fires what it points to.

```js
const nogan = createNogan()
const source = createCell(nogan)
const target = createCell(nogan)

createWire(nogan, {source: source.id, target: target.id})
fireCell(nogan, {id: source.id})

const peak = getPeak(nogan, {id: target.id})
print(peak.result) //true
```

## Advancing

As time progresses, all fires end.

```js
const nogan = createNogan()
const cell = createCell(nogan)
fireCell(nogan, {id: cell.id})

const before = getPeak(nogan, {id: cell.id})
print(before.result) //true

const {advanced} = getAdvanced(nogan)

const after = getPeak(advanced, {id: cell.id})
print(after.result) //false
```

