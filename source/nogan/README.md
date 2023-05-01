# Nogan

Nogan is the virtual machine that contains and runs the node-based language behind Arroost.

## Items

A Nogan is just a big object of items, each keyed with a unique id.

There are two types of item:

-  Nod
-  Wire

## Nod

A nod is a nod(e) in the graph!

It has inputs and outputs (wires).<br>
It has a position.<br>
It has a nod-type, which determines its behaviour.<br>
It can contain extra data, depending on its nod-type.

And it stores whether it's firing or not!

By the way... every nod can also contain another nogan!<br>
The nogan ticks every time the nod fires.

## Wire

A wire is a connection between a source and a target.<br>
It can also be attached to a nod at either of these positions (its input and output).<br>
It can be configured for colour and timing!

And it stores whether it's firing or not!
