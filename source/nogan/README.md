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

You can fire cells.

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

As time advances, all fires end.

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

## Imagining

You can peak into the future.

```js
const nogan = createNogan()
const cell = createCell(nogan)
fireCell(nogan, {id: cell.id})

const before = getPeak(nogan, {id: cell.id})
print(before.result) //true

const after = getPeak(nogan, {id: cell.id, timing: 1})
print(after.result) //false
```

## Delay

Wires can have a delay, so that they fire their target one beat later.

```js
const nogan = createNogan()
const source = createCell(nogan)
const target = createCell(nogan)

createWire(nogan, {source: source.id, target: target.id, timing: 1})
fireCell(nogan, {id: source.id})

const before = getPeak(nogan, {id: target.id})
print(before.result) //false

const after = getPeak(nogan, {id: target.id, timing: 1})
print(after.result) //true
```

## Time Travel

Wires can have a negative delay, so that they fire their target one beat earlier.

```js
const nogan = createNogan()
const source = createCell(nogan)
const middle = createCell(nogan)
const target = createCell(nogan)

createWire(nogan, {source: source.id, target: middle.id, timing: 1})
createWire(nogan, {source: middle.id, target: target.id, timing: -1})
fireCell(nogan, {id: source.id})

const peak = getPeak(nogan, {id: target.id})
print(peak.result) //true
```
