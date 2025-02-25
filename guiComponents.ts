namespace microgui {
    import AppInterface = user_interface_base.AppInterface
    import Scene = user_interface_base.Scene

    import BACK_BUTTON_ERROR_KIND = user_interface_base.BACK_BUTTON_ERROR_KIND
    import FORWARD_BUTTON_ERROR_KIND = user_interface_base.FORWARD_BUTTON_ERROR_KIND
    import INavigator = user_interface_base.INavigator

    import Cursor = user_interface_base.Cursor
    import CursorDir = user_interface_base.CursorDir
    import Picker = user_interface_base.Picker

    import Bounds = user_interface_base.Bounds
    import Screen = user_interface_base.Screen
    import Button = user_interface_base.Button
    import font = user_interface_base.font

    /**
     * Util function used within this file, useful for ensuring that prior bindings are not kept when using a new component.
     */
    function unbindShieldButtons() {
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.A.id,
            () => {},
        )
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.A.id + keymap.PLAYER_OFFSET,
            () => {},
        )
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.B.id,
            () => {},
        )
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.up.id,
            () => {},
        )
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.down.id,
            () => {},
        )
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.left.id,
            () => {},
        )
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.right.id,
            () => {},
        )
    }

    /**
     * Passed to the constructor of a GUIComponent to quickly align it.
     * Alignment may be further adjusted by an xOffset & yOffset.
     * These alignments are used to calculate left & top values for a Bounds object.
     * This Bounds object is the extent of the component.
     * See getLeftAndTop in GUIComponentAbstract for how this is calculated.
     */
    export const enum GUIComponentAlignment {
        TOP,
        LEFT,
        RIGHT,
        BOT,
        CENTRE,
        TOP_RIGHT,
        TOP_LEFT,
        BOT_RIGHT,
        BOT_LEFT,
    }

    /**
     * Greatly simplifies the creation & alignment of GUI components.
     * A GUI Component has a .context for storage of hidden component state.
     */
    export abstract class GUIComponentAbstract extends Scene {
        /** Which of the 9 options should this component snap to? */
        private alignment: GUIComponentAlignment

        /** What is the width of this component, without any xScaling? */
        private unscaledWidth: number

        /** What is the height of this component, without any yScaling? */
        private unscaledHeight: number

        /**
         * Can the user interact with this component? Will the Window ignore its A, B, etc presses?
         * Modified by Window.makeComponentActive()
         */
        protected isActive: boolean

        /** Should this component be drawn on the screen? Modified by optional arg of Window.makeComponentActive() */
        protected isHidden: boolean

        /** A component can store arbitrary information, this information may be passed to it via Window.updateComponentsContext() */
        protected context: any[]

        /** The rectangle that this component embodies. The width & height are equal to DEFAULT_WIDTH * this.xScaling. */
        protected bounds: Bounds
        protected backgroundColour: number = 3

        /** Modifies the DEFAULT_WIDTH of this screen to change its size. */
        private xScaling: number = 1.0

        /** Modifies the DEFAULT_HEIGHT of this screen to change its size. */
        private yScaling: number = 1.0

        /** For minor tweaks to positioning of this.alignment. Modifies this.bounds.left */
        private xOffset: number

        /** For minor tweaks to positioning of this.alignment. Modifies this.bounds.top */
        private yOffset: number

        /** Does this component have coloured (shadowed) borders? */
        private hasBorder: boolean

        private showBackground: boolean

        constructor(opts: {
            alignment: GUIComponentAlignment
            isActive: boolean
            isHidden?: boolean
            xOffset?: number
            yOffset?: number
            xScaling?: number
            yScaling?: number
            colour?: number
            border?: boolean
            showBackground?: boolean
        }) {
            super()

            this.alignment = opts.alignment

            this.isActive = opts.isActive
            this.isHidden = opts.isHidden != null ? opts.isHidden : false

            this.context = []

            this.xScaling = opts.xScaling ? opts.xScaling : this.xScaling
            this.yScaling = opts.yScaling ? opts.yScaling : this.yScaling

            this.backgroundColour = opts.colour
                ? opts.colour
                : this.backgroundColour

            this.xOffset = opts.xOffset != null ? opts.xOffset : 0
            this.yOffset = opts.yOffset != null ? opts.yOffset : 0

            this.unscaledWidth = screen().width >> 1
            this.unscaledHeight = screen().height >> 1
            this.hasBorder = opts.border != null ? opts.border : false

            this.showBackground =
                opts.showBackground != null ? opts.showBackground : true

            const pos = this.getLeftAndTop()
            const left = pos[0]
            const top = pos[1]

            this.bounds = new Bounds({
                width: this.unscaledWidth * this.xScaling,
                height: this.unscaledHeight * this.yScaling,
                left,
                top,
            })
        }

        //------------------
        // Helper functions:
        //------------------

        private getLeftAndTop(): number[] {
            let left = 0
            let top = 0

            switch (this.alignment) {
                case GUIComponentAlignment.TOP: {
                    left =
                        -((this.unscaledWidth * this.xScaling) >> 1) +
                        this.xOffset
                    top = -(screen().height >> 1) + this.yOffset
                    break
                }
                case GUIComponentAlignment.LEFT: {
                    left = -(screen().width >> 1) + this.xOffset
                    top =
                        -((this.unscaledHeight * this.yScaling) >> 1) +
                        this.yOffset
                    break
                }
                case GUIComponentAlignment.RIGHT: {
                    left =
                        (screen().width >> 1) -
                        this.unscaledWidth * this.xScaling +
                        this.xOffset
                    top =
                        -((this.unscaledHeight * this.yScaling) >> 1) +
                        this.yOffset
                    break
                }
                case GUIComponentAlignment.BOT: {
                    left =
                        -((this.unscaledWidth * this.xScaling) >> 1) +
                        this.xOffset
                    top =
                        (screen().height >> 1) -
                        this.unscaledHeight * this.yScaling -
                        this.yOffset
                    break
                }
                case GUIComponentAlignment.CENTRE: {
                    left =
                        -((this.unscaledWidth * this.xScaling) >> 1) +
                        this.xOffset
                    top =
                        -((this.unscaledHeight * this.yScaling) >> 1) +
                        this.yOffset
                    break
                }
                case GUIComponentAlignment.TOP_RIGHT: {
                    left =
                        (screen().width >> 1) -
                        this.unscaledWidth * this.xScaling +
                        this.xOffset
                    top = -(screen().height >> 1) + this.yOffset
                    break
                }
                case GUIComponentAlignment.TOP_LEFT: {
                    left = -(screen().width >> 1) + this.xOffset
                    top = -(screen().height >> 1) + this.yOffset
                    break
                }
                case GUIComponentAlignment.BOT_RIGHT: {
                    left =
                        (screen().width >> 1) -
                        this.unscaledWidth * this.xScaling +
                        this.xOffset
                    top =
                        (screen().height >> 1) -
                        this.unscaledHeight * this.yScaling -
                        this.yOffset
                    break
                }
                case GUIComponentAlignment.BOT_LEFT: {
                    left = -(screen().width >> 1) + this.xOffset
                    top =
                        (screen().height >> 1) -
                        this.unscaledHeight * this.yScaling -
                        this.yOffset
                    break
                }
            }

            return [left, top]
        }

        //-------------------------
        // Public facing functions:
        //-------------------------

        /**
         * Adjusts .xScaling & .yScaling, then this.bounds() as appropriate.
         * @param xScaling 1.0 is default; affects this.bounds.width: width = (this.xScaling * this.unscaledWidth)
         * @param yScaling 1.0 is default; affects this.bounds.height: height = (this.yScaling * this.unscaledHeight)
         */
        public rescale(xScaling: number, yScaling: number): void {
            if (this.bounds != null) {
                this.xScaling = xScaling
                this.yScaling = yScaling
                this.bounds = new Bounds({
                    width: this.unscaledWidth * this.xScaling,
                    height: this.unscaledHeight * this.yScaling,
                    left: this.bounds.left,
                    top: this.bounds.top,
                })
            }
        }

        /**
         * Invoked by parent, see Window.
         */
        public draw(): void {
            if (this.showBackground) {
                screen().fillRect(
                    this.bounds.left + (screen().width >> 1) + 2,
                    this.bounds.top + (screen().height >> 1) + 2,
                    this.bounds.width,
                    this.bounds.height,
                    15,
                )

                this.bounds.fillRect(this.backgroundColour)
            }
        }

        public get width() {
            return this.unscaledWidth * this.xScaling
        }
        public get height() {
            return this.unscaledHeight * this.yScaling
        }
        public get active() {
            return this.isActive
        }
        public get hidden() {
            return this.isHidden
        }

        public getAlignment(): number {
            return this.alignment
        }
        public makeActive(): void {
            this.isActive = true
        }
        public unmakeActive(): void {
            this.isActive = false
        }

        public hide(): void {
            this.isHidden = true
        }
        public unHide(): void {
            this.isHidden = false
        }

        /**
         * This should be overriden.
         * Other components should use this to get this components state.
         * @returns pertinent component state information, in appropriate format; at child components discretion.
         */
        public getContext(): any[] {
            return this.context
        }

        public addContext(newContext: any[]) {
            this.context.push(newContext)
        }

        public clearContext(): void {
            this.context = []
        }

        public setBounds(bounds: Bounds): void {
            this.bounds = bounds
        }
    }

    /**
     * Component that contains a Title + a chunk of text.
     */
    export class TextBox extends GUIComponentAbstract {
        private title: string
        private maxCharactersPerLine: number
        private textChunks: string[]

        constructor(opts: {
            alignment: GUIComponentAlignment
            isActive: boolean
            isHidden?: boolean
            xOffset?: number
            yOffset?: number
            xScaling?: number
            yScaling?: number
            colour?: number
            border?: boolean
            title?: string
            text?: string | string[]
            showBackground?: boolean
        }) {
            super({
                alignment: opts.alignment,
                xOffset: opts.xOffset != null ? opts.xOffset : 0,
                yOffset: opts.yOffset != null ? opts.yOffset : 0,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border,
                showBackground: opts.showBackground,
            })

            this.title = opts.title != null ? opts.title : ""
            this.maxCharactersPerLine = this.width / (font.charWidth + 1)

            if (opts.text == null) {
                this.textChunks = [""]
            } else if (typeof opts.text === "string") {
                this.textChunks = []

                for (
                    let i = 0;
                    i < opts.text.length;
                    i += this.maxCharactersPerLine
                ) {
                    this.textChunks.push(
                        opts.text.slice(i, i + this.maxCharactersPerLine),
                    )
                }
            } else {
                this.textChunks = opts.text
            }
        }

        draw() {
            super.draw()
            // this.printCenter(this.text)

            const titleOffset = (font.charWidth * this.title.length) >> 1

            screen().print(
                this.title,
                (screen().width >> 1) +
                    this.bounds.left +
                    (this.width >> 1) -
                    titleOffset,
                (screen().height >> 1) + this.bounds.top + 2,
            )

            let yOffset = 12
            this.textChunks.forEach(textChunk => {
                const textOffset = (font.charWidth * textChunk.length) >> 1
                screen().print(
                    textChunk,
                    (screen().width >> 1) +
                        this.bounds.left +
                        (this.width >> 1) -
                        textOffset,
                    (screen().height >> 1) + this.bounds.top + 2 + yOffset,
                )

                yOffset += 10
            })
        }
    }

    export class GUISlider extends TextBox {
        private maximum: number
        private minimum: number
        private sliderColour: number

        constructor(opts: {
            alignment: GUIComponentAlignment
            isActive: boolean
            isHidden?: boolean
            xOffset?: number
            yOffset?: number
            xScaling?: number
            yScaling?: number
            colour?: number
            backgroundColour?: number
            showBackground?: boolean
            border?: boolean
            title?: string
            sliderMax?: number
            sliderMin?: number
        }) {
            super({
                alignment: opts.alignment,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: opts.xOffset != null ? opts.xOffset : 0,
                yOffset: opts.yOffset != null ? opts.yOffset : 0,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.backgroundColour,
                border: opts.border,
                showBackground: opts.showBackground,
            })

            this.maximum = opts.sliderMax != null ? opts.sliderMax : 100
            this.minimum = opts.sliderMin != null ? opts.sliderMin : 0
            this.sliderColour = opts.colour != null ? opts.colour : 13

            this.context = [
                (Math.abs(this.maximum) + Math.abs(this.minimum)) / 2,
            ]

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    let tick = true
                    control.onEvent(
                        ControllerButtonEvent.Released,
                        controller.up.id,
                        () => (tick = false),
                    )

                    // Control logic:
                    while (tick) {
                        this.context[0] = Math.min(
                            this.context[0] + 10,
                            this.maximum,
                        )
                        basic.pause(100)
                    }
                    control.onEvent(
                        ControllerButtonEvent.Released,
                        controller.up.id,
                        () => {},
                    )
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    let tick = true
                    control.onEvent(
                        ControllerButtonEvent.Released,
                        controller.down.id,
                        () => (tick = false),
                    )

                    // Control logic:
                    while (tick) {
                        this.context[0] = Math.max(
                            this.context[0] - 10,
                            this.minimum,
                        )
                        basic.pause(100)
                    }
                    control.onEvent(
                        ControllerButtonEvent.Released,
                        controller.down.id,
                        () => {},
                    )
                },
            )
        }

        draw() {
            super.draw()

            const rodWidth = 10

            // Black border for shadow effect:
            screen().fillRect(
                this.bounds.left +
                    (this.bounds.width >> 1) +
                    (screen().width >> 1) -
                    (rodWidth >> 1),
                this.bounds.top + (screen().height >> 1),
                rodWidth + 1,
                this.bounds.height + 1,
                0,
            )

            screen().fillRect(
                this.bounds.left +
                    (this.bounds.width >> 1) +
                    (screen().width >> 1) -
                    (rodWidth >> 1),
                this.bounds.top + (screen().height >> 1),
                rodWidth,
                this.bounds.height,
                this.sliderColour,
            )

            const sliderWidth = 20
            const sliderHeight = 10
            const y =
                this.context[0] /
                (Math.abs(this.minimum) + Math.abs(this.maximum))
            const slideableRegion = this.bounds.height - sliderHeight

            // Black border for shadow effect:
            screen().fillRect(
                this.bounds.left +
                    (this.bounds.width >> 1) +
                    (screen().width >> 1) -
                    (sliderWidth >> 1),
                this.bounds.top +
                    (screen().height >> 1) +
                    (slideableRegion - y * slideableRegion),
                sliderWidth + 1,
                sliderHeight + 1,
                0,
            )

            screen().fillRect(
                this.bounds.left +
                    (this.bounds.width >> 1) +
                    (screen().width >> 1) -
                    (sliderWidth >> 1),
                this.bounds.top +
                    (screen().height >> 1) +
                    (slideableRegion - y * slideableRegion),
                sliderWidth,
                sliderHeight,
                this.sliderColour,
            )
        }
    }

    export class GUIGraph extends TextBox {
        private graphableFns: GraphableFunction[]

        constructor(opts: {
            alignment: GUIComponentAlignment
            graphableFns: GraphableFunction[]
            isActive: boolean
            isHidden?: boolean
            xOffset?: number
            yOffset?: number
            xScaling?: number
            yScaling?: number
            colour?: number
            border?: boolean
            title?: string
            showBackground?: boolean
        }) {
            super({
                alignment: opts.alignment,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: opts.xOffset != null ? opts.xOffset : 0,
                yOffset: opts.yOffset != null ? opts.yOffset : 0,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border,
                showBackground: opts.showBackground,
            })

            this.graphableFns = opts.graphableFns
            const bufferScalar = opts.xScaling != null ? opts.xScaling : 1
            this.graphableFns.forEach(gf => gf.setBufferSize(60 * bufferScalar))
        }

        draw() {
            super.draw()

            const left = this.bounds.left
            const top = this.bounds.top

            this.bounds.fillRect(15)

            //-------------------------------
            // Load the buffer with new data:
            //-------------------------------

            for (let i = 0; i < this.graphableFns.length; i++) {
                const hasSpace =
                    this.graphableFns[i].getBufferLength() <
                    this.graphableFns[i].getMaxBufferSize()
                this.graphableFns[i].readIntoBufferOnce(
                    (screen().height >> 1) + top,
                    this.bounds.height,
                ) // 8
            }

            //----------------------------
            // Draw sensor lines & ticker:
            //----------------------------
            for (let i = 0; i < this.graphableFns.length; i++) {
                const sensor = this.graphableFns[i]
                const color: number = 3

                // Draw lines:
                sensor.draw((screen().width >> 1) + left + 3, color)

                // Draw the latest reading on the right-hand side as a Ticker if at no-zoom:
                if (sensor.getHeightNormalisedBufferLength() > 0) {
                    const reading = sensor.getNthReading(
                        sensor.getBufferLength() - 1,
                    )
                    const readingAsString = reading.toString().slice(0, 5)
                    const range =
                        Math.abs(sensor.getMinimum()) + sensor.getMaximum()
                    const y = Math.round(
                        this.bounds.height -
                            this.bounds.height *
                                ((reading - sensor.getMinimum()) / range),
                    )

                    // Make sure the ticker won't be cut-off by other UI elements
                    // if (y > sensor.getMinimum() + 5) {
                    screen().print(
                        readingAsString,
                        this.bounds.left +
                            this.bounds.width +
                            (screen().width >> 1) -
                            readingAsString.length * font.charWidth,
                        y + top + this.bounds.height - 4,
                        color,
                        bitmaps.font5,
                    )
                    // }
                }
            }

            //---------------------------------
            // Draw the axis and their markers:
            //---------------------------------

            //------
            // Axes:
            //------
            for (let i = 0; i < 2; i++) {
                // X-Axis:
                screen().drawLine(
                    left + (screen().width >> 1),
                    (screen().height >> 1) + top + this.bounds.height + i,
                    left + this.bounds.width + (screen().width >> 1),
                    (screen().height >> 1) + top + this.bounds.height + i,
                    5,
                )

                // Y-Axis:
                screen().drawLine(
                    left + (screen().width >> 1) + i,
                    (screen().height >> 1) + top,
                    left + (screen().width >> 1) + i,
                    (screen().height >> 1) + this.bounds.height + top,
                    5,
                )
            }

            //----------
            // Ordinate:
            //----------
            // if (this.globalSensorMinimum != null && this.globalSensorMaximum != null) {
            //     // Bot:
            //     screen().print(
            //         this.globalSensorMinimum.toString(),
            //         (6 * font.charWidth) - (this.globalSensorMinimum.toString().length * font.charWidth),
            //         this.bounds.height - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset - (Screen.HEIGHT * 0.03125), // 4
            //         15
            //     )

            //     // Top:
            //     screen().print(
            //         this.globalSensorMaximum.toString(),
            //         (6 * font.charWidth) - (this.globalSensorMaximum.toString().length * font.charWidth),
            //         Screen.HEIGHT - this.bounds.height + this.windowTopBuffer - Math.floor(0.1 * this.yScrollOffset),
            //         15
            //     )
            // }

            //----------
            // Abscissa:
            //----------

            // Start
            screen().print(
                this.graphableFns[0].numberOfReadings.toString(),
                (screen().width >> 1) + this.bounds.left,
                this.bounds.top +
                    this.bounds.height +
                    (screen().height >> 1) +
                    3,
                1,
            )

            // End:
            const end: string = (
                this.graphableFns[0].numberOfReadings +
                this.graphableFns[0].getHeightNormalisedBufferLength()
            ).toString()
            screen().print(
                end,
                (screen().width >> 1) +
                    this.bounds.left +
                    this.bounds.width -
                    end.length * font.charWidth +
                    2,
                this.bounds.top +
                    this.bounds.height +
                    (screen().height >> 1) +
                    3,
                1,
            )
            basic.pause(100)
        }
    }

    export class GUISceneAbstract extends GUIComponentAbstract {
        navigator: INavigator
        public cursor: Cursor
        public picker: Picker

        constructor(opts: {
            alignment: GUIComponentAlignment
            navigator: INavigator
            isActive: boolean
            isHidden: boolean
            xOffset?: number
            yOffset?: number
            width: number
            height: number
            xScaling?: number
            yScaling?: number
            colour?: number
        }) {
            super({
                alignment: opts.alignment,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: opts.xOffset != null ? opts.xOffset : 0,
                yOffset: opts.yOffset != null ? opts.yOffset : 0,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
            })

            this.navigator = opts.navigator

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => this.moveCursor(CursorDir.Right),
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => this.moveCursor(CursorDir.Up),
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => this.moveCursor(CursorDir.Down),
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => this.moveCursor(CursorDir.Left),
            )

            // click
            const click = () => this.cursor.click()
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                click,
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id + keymap.PLAYER_OFFSET,
                click,
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => this.back(),
            )

            // this.cursor = new Cursor()
            // this.picker = new Picker(this.cursor)
            // this.navigator = new RowNavigator()
            // this.cursor.navigator = this.navigator
        }

        protected moveCursor(dir: CursorDir) {
            try {
                this.moveTo(this.cursor.move(dir))
            } catch (e) {
                if (dir === CursorDir.Up && e.kind === BACK_BUTTON_ERROR_KIND)
                    this.back()
                else if (
                    dir === CursorDir.Down &&
                    e.kind === FORWARD_BUTTON_ERROR_KIND
                )
                    return
                else throw e
            }
        }

        protected moveTo(target: Button) {
            if (!target) return
            this.cursor.moveTo(
                target.xfrm.worldPos,
                target.ariaId,
                target.bounds,
                target.isTooltipEnabled(),
            )
        }

        back() {
            if (!this.cursor.cancel()) this.moveCursor(CursorDir.Back)
        }

        protected handleClick(x: number, y: number) {
            const target = this.cursor.navigator.screenToButton(
                x - Screen.HALF_WIDTH,
                y - Screen.HALF_HEIGHT,
            )
            if (target) {
                this.moveTo(target)
                target.click()
            } else if (this.picker.visible) {
                this.picker.hide()
            }
        }

        protected handleMove(x: number, y: number) {
            const btn = this.cursor.navigator.screenToButton(
                x - Screen.HALF_WIDTH,
                y - Screen.HALF_HEIGHT,
            )
            if (btn) {
                const w = btn.xfrm.worldPos
                this.cursor.snapTo(
                    w.x,
                    w.y,
                    btn.ariaId,
                    btn.bounds,
                    btn.isTooltipEnabled(),
                )
                btn.reportAria(true)
            }
        }

        /* override */ shutdown() {
            this.navigator.clear()
        }

        /* override */ activate() {
            // super.activate()
            const btn = this.navigator.initialCursor(0, 0)
            if (btn) {
                const w = btn.xfrm.worldPos
                this.cursor.snapTo(
                    w.x,
                    w.y,
                    btn.ariaId,
                    btn.bounds,
                    btn.isTooltipEnabled(),
                )
                btn.reportAria(true)
            }
        }

        /* override */ update() {
            this.cursor.update()
        }

        /* override */ draw() {
            this.picker.draw()
            this.cursor.draw()
        }
    }

    const KEYBOARD_FRAME_COUNTER_CURSOR_ON = 20
    const KEYBOARD_FRAME_COUNTER_CURSOR_OFF = 40
    const KEYBOARD_MAX_TEXT_LENGTH = 20

    // export class KeyboardComponent extends GUIComponentAbstract {
    //     private static WIDTHS: number[] = [10, 10, 10, 10, 4]
    //     // private btns: Button[]
    //     private btnBounds: Bounds[]
    //     private btnText: string[]

    //     private text: string;
    //     private upperCase: boolean;
    //     private next: (arg0: string) => void;
    //     private frameCounter: number;
    //     private shakeText: boolean
    //     private shakeTextCounter: number

    //     constructor(opts: {
    //         alignment: GUIComponentAlignment,
    //         isActive: boolean,
    //         next: (arg0: string) => void,
    //         isHidden?: boolean,
    //         xOffset?: number,
    //         yOffset?: number,
    //         xScaling?: number,
    //         yScaling?: number,
    //         colour?: number,
    //     }) {
    //         super({
    //             alignment: opts.alignment,
    //             isActive: opts.isActive,
    //             isHidden: (opts.isHidden != null) ? opts.isHidden : false,
    //             xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
    //             yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
    //             xScaling: opts.xScaling,
    //             yScaling: opts.yScaling,
    //             colour: opts.colour
    //         })

    //         this.text = ""
    //         this.upperCase = true

    //         // this.btns = [];
    //         this.btnBounds = [];

    //         this.btnText = [
    //             "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    //             "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    //             "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    //             "U", "V", "W", "X", "Y", "Z", ",", ".", "?", "!",
    //                "<-",   "^",     " _______ ",      "ENTER"
    //         ];

    //         this.next = opts.next
    //         this.frameCounter = 0;
    //         this.shakeText = false;
    //         this.shakeTextCounter = 0;

    //         const defaultBehaviour = (btn: Button) => {
    //             if (this.text.length < KEYBOARD_MAX_TEXT_LENGTH) {
    //                 this.text += this.btnText[btn.state[0]]
    //                 this.frameCounter = KEYBOARD_FRAME_COUNTER_CURSOR_ON
    //             }
    //             else {
    //                 this.shakeText = true
    //             }
    //         }

    //         for (let i = 0; i < 4; i++) {
    //             const xDiff = screen().width / (KeyboardComponent.WIDTHS[i] + 1);
    //             for (let j = 0; j < 10; j++) {
    //                 this.btns.push(
    //                     new Button({
    //                         parent: null,
    //                         style: ButtonStyles.Transparent,
    //                         icon: bitmaps.create(10, 10),
    //                         ariaId: "",
    //                         x: (xDiff * (j + 1)) - (screen().width >> 1),
    //                         y: (13 * (i + 1)) - 18,
    //                         onClick: defaultBehaviour,
    //                         state: [(i * 10) + j]
    //                     })
    //                 )
    //             }
    //         }

    //         const botRowBehaviours = [
    //             () => {
    //                 this.text =
    //                     (this.text.length > 0)
    //                         ? this.text.substr(0, this.text.length - 1)
    //                         : this.text
    //                 this.frameCounter = KEYBOARD_FRAME_COUNTER_CURSOR_ON
    //             },
    //             () => { this.changeCase() },
    //             () => {
    //                 if (this.text.length < KEYBOARD_MAX_TEXT_LENGTH) {
    //                     this.text += " ";
    //                     this.frameCounter = KEYBOARD_FRAME_COUNTER_CURSOR_ON;
    //                 }
    //                 else {
    //                     this.shakeText = true
    //                 }
    //             },
    //             () => { this.next(this.text) }
    //         ]

    //         const icons = [bitmaps.create(16, 10), bitmaps.create(10, 10), bitmaps.create(55, 10), bitmaps.create(33, 10)]
    //         const x = [22, 38, 74, 124]
    //         for (let i = 0; i < 4; i++) {
    //             this.btns.push(
    //                 new Button({
    //                     parent: null,
    //                     style: ButtonStyles.Transparent,
    //                     icon: icons[i],
    //                     ariaId: "",
    //                     x: x[i] - (screen().width >> 1),
    //                     y: (13 * 5) - 18,
    //                     onClick: botRowBehaviours[i]
    //                 })
    //             )
    //         }

    //         this.changeCase()
    //     }

    //     private changeCase() {
    //         this.upperCase = !this.upperCase;

    //         if (this.upperCase)
    //             this.btnText = this.btnText.map((btn, i) =>
    //                 btn = (i < 40) ? btn.toUpperCase() : btn
    //             )
    //         else
    //             this.btnText = this.btnText.map((btn, i) =>
    //                 btn = (i < 40) ? btn.toLowerCase() : btn
    //             )
    //     }

    //     draw() {
    //         super.draw()
    //         this.frameCounter += 1

    //         for (let i = 0; i < this.btns.length; i++) {
    //             const x = (screen().width >> 1) + this.btns[i].xfrm.localPos.x - (this.btns[i].icon.width >> 1) + 2
    //             const y = (screen().height >> 1) + this.btns[i].xfrm.localPos.y + font.charHeight - 12
    //             screen().print(this.btnText[i], x, y, 1) // White text
    //         }
    //     }
    // }

    export class TextButton {
        public bounds: Bounds
        private shadowBounds: Bounds

        public callback: () => void

        private text: string
        private colour: number
        private shadowColour: number
        private textColour: number

        constructor(opts: {
            text: string
            callback: () => void
            x?: number
            y?: number
            colour?: number
            textColour?: number
        }) {
            this.text = opts.text

            const x = opts.x != null ? opts.x : 0
            const y = opts.y != null ? opts.y : 0
            this.bounds = new Bounds({
                top: y,
                left: x,
                width: font.charWidth * (this.text.length + 1) + 1, // + 1 for the cursor in ButtonCollection to draw on top of.
                height: font.charHeight + 2,
            })

            this.shadowBounds = new Bounds({
                top: this.bounds.top,
                left: this.bounds.left + 1,
                width: this.bounds.width + 1, // + 1 for the cursor in ButtonCollection to draw on top of.
                height: this.bounds.height + 1,
            })

            this.callback = opts.callback

            this.colour = opts.colour != null ? opts.colour : 6
            this.shadowColour = 15
            this.textColour = opts.textColour != null ? opts.textColour : 1
        }

        public shiftBounds(
            leftShift: number,
            topShift: number,
            widthShift: number,
            heightShift: number,
        ) {
            this.bounds.left += leftShift
            this.bounds.top += topShift
            this.bounds.width += widthShift
            this.bounds.height += heightShift

            this.shadowBounds.left += leftShift
            this.shadowBounds.top += topShift
            this.shadowBounds.width += widthShift
            this.shadowBounds.height += heightShift
        }

        public setShadowColour(newColour: number) {
            this.shadowColour = newColour
        }

        draw() {
            this.shadowBounds.fillRect(this.shadowColour)
            this.bounds.fillRect(this.colour)

            screen().print(
                this.text,
                this.bounds.left + (screen().width >> 1) + 3,
                this.bounds.top + (screen().height >> 1) + 1,
                this.textColour,
            )
        }
    }

    export class TextButtonCollection extends GUIComponentAbstract {
        private title: string
        private textBtns: TextButton[]
        private selectedTextBtnIndex: number
        private cursorBounds: Bounds

        constructor(opts: {
            alignment: GUIComponentAlignment
            isActive: boolean
            textBtns: TextButton[]
            isHidden?: boolean
            xOffset?: number
            yOffset?: number
            xScaling?: number
            yScaling?: number
            colour?: number
            border?: boolean
            title?: string
            text?: string | string[]
        }) {
            super({
                alignment: opts.alignment,
                xOffset: opts.xOffset != null ? opts.xOffset : 0,
                yOffset: opts.yOffset != null ? opts.yOffset : 0,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border,
            })

            this.title = opts.title != null ? opts.title : ""
            this.textBtns = opts.textBtns != null ? opts.textBtns : []
            this.selectedTextBtnIndex = 0

            const titleYOffset = this.title != "" ? 13 : 0
            const btnXOffset =
                this.textBtns.length > 0
                    ? this.bounds.width / (this.textBtns.length + 1)
                    : 0

            let cumulativeXOffset = 0
            this.textBtns.forEach(btn => {
                btn.shiftBounds(
                    this.bounds.left,
                    this.bounds.top + titleYOffset + cumulativeXOffset,
                    0,
                    0,
                )
                cumulativeXOffset += btnXOffset
            })

            // Cursor:
            if (this.textBtns.length > 0) {
                this.cursorBounds = new Bounds({
                    top:
                        this.textBtns[this.selectedTextBtnIndex].bounds.top - 1,
                    left: this.textBtns[this.selectedTextBtnIndex].bounds.left,
                    width:
                        this.textBtns[this.selectedTextBtnIndex].bounds.width +
                        2,
                    height:
                        this.textBtns[this.selectedTextBtnIndex].bounds.height +
                        2,
                })
                this.textBtns[this.selectedTextBtnIndex].setShadowColour(6)
            }
        }

        public makeActive() {
            super.makeActive()
            this.setupButtonBindings()
        }

        setupButtonBindings() {
            unbindShieldButtons()

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.textBtns.length > 0) {
                        this.textBtns[this.selectedTextBtnIndex].callback()
                    }
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {},
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.textBtns[this.selectedTextBtnIndex].setShadowColour(15)

                    this.selectedTextBtnIndex = Math.max(
                        this.selectedTextBtnIndex - 1,
                        0,
                    )
                    this.cursorBounds = new Bounds({
                        top:
                            this.textBtns[this.selectedTextBtnIndex].bounds
                                .top - 1,
                        left: this.textBtns[this.selectedTextBtnIndex].bounds
                            .left,
                        width:
                            this.textBtns[this.selectedTextBtnIndex].bounds
                                .width + 2,
                        height:
                            this.textBtns[this.selectedTextBtnIndex].bounds
                                .height + 2,
                    })
                    this.textBtns[this.selectedTextBtnIndex].setShadowColour(6)
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.textBtns[this.selectedTextBtnIndex].setShadowColour(15)

                    this.selectedTextBtnIndex =
                        (this.selectedTextBtnIndex + 1) % this.textBtns.length
                    this.cursorBounds = new Bounds({
                        top:
                            this.textBtns[this.selectedTextBtnIndex].bounds
                                .top - 1,
                        left: this.textBtns[this.selectedTextBtnIndex].bounds
                            .left,
                        width:
                            this.textBtns[this.selectedTextBtnIndex].bounds
                                .width + 2,
                        height:
                            this.textBtns[this.selectedTextBtnIndex].bounds
                                .height + 2,
                    })
                    this.textBtns[this.selectedTextBtnIndex].setShadowColour(6)
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {},
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {},
            )
        }

        draw() {
            super.draw()

            const titleOffset = (font.charWidth * this.title.length) >> 1

            screen().print(
                this.title,
                (screen().width >> 1) +
                    this.bounds.left +
                    (this.width >> 1) -
                    titleOffset,
                (screen().height >> 1) + this.bounds.top + 2,
            )

            this.textBtns.forEach(btn => btn.draw())

            if (this.textBtns.length > 0) {
                this.cursorBounds.drawRect(9)
            }
        }
    }

    /**
     * Holds other components,
     * One component is active at a time
     */
    export class GUIComponentScene extends Scene {
        private components: GUIComponentAbstract[]
        private currentComponentID: number

        constructor(opts: {
            app: AppInterface
            colour?: number
            next?: (arg0: any[]) => void
            back?: (arg0: any[]) => void
            components?: GUIComponentAbstract[]
        }) {
            super(opts.app)

            if (opts.colour != null) this.backgroundColor = opts.colour

            this.components = opts.components
            this.currentComponentID = 0
        }

        public activate() {
            super.activate()
            this.focus(true)
        }

        public deactivate() {
            super.activate()

            this.components[this.currentComponentID].hide()
            this.components[this.currentComponentID].unmakeActive()
        }

        public makeComponentActive(componentID: number, hideOthers: boolean) {
            this.currentComponentID = componentID
            this.focus(hideOthers)
        }

        public updateComponentsContext(componentID: number, context: any[]) {
            this.components[componentID].addContext(context)
        }

        /* override */ startup() {
            super.startup()
        }

        private focus(hideOthers: boolean) {
            if (hideOthers)
                this.components.forEach(component => {
                    component.hide()
                })
            this.components.forEach(component => {
                component.unmakeActive()
            })

            this.components[this.currentComponentID].unHide()
            this.components[this.currentComponentID].makeActive()
        }

        showAllComponents() {
            this.components.forEach(component => component.unHide())
        }

        draw() {
            super.draw()

            screen().fillRect(
                0,
                0,
                screen().width,
                screen().height,
                this.backgroundColor,
            )

            if (this.components != null) {
                this.components.forEach(component => {
                    if (!component.hidden && !component.active) component.draw()
                })
            }

            // Always draw active ontop
            this.components[this.currentComponentID].draw()
        }
    }

    export class ButtonCollection extends GUIComponentAbstract {
        private btns: Button[][]
        private numberOfRows: number
        private numberOfCols: number[]

        private cursorBounds: Bounds
        private cursorOutlineColour: number
        private cursorRow: number
        private cursorCol: number

        constructor(opts: {
            alignment: GUIComponentAlignment
            btns: Button[][]
            isActive: boolean
            isHidden?: boolean
            xOffset?: number
            yOffset?: number
            xScaling?: number
            yScaling?: number
            colour?: number
            border?: boolean
            title?: string
            cursorColour?: number
        }) {
            super({
                alignment: opts.alignment,
                xOffset: opts.xOffset != null ? opts.xOffset : 0,
                yOffset: opts.yOffset != null ? opts.yOffset : 0,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border,
            })

            if (opts.btns != null) {
                this.btns = opts.btns

                // Adjust button x & y to be relative to this components window left & top:
                this.btns.forEach(row => {
                    row.forEach(btn => {
                        btn.xfrm.localPos.x =
                            this.bounds.left +
                            btn.xfrm.localPos.x +
                            (btn.width >> 1) +
                            2
                        btn.xfrm.localPos.y =
                            this.bounds.top +
                            btn.xfrm.localPos.y +
                            (btn.height >> 1) +
                            2
                    })
                })

                this.isActive = opts.isActive

                this.numberOfCols = this.btns.map(row => row.length)
                this.numberOfRows = this.btns.length

                this.cursorBounds = new Bounds({
                    width: this.btns[0][0].width + 4,
                    height: this.btns[0][0].height + 4,
                    left:
                        this.btns[0][0].xfrm.localPos.x -
                        (this.btns[0][0].width >> 1) -
                        2,
                    top:
                        this.btns[0][0].xfrm.localPos.y -
                        (this.btns[0][0].height >> 1) -
                        2,
                })
                this.cursorOutlineColour =
                    opts.cursorColour != null ? opts.cursorColour : 9 // Default is light blue
                this.cursorRow = 0
                this.cursorCol = 0

                if (this.isActive) this.bindShieldButtons()
            }
        }

        bindShieldButtons() {
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.cursorCol == this.numberOfCols[this.cursorRow])
                        this.cursorCol = 0
                    else
                        this.cursorCol =
                            (this.cursorCol + 1) %
                            this.numberOfCols[this.cursorRow]
                    this.updateCursor()
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.cursorRow =
                        (((this.cursorRow - 1) % this.numberOfRows) +
                            this.numberOfRows) %
                        this.numberOfRows // Non-negative modulo

                    // Row above might have less cols, adjust if neccessary:
                    if (this.numberOfCols[this.cursorRow] <= this.cursorCol)
                        this.cursorCol = this.numberOfCols[this.cursorRow] - 1
                    this.updateCursor()
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.cursorRow = (this.cursorRow + 1) % this.numberOfRows

                    // Row below might have less cols, adjust if neccessary:
                    if (this.numberOfCols[this.cursorRow] <= this.cursorCol)
                        this.cursorCol = this.numberOfCols[this.cursorRow] - 1
                    this.updateCursor()
                },
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.cursorCol == 0)
                        this.cursorCol = this.numberOfCols[this.cursorRow] - 1
                    else this.cursorCol -= 1
                    this.updateCursor()
                },
            )

            // click
            const click = () => this.click()
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                click,
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id + keymap.PLAYER_OFFSET,
                click,
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => this.back(),
            )
        }

        makeActive() {
            this.isActive = true
            this.bindShieldButtons()
        }

        unmakeActive() {
            this.isActive = false
            unbindShieldButtons()
        }

        click() {
            this.btns[this.cursorRow][this.cursorCol].onClick(
                this.btns[this.cursorRow][this.cursorCol],
            )
        }

        back() {}

        updateCursor() {
            const x = this.cursorRow
            const y = this.cursorCol
            this.cursorBounds = new Bounds({
                width: this.btns[x][y].width + 4,
                height: this.btns[x][y].height + 4,
                left:
                    this.btns[x][y].xfrm.localPos.x -
                    (this.btns[x][y].width >> 1) -
                    2,
                top:
                    this.btns[x][y].xfrm.localPos.y -
                    (this.btns[x][y].height >> 1) -
                    2,
            })
            this.drawCursor()
        }

        drawCursor() {
            this.cursorBounds.fillRect(this.cursorOutlineColour)
        }

        drawCursorText() {
            const text = this.btns[this.cursorRow][this.cursorCol].ariaId

            if (text) {
                const pos = this.cursorBounds
                const n = text.length
                const font = user_interface_base.font
                const w = font.charWidth * n
                const h = font.charHeight
                const x = Math.max(
                    Screen.LEFT_EDGE + 1,
                    Math.min(
                        Screen.RIGHT_EDGE - 1 - w,
                        pos.left + (pos.width >> 1) - (w >> 1),
                    ),
                )
                const y = Math.min(
                    pos.top + pos.height + 1,
                    Screen.BOTTOM_EDGE - 1 - font.charHeight,
                )
                Screen.fillRect(x - 1, y - 1, w + 1, h + 2, 15)
                Screen.print(text, x, y, 1, font)
            }
        }

        draw() {
            if (!this.isHidden) {
                super.draw()
                if (this.isActive) {
                    this.drawCursor()
                }

                this.btns.forEach(btnRow => btnRow.forEach(btn => btn.draw()))

                if (this.isActive) {
                    this.drawCursorText()
                }
            }
        }
    }

    // export class KeyboardComponent extends ButtonCollection {
    //     constructor(opts: {
    //         alignment: GUIComponentAlignment,
    //         isActive: boolean,
    //         next: (arg0: string) => void,
    //         isHidden?: boolean,
    //         xOffset?: number,
    //         yOffset?: number,
    //         xScaling?: number,
    //         yScaling?: number,
    //         colour?: number,
    //     }) {
    //         super({
    //             alignment: opts.alignment,
    //             btns: [[new Button({ icon: "accelerometer", onClick: () => basic.showNumber(0) })]],
    //             isActive: opts.isActive,
    //             isHidden: (opts.isHidden != null) ? opts.isHidden : false,
    //             xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
    //             yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
    //             xScaling: opts.xScaling,
    //             yScaling: opts.yScaling,
    //             colour: opts.colour
    //         })
    //     }
    // }
}
