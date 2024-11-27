namespace microcode {
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
        BOT_LEFT
    }

    /**
     * Greatly simplifies the creation & alignment of GUI components.
     * A GUI Component has a .context for storage of hidden component state.
     */
    abstract class GUIComponentAbstract extends Scene {
        public static DEFAULT_WIDTH: number = screen().width >> 1;
        public static DEFAULT_HEIGHT: number = screen().height >> 1;
        
        protected isActive: boolean;
        protected isHidden: boolean;

        protected context: any[];

        protected bounds: Bounds;
        protected backgroundColour: number = 3;

        private alignment: GUIComponentAlignment
        private xScaling: number = 1.0;
        private yScaling: number = 1.0;

        private xOffset: number;
        private yOffset: number;
        private unscaledComponentWidth: number;
        private unscaledComponentHeight: number;
        private hasBorder: boolean

        constructor(opts: {
            alignment: GUIComponentAlignment,
            width: number,
            height: number,
            isActive: boolean,
            isHidden?: boolean,
            xOffset?: number,
            yOffset?: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number,
            border?: boolean
        }) {
            super()

            this.alignment = opts.alignment;

            this.isActive = opts.isActive
            this.isHidden = (opts.isHidden != null) ? opts.isHidden : false

            this.context = []

            this.xScaling = (opts.xScaling) ? opts.xScaling : this.xScaling
            this.yScaling = (opts.yScaling) ? opts.yScaling : this.yScaling

            this.backgroundColour = (opts.colour) ? opts.colour : this.backgroundColour

            this.xOffset = (opts.xOffset != null) ? opts.xOffset : 0
            this.yOffset = (opts.yOffset != null) ? opts.yOffset : 0
            
            this.unscaledComponentWidth = opts.width
            this.unscaledComponentHeight = opts.height
            this.hasBorder = (opts.border != null) ? opts.border : false

            const pos = this.getLeftAndTop()
            const left = pos[0];
            const top = pos[1];

            this.bounds = new microcode.Bounds({
                width: this.unscaledComponentWidth * this.xScaling,
                height: this.unscaledComponentHeight * this.yScaling,
                left,
                top
            })
        }

        public get width() { return this.unscaledComponentWidth * this.xScaling }
        public get height() { return this.unscaledComponentHeight * this.yScaling }
        public get active() { return this.isActive }
        public get hidden() { return this.isHidden }

        makeActive(): void { this.isActive = true }
        unmakeActive(): void { this.isActive = false }

        hide(): void { this.isHidden = true }
        unHide(): void { this.isHidden = false }

        getAlignment(): number { return this.alignment }

        /**
         * This should be overriden.
         * Other components should use this to get this components state.
         * @returns pertinent component state information, in appropriate format; at child components discretion.
         */
        getContext(): any[] {return this.context}

        addContext(newContext: any[]) {this.context.push(newContext)}

        clearContext(): void { this.context = [] }
        setBounds(bounds: Bounds): void { this.bounds = bounds }

        getLeftAndTop(): number[] {
            let left = 0
            let top = 0

            switch (this.alignment) {
                case (GUIComponentAlignment.TOP): {
                    left = -((this.unscaledComponentWidth * this.xScaling) >> 1) + this.xOffset;
                    top = -(screen().height >> 1) + this.yOffset;
                    break;
                }
                case (GUIComponentAlignment.LEFT): {
                    left = -(screen().width >> 1) + this.xOffset;
                    top = -((this.unscaledComponentHeight * this.yScaling) >> 1) + this.yOffset
                    break;
                }
                case (GUIComponentAlignment.RIGHT): {
                    left = (screen().width >> 1) - (this.unscaledComponentWidth * this.xScaling) + this.xOffset;
                    top = -((this.unscaledComponentHeight * this.yScaling) >> 1) + this.yOffset
                    break;
                }
                case (GUIComponentAlignment.BOT): {
                    left = -((this.unscaledComponentWidth * this.xScaling) >> 1) + this.xOffset;
                    top = (screen().height >> 1) - (this.unscaledComponentHeight * this.yScaling) - this.yOffset;
                    break;
                }
                case (GUIComponentAlignment.CENTRE): {
                    left = -((this.unscaledComponentWidth * this.xScaling) >> 1) + this.xOffset
                    top = -((this.unscaledComponentHeight * this.yScaling) >> 1) + this.yOffset
                    break;
                }
                case (GUIComponentAlignment.TOP_RIGHT): {
                    left = ((screen().width >> 1) - (this.unscaledComponentWidth * this.xScaling)) + this.xOffset;
                    top = -(screen().height >> 1) + this.yOffset;
                    break;
                }
                case (GUIComponentAlignment.TOP_LEFT): {
                    left = (-(screen().width >> 1)) + this.xOffset;
                    top = -(screen().height >> 1) + this.yOffset;
                    break;
                }
                case (GUIComponentAlignment.BOT_RIGHT): {
                    left = ((screen().width >> 1) - (this.unscaledComponentWidth * this.xScaling)) + this.xOffset;
                    top = (screen().height >> 1) - (this.unscaledComponentHeight * this.yScaling) - this.yOffset;
                    break;
                }
                case (GUIComponentAlignment.BOT_LEFT): {
                    left = (-(screen().width >> 1)) + this.xOffset;
                    top = (screen().height >> 1) - (this.unscaledComponentHeight * this.yScaling) - this.yOffset;
                    break;
                }
            }

            return [left, top]
        }

        rescale(xScaling: number, yScaling: number): void {
            if (this.bounds != null) {
                this.xScaling = xScaling
                this.yScaling = yScaling
                this.bounds = new microcode.Bounds({
                    width: this.unscaledComponentWidth * this.xScaling,
                    height: this.unscaledComponentHeight * this.yScaling,
                    left: this.bounds.left,
                    top: this.bounds.top
                })
            }
        }

        draw(): void {
            screen().fillRect(
                this.bounds.left + (screen().width >> 1) + 2,
                this.bounds.top + (screen().height >> 1) + 2,
                this.bounds.width,
                this.bounds.height,
                15
            )

            this.bounds.fillRect(this.backgroundColour)
        }
    }

    export class TextBox extends GUIComponentAbstract {
        private title: string;
        private maxCharactersPerLine: number;
        private textChunks: string[];

        constructor(opts: {
            alignment: GUIComponentAlignment,
            isActive: boolean,
            isHidden?: boolean,
            xOffset?: number,
            yOffset?: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number,
            border?: boolean,
            title?: string,
            text?: string | string[]
        }) {
            super({
                alignment: opts.alignment,
                xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
                yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                width: TextBox.DEFAULT_WIDTH,
                height: TextBox.DEFAULT_HEIGHT,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border
            })

            this.title = (opts.title != null) ? opts.title : ""
            this.maxCharactersPerLine = this.width / (font.charWidth + 1)

            if (opts.text == null) {
                this.textChunks = [""]
            }

            else if (typeof(opts.text) === 'string') {
                this.textChunks = [];

                for (let i = 0; i < opts.text.length; i += this.maxCharactersPerLine) {
                    this.textChunks.push(opts.text.slice(i, i + this.maxCharactersPerLine));
                }
            }

            else {
                this.textChunks = opts.text
            }
        }

        draw() {
            super.draw()
            // this.printCenter(this.text)

            const titleOffset = (font.charWidth * this.title.length) >> 1;

            screen().print(
                this.title,
                (screen().width >> 1) + this.bounds.left + (this.width >> 1) - titleOffset,
                (screen().height >> 1) + this.bounds.top + 2
            )


            let yOffset = 12;
            this.textChunks.forEach(textChunk => {
                const textOffset = (font.charWidth * textChunk.length) >> 1
                screen().print(
                    textChunk,
                    (screen().width >> 1) + this.bounds.left + (this.width >> 1) - textOffset,
                    (screen().height >> 1) + this.bounds.top + 2 + yOffset
                )

                yOffset += 10
            })
        }
    }

    export class GUISlider extends TextBox {
        private maximum: number;
        private minimum: number;

        constructor(opts: {
            alignment: GUIComponentAlignment,
            isActive: boolean,
            isHidden?: boolean,
            xOffset?: number,
            yOffset?: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number,
            border?: boolean,
            title?: string,
            sliderMax?: number,
            sliderMin?: number
        }) {
            super({
                alignment: opts.alignment,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
                yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border
            })

            this.maximum = (opts.sliderMax != null) ? opts.sliderMax : 100
            this.minimum = (opts.sliderMin != null) ? opts.sliderMin : 0

            this.context = [this.maximum - this.minimum]

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => this.context[0] = Math.min(this.context[0] + 10, this.maximum)
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => this.context[0] = Math.max(this.context[0] - 10, this.minimum)
            )
        }

        draw() {
            super.draw()

            // screen().fillRect(
            //     // this.bounds.left + (this.bounds.width >> 1) - (this.bounds.width / 10),
            //     this.bounds.left + (this.bounds.width >> 1) + (screen().width >> 1) - 10,
            //     this.bounds.top + this.bounds.height + (this.bounds.height * (this.getContext()[0] / this.maximum)),// + (screen().height >> 1),
            //     20,
            //     10,
            //     15
            // )

            screen().fillRect(
                // this.bounds.left + (this.bounds.width >> 1) - (this.bounds.width / 10),
                this.bounds.left + (this.bounds.width >> 1) + (screen().width >> 1) - 10,
                // this.bounds.top - 10 + (this.bounds.height / (this.getContext()[0] / this.maximum)) + (screen().height >> 1),
                this.bounds.top + (this.bounds.height * (this.maximum / this.getContext()[0])) + 15,
                20,
                10,
                15
            )

            screen().fillRect(
                this.bounds.left + (this.bounds.width >> 1) - 3 + (screen().width >> 1),
                this.bounds.top + (screen().height >> 1),
                6,
                this.bounds.height - 4,
                15
            )
        }
    }

    export class GUIGraph extends TextBox {
        private graphableFns: GraphableFunction[]

        constructor(opts: {
            alignment: GUIComponentAlignment,
            graphableFns: GraphableFunction[],
            isActive: boolean,
            isHidden?: boolean,
            xOffset?: number,
            yOffset?: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number,
            border?: boolean,
            title?: string
        }) {
            super({
                alignment: opts.alignment,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
                yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border
            })

            this.graphableFns = opts.graphableFns
            const bufferScalar = (opts.xScaling != null) ? opts.xScaling : 1
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
                const hasSpace = this.graphableFns[i].getBufferLength() < this.graphableFns[i].getMaxBufferSize()
                this.graphableFns[i].readIntoBufferOnce((screen().height >> 1) + top, this.bounds.height) // 8
            }

            //----------------------------
            // Draw sensor lines & ticker:
            //----------------------------
            for (let i = 0; i < this.graphableFns.length; i++) {
                const sensor = this.graphableFns[i]
                const color: number = 3

                // Draw lines:
                sensor.draw(
                    (screen().width >> 1) + left + 3,
                    color,
                )

                // Draw the latest reading on the right-hand side as a Ticker if at no-zoom:
                if (sensor.getHeightNormalisedBufferLength() > 0) {
                    const reading = sensor.getNthReading(sensor.getBufferLength() - 1);
                    const readingAsString = reading.toString().slice(0, 5);
                    const range = Math.abs(sensor.getMinimum()) + sensor.getMaximum()
                    const y = Math.round(this.bounds.height - (this.bounds.height * ((reading - sensor.getMinimum()) / range)))

                    // Make sure the ticker won't be cut-off by other UI elements
                    // if (y > sensor.getMinimum() + 5) {
                        screen().print(
                            readingAsString,
                            this.bounds.left + this.bounds.width + (screen().width >> 1) - (readingAsString.length * font.charWidth),
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
                    5
                );

                // Y-Axis:
                screen().drawLine(
                    left + (screen().width >> 1) + i,
                    (screen().height >> 1) + top,
                    left + (screen().width >> 1) + i, 
                    (screen().height >> 1) + this.bounds.height + top,
                    5
                );
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
                this.bounds.top + this.bounds.height + (screen().height >> 1) + 3,
                1
            )

            // End:
            const end: string = (this.graphableFns[0].numberOfReadings + this.graphableFns[0].getHeightNormalisedBufferLength()).toString()
            screen().print(
                end,
                (screen().width >> 1) + this.bounds.left + this.bounds.width - (end.length * font.charWidth) + 2,
                this.bounds.top + this.bounds.height + (screen().height >> 1) + 3,
                1
            )
            basic.pause(100);
        }
    }


    export class GUISceneAbstract extends GUIComponentAbstract {
        navigator: INavigator
        public cursor: Cursor
        public picker: Picker

        constructor(opts: {
            alignment: GUIComponentAlignment,
            navigator: INavigator,
            isActive: boolean,
            isHidden: boolean,
            xOffset?: number,
            yOffset?: number,
            width: number,
            height: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number
        }) {
            super({
                alignment: opts.alignment,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
                yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
                width: TextBox.DEFAULT_WIDTH,
                height: TextBox.DEFAULT_HEIGHT,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour
            })

            this.navigator = opts.navigator

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => this.moveCursor(CursorDir.Right)
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => this.moveCursor(CursorDir.Up)
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => this.moveCursor(CursorDir.Down)
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => this.moveCursor(CursorDir.Left)
            )

            // click
            const click = () => this.cursor.click()
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                click
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id + keymap.PLAYER_OFFSET,
                click
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => this.back()
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
                target.bounds
            )
        }

        back() {
            if (!this.cursor.cancel()) this.moveCursor(CursorDir.Back)
        }

        protected handleClick(x: number, y: number) {
            const target = this.cursor.navigator.screenToButton(
                x - Screen.HALF_WIDTH,
                y - Screen.HALF_HEIGHT
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
                y - Screen.HALF_HEIGHT
            )
            if (btn) {
                const w = btn.xfrm.worldPos
                this.cursor.snapTo(w.x, w.y, btn.ariaId, btn.bounds)
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
                this.cursor.snapTo(w.x, w.y, btn.ariaId, btn.bounds)
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


    const KEYBOARD_FRAME_COUNTER_CURSOR_ON = 20;
    const KEYBOARD_FRAME_COUNTER_CURSOR_OFF = 40;
    const KEYBOARD_MAX_TEXT_LENGTH = 20;

    export class KeyboardComponent extends GUISceneAbstract {
        public static DEFAULT_WIDTH: number = screen().width
        public static DEFAULT_HEIGHT: number = 80
        private static WIDTHS: number[] = [10, 10, 10, 10, 4]
        private btns: Button[]
        private btnText: string[]

        private text: string;
        private upperCase: boolean;
        private next: (arg0: string) => void;
        private frameCounter: number;
        private shakeText: boolean
        private shakeTextCounter: number

        constructor(opts: {
            next: (arg0: string) => void,
            alignment: GUIComponentAlignment,
            isActive: boolean,
            isHidden: boolean,
            xOffset?: number,
            yOffset?: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number,
        }) {
        // constructor(app: App, next: (arg0: string) => void) {
            // super(app, new GridNavigator(5, 5, KeyboardComponent.WIDTHS))

            super({
                alignment: opts.alignment,
                navigator: new GridNavigator(5, 5, KeyboardComponent.WIDTHS),
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
                yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
                width: KeyboardComponent.DEFAULT_WIDTH,
                height: KeyboardComponent.DEFAULT_HEIGHT,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour
            })

            this.text = ""
            this.upperCase = true

            this.btns = []
            this.btnText = [
                "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
                "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
                "U", "V", "W", "X", "Y", "Z", ",", ".", "?", "!",
                "<-", "^", " _______ ", "ENTER"
            ];

            this.next = opts.next
            this.frameCounter = 0;
            this.shakeText = false;
            this.shakeTextCounter = 0;

            const defaultBehaviour = (btn: Button) => {
                if (this.text.length < KEYBOARD_MAX_TEXT_LENGTH) {
                    this.text += this.btnText[btn.state[0]]
                    this.frameCounter = KEYBOARD_FRAME_COUNTER_CURSOR_ON
                }
                else {
                    this.shakeText = true
                }
            }

            for (let i = 0; i < 4; i++) {
                const xDiff = screen().width / (KeyboardComponent.WIDTHS[i] + 1);
                for (let j = 0; j < 10; j++) {
                    this.btns.push(
                        new Button({
                            parent: null,
                            style: ButtonStyles.Transparent,
                            icon: bitmaps.create(10, 10),
                            ariaId: "",
                            x: (xDiff * (j + 1)) - (screen().width >> 1),
                            y: (13 * (i + 1)) - 18,
                            onClick: defaultBehaviour,
                            state: [(i * 10) + j]
                        })
                    )
                }
            }

            const botRowBehaviours = [
                () => {
                    this.text =
                        (this.text.length > 0)
                            ? this.text.substr(0, this.text.length - 1)
                            : this.text
                    this.frameCounter = KEYBOARD_FRAME_COUNTER_CURSOR_ON
                },
                () => { this.changeCase() },
                () => {
                    if (this.text.length < KEYBOARD_MAX_TEXT_LENGTH) {
                        this.text += " ";
                        this.frameCounter = KEYBOARD_FRAME_COUNTER_CURSOR_ON;
                    }
                    else {
                        this.shakeText = true
                    }
                },
                () => { this.next(this.text) }
            ]

            const icons = [bitmaps.create(16, 10), bitmaps.create(10, 10), bitmaps.create(55, 10), bitmaps.create(33, 10)]
            const x = [22, 38, 74, 124]
            for (let i = 0; i < 4; i++) {
                this.btns.push(
                    new Button({
                        parent: null,
                        style: ButtonStyles.Transparent,
                        icon: icons[i],
                        ariaId: "",
                        x: x[i] - (screen().width >> 1),
                        y: (13 * 5) - 18,
                        onClick: botRowBehaviours[i]
                    })
                )
            }

            this.changeCase()
            this.navigator.addButtons(this.btns)
        }

        private changeCase() {
            this.upperCase = !this.upperCase;

            if (this.upperCase)
                this.btnText = this.btnText.map((btn, i) =>
                    btn = (i < 40) ? btn.toUpperCase() : btn
                )
            else
                this.btnText = this.btnText.map((btn, i) =>
                    btn = (i < 40) ? btn.toLowerCase() : btn
                )
        }

        draw() {
            this.frameCounter += 1

            // Blue base colour:
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                6 // Blue
            )

            // Orange Keyboard with a black shadow on the bot & right edge (depth effect):

            // Black border around right & bot edge:
            Screen.fillRect(
                Screen.LEFT_EDGE + 4,
                Screen.TOP_EDGE + 47,
                Screen.WIDTH - 6,
                71,
                15 // Black
            )

            // Orange keyboard that the white text will be ontop of:
            Screen.fillRect(
                Screen.LEFT_EDGE + 4,
                Screen.TOP_EDGE + 44,
                Screen.WIDTH - 8,
                72,
                4 // Orange
            )

            for (let i = 0; i < this.btns.length; i++) {
                this.btns[i].draw()

                const x = (screen().width >> 1) + this.btns[i].xfrm.localPos.x - (this.btns[i].icon.width >> 1) + 2
                const y = (screen().height >> 1) + this.btns[i].xfrm.localPos.y + font.charHeight - 12
                screen().print(this.btnText[i], x, y, 1) // White text
            }

            super.draw()
        }
    }


    /**
     * Holds other components,
     * One component is active at a time
     */
    export class Window extends Scene {
        private static components: GUIComponentAbstract[];
        private static componentQty: number;
        private static currentComponentID: number;

        constructor(opts: {
            app: App,
            colour?: number,
            next?: (arg0: any[]) => void,
            back?: (arg0: any[]) => void,
            components?: GUIComponentAbstract[],
            hideByDefault?: boolean
        }) {
            super(opts.app)

            if (opts.colour != null)
                this.backgroundColor = opts.colour

            Window.components = opts.components
            Window.componentQty = Window.components.length
            Window.currentComponentID = 0

            if (Window.components != null && opts.hideByDefault)
                Window.focus(true)

            input.onButtonPressed(1, function() {
                Window.currentComponentID = (Window.currentComponentID + 1) % Window.componentQty
                Window.focus(true)
            })
        }

        public static makeComponentActive(componentID: number, hideOthers: boolean) {
            Window.currentComponentID = componentID;
            Window.focus(hideOthers);
        }

        public static updateComponentsContext(componentID: number, context: any[]) {
            this.components[componentID].addContext(context)
        }

        /* override */ startup() {
            super.startup()
        }

        private static focus(hideOthers: boolean) {
            if (hideOthers)
                Window.components.forEach(component => {component.hide()})
            Window.components.forEach(component => {component.unmakeActive()})

            Window.components[Window.currentComponentID].unHide()
            Window.components[Window.currentComponentID].makeActive()
        }

        showAllComponents() {
            Window.components.forEach(component => component.unHide())
        }

        draw() {
            super.draw()

            screen().fillRect(
                0,
                0,
                screen().width,
                screen().height,
                this.backgroundColor
            )

            if (Window.components != null) {
                Window.components.forEach(component => {
                    if (!component.hidden && !component.active)
                        component.draw()
                })
            }

            // Always draw active ontop
            Window.components[Window.currentComponentID].draw()
        }
    }

    export class ButtonCollection extends GUIComponentAbstract {
        private btns: Button[][];
        private numberOfRows: number;
        private numberOfCols: number[];

        private cursorBounds: Bounds;
        private cursorOutlineColour: number;
        private cursorRow: number;
        private cursorCol: number;

        constructor(opts: {
            alignment: GUIComponentAlignment,
            btns: Button[][],
            isActive: boolean,
            isHidden?: boolean,
            xOffset?: number,
            yOffset?: number,
            xScaling?: number,
            yScaling?: number,
            colour?: number,
            border?: boolean,
            title?: string,
            cursorColour?: number
        }) {
            super({
                alignment: opts.alignment,
                xOffset: (opts.xOffset != null) ? opts.xOffset : 0,
                yOffset: (opts.yOffset != null) ? opts.yOffset : 0,
                width: TextBox.DEFAULT_WIDTH,
                height: TextBox.DEFAULT_HEIGHT,
                isActive: opts.isActive,
                isHidden: opts.isHidden,
                xScaling: opts.xScaling,
                yScaling: opts.yScaling,
                colour: opts.colour,
                border: opts.border
            })

            if (opts.btns != null) {
                this.btns = opts.btns;

                // Adjust button x & y to be relative to this components window left & top:
                this.btns.forEach(row => {
                    row.forEach(btn => {
                        btn.xfrm.localPos.x = this.bounds.left + btn.xfrm.localPos.x + (btn.width >> 1) + 2
                        btn.xfrm.localPos.y = this.bounds.top + btn.xfrm.localPos.y + (btn.height >> 1) + 2
                    })
                })

                this.isActive = opts.isActive

                this.numberOfCols = this.btns.map(row => row.length)
                this.numberOfRows = this.btns.length

                this.cursorBounds = new Bounds({
                    width: this.btns[0][0].width + 4,
                    height: this.btns[0][0].height + 4,
                    left: this.btns[0][0].xfrm.localPos.x - (this.btns[0][0].width >> 1) - 2,
                    top: this.btns[0][0].xfrm.localPos.y - (this.btns[0][0].height >> 1) - 2
                })
                this.cursorOutlineColour = (opts.cursorColour != null) ? opts.cursorColour : 9; // Default is light blue
                this.cursorRow = 0;
                this.cursorCol = 0;

                if (this.isActive)
                    this.bindShieldButtons()
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
                        this.cursorCol = (this.cursorCol + 1) % this.numberOfCols[this.cursorRow]
                    this.updateCursor()
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.cursorRow = (((this.cursorRow - 1) % this.numberOfRows) + this.numberOfRows) % this.numberOfRows; // Non-negative modulo

                    // Row above might have less cols, adjust if neccessary:
                    if (this.numberOfCols[this.cursorRow] <= this.cursorCol)
                        this.cursorCol = this.numberOfCols[this.cursorRow] - 1
                    this.updateCursor()
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.cursorRow = (this.cursorRow + 1) % this.numberOfRows;

                    // Row below might have less cols, adjust if neccessary:
                    if (this.numberOfCols[this.cursorRow] <= this.cursorCol)
                        this.cursorCol = this.numberOfCols[this.cursorRow] - 1
                    this.updateCursor()
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.cursorCol == 0)
                        this.cursorCol = this.numberOfCols[this.cursorRow] - 1
                    else
                        this.cursorCol -= 1
                    this.updateCursor()
                }
            )

            // click
            const click = () => this.click()
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                click
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id + keymap.PLAYER_OFFSET,
                click
            )
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => this.back()
            )
        }

        unbindShieldButtons() {
            control.onEvent(ControllerButtonEvent.Pressed, controller.A.id, () => { })
            control.onEvent(ControllerButtonEvent.Pressed, controller.A.id + keymap.PLAYER_OFFSET, () => { })
            control.onEvent(ControllerButtonEvent.Pressed, controller.B.id, () => { })
            control.onEvent(ControllerButtonEvent.Pressed, controller.up.id, () => { })
            control.onEvent(ControllerButtonEvent.Pressed, controller.down.id, () => { })
            control.onEvent(ControllerButtonEvent.Pressed, controller.left.id, () => { })
            control.onEvent(ControllerButtonEvent.Pressed, controller.right.id, () => { })
        }

        makeActive() {
            this.isActive = true
            this.bindShieldButtons()
        }

        unmakeActive() {
            this.isActive = false
            this.unbindShieldButtons()
        }

        click() {
            this.btns[this.cursorRow][this.cursorCol].onClick(this.btns[this.cursorRow][this.cursorCol])
        }

        back() {

        }

        updateCursor() {
            const x = this.cursorRow
            const y = this.cursorCol
            this.cursorBounds = new Bounds({
                width: this.btns[x][y].width + 4,
                height: this.btns[x][y].height + 4,
                left: this.btns[x][y].xfrm.localPos.x - (this.btns[x][y].width >> 1) - 2,
                top: this.btns[x][y].xfrm.localPos.y - (this.btns[x][y].height >> 1) - 2
            })
            this.drawCursor()
        }

        drawCursor() {
            this.cursorBounds.fillRect(this.cursorOutlineColour)
        }

        drawCursorText() {
            const text = this.btns[this.cursorRow][this.cursorCol].ariaId

            if (text) {
                const pos = this.cursorBounds;
                const n = text.length
                const font = microcode.font
                const w = font.charWidth * n
                const h = font.charHeight
                const x = Math.max(
                    Screen.LEFT_EDGE + 1,
                    Math.min(Screen.RIGHT_EDGE - 1 - w, pos.left + (pos.width >> 1) - (w >> 1))
                )
                const y = Math.min(
                    pos.top + (pos.height) + 1,
                    Screen.BOTTOM_EDGE - 1 - font.charHeight
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
}