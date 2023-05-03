# Nogan

Nogan is the virtual machine that contains and runs the node-based language behind Arroost.

Here's a nogan:

```
🌳
```

## Trees

A nogan can have more nogans inside it!

```
🌳(🌳🌳)
```

You can use brackets or a colon to express this:

```
🌳:🌳🌳
```

By the way nogans can be nested as deep as you want:

```
🌳(🌳:🌳🌳)(🌳:🌳)
```

This might be easier to express as a multi-line list:

```
🌳:
- 🌳:🌳🌳
- 🌳:🌳
```

## Phantoms

Technically, The top-level nogan is also inside a nogan! It's inside the _phantom nogan_. But we don't need to write that out explicitly.

```
👻🌳
```

I mean, technically, the phantom nogan is also within a phantom nogan! and so on... forever...

```
👻👻👻🌳
```

## Fires

Nogans do nothing by themselves!

```
Before
🌳

After
🌳
```

If a nogan is lit on fire, the fire will end on the next tick:

```
Before
🔥

After
🌳
```

But this only happens on the top level! Nested nogans won't do anything by themselves.

```
Before
🌳:🔥

After
🌳:🔥
```

In fact, nested nogans are completely frozen in time! They only advance through time when the parent nogan "fires".

```
Before
🔥:🔥

After
🌳:🌳
```

There's a reason the top-level nogan always fires. It's because the phantom nogan is always on fire!

```
Before
👻🔥

After
👻🌳
```

## Numbers

Nogans can have numbers!

```
🌳1
```

Every number within a 'nest' must be unique.

```
🌳1 🌳2
```

You can re-use numbers in different nests though:

```
🌳1 (🌳1 🌳2)
```

## Connections

You can connect a nogan to another nogan in its nest. Here, nogan 1 connects to nogan 2:

```
🌳1➡2 🌳2
```

When nogan 1 is on fire, nogan 2 is also on fire.

```
🔥1➡2 🔥2
```

## Timing

A connection can be delayed. Here, nogan 1 is connected to nogan 2 on a delay:

```
🌳1➡.2 🌳2
```

If nogan 1 is on fire, nogan 2 will be on fire one tick later:

```
Before
🔥1➡.2 🌳2

After
🌳1➡.2 🔥2
```

You can set up a loop like this!

```
🌳1➡.2 🌳2➡.1
```

```
Before
🔥1➡.2 🌳2➡.1

After
🌳1➡.2 🔥2➡.1

After
🔥1➡.2 🌳2➡.1
```

You can even loop a nogan to itself!

```
🌳1➡.1
```

```
Before
🔥1➡.1

After
🔥1➡.1

After
🔥1➡.1
```

Here's a secret... This is how phantom nogans work! If you peak inside a phantom nogan, it becomes _real_ and you'll see that it's just this:

```
🌳1➡.1
```

## Time Travel

Similar to how a connection can fire one tick later... A connection can also fire one tick earlier!

```
🌳1➡2. 🌳2
```

The engine peaks into the future, and fires a connected nogan ahead of time.

```
Before
🔥1➡.2 🌳2➡.3 🌳3➡4. 🌳4

After
🌳1➡.2 🔥2➡.3 🌳3➡4. 🔥4

After
🌳1➡.2 🌳2➡.3 🔥3➡4. 🌳4

After
🌳1➡.2 🌳2➡.3 🌳3➡4. 🌳4
```

## Arroost

What's this got to do with Arroost?

Arroost is essentially a nogan with extra functionality. The extra functionality is as follows:

-  Nogans can also have a position in space. And connections can point anonymously to a location. If there's a nogan at that location, it will be connected to it.
-  Connections are also nogans themselves, and can be targeted in the same way.
-  Connections can be one of three colours. Incoming firings will only trigger a connection if it's the same colour.
-  The engine has a range of nogan types. They do various things, eg: delete nogans, connect nogans, create nogans, etc.
-  The engine has side-effects that trigger when certain nogans are fired. For example, a 'recording' nogan plays a sound. And some nogans 'route' firings through multiple nogans. eg: The 'creation' nogan fires through its first nogan, and then fires somewhere else to clone the targeted nogan.
