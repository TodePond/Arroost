import {
	add,
	distanceBetween,
	lerp,
	normalise,
	scale,
	subtract,
} from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dragging } from "../machines/input.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Transform } from "./transform.js"
import { Movement } from "./movement.js"
import { Style } from "./style.js"
import { c, t } from "../../nogan/nogan.js"

export class Infinite extends Component {
	/**
	 * @param {{
	 * 	dom: Dom
	 * }} options
	 */
	constructor({ dom }) {
		super()
		this.dom = dom
	}
}
