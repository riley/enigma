// type is 1, 2, or 3 corresponding to variants
// initialOffset is passed as a glyph, then converted to an integer
function Rotor(type, initialOffset) {
    this.type = type;
    this.transpose = this.variants[type].wires; // what the rotor will be encoded to
    this.notch = this.variants[type].notch;
    this.el = document.createElementNS(ns, 'g'); // rotorGroup

    console.log('new Rotor initialOffset', initialOffset);

    var offset = initialOffset;
    var inForward, outForward;
    var inReverse, outReverse;

    // this is so when a rotor makes a full turn, it doesn't animate all the way backwards
    // offset

    TWC.dispatch.on('key_up', this.clearPositions.bind(this));

    Object.defineProperty(this, 'offset', {
        get: function () {
            return offset;
        },
        set: function (val) {

            if (this.rendered) {
                console.log('setting rotor offset', this.labelMap[this.type], 'to', val);
            }

            if (this.rendered && (val - 1) % 26 === TWC.a.indexOf(this.notch) && this.type !== 0) {
                this.nextRotor.offset++;
            }
            offset = val;

            var glyphGroup = this.el.querySelector('.glyph-group');
            if (this.rendered) {
                var rot = 'transform: rotate(' + -offset * this.increment + 'deg)';
                glyphGroup.setAttribute('style', rot);
                this.el.querySelector('.line-group').setAttribute('style', rot);
                this.el.querySelector('.starting-glyph').textContent = TWC.a[this.offset % 26];
            }
        }
    });

    Object.defineProperty(this, 'inForward', {
        get: function () { return inForward; },
        set: function (val) {
            inForward = val;
            console.log('inForward', val, 'rotor', this.type, 'this.offset', this.offset);

            this.el.querySelectorAll('.rotor-letter-bkd')[val].classList.add('inForward');
        }
    });

    Object.defineProperty(this, 'outForward', {
        get: function () {return outForward; },
        set: function (val) {
            outForward = val;
            console.log('outForward', val);
            this.el.querySelectorAll('.rotor-letter-bkd')[val].classList.add('outForward');
            setAttrs(this.forwardWire, {
                x1: this.glyphPositions[this.inForward].x,
                y1: this.glyphPositions[this.inForward].y,
                x2: this.glyphPositions[val].x,
                y2: this.glyphPositions[val].y
            });
        }
    });

    Object.defineProperty(this, 'inReverse', {
        get: function () { return inReverse; },
        set: function (val) {
            inReverse = val;
            this.el.querySelectorAll('.rotor-letter-bkd')[val].classList.add('inReverse');
        }
    });

    Object.defineProperty(this, 'outReverse', {
        get: function () { return outReverse; },
        set: function (val) {
            outReverse = val;
            this.el.querySelectorAll('.rotor-letter-bkd')[val].classList.add('outReverse');
            setAttrs(this.reverseWire, {
                x1: this.glyphPositions[this.inReverse].x,
                y1: this.glyphPositions[this.inReverse].y,
                x2: this.glyphPositions[val].x,
                y2: this.glyphPositions[val].y
            });
        }
    });

    this.offset = offset;

    this.wiringMap = {};
    this.wiringMapReverse = {};

    TWC.a.forEach(function (letter, i, alphabet) {
        var iTo = alphabet.indexOf(this.transpose[i]);
        this.wiringMap[i] = (26 + iTo - i) % 26;
        this.wiringMapReverse[iTo] = (26 + i - iTo) % 26;
    }, this);
}

Rotor.prototype = {
    labelMap: ['I', 'II', 'III'],
    rendered: false,
    increment: 360 / 26,
    // corresponds to army and airforce Enigmas
    // these are the I, II, and III rotors from a 1930 Enigma
    variants: [
        {wires: "EKMFLGDQVZNTOWYHXUSPAIBRCJ".split(''), notch: 'Q'}, // I
        {wires: "AJDKSIRUXBLHWTMCQGZNPYFVOE".split(''), notch: 'E'}, // II
        {wires: "BDFHJLCPRTXVZNYEIWGAKMUSQO".split(''), notch: 'V'}, // III
        {wires: "ESOVPZJAYQUIRHXLNFTGKDCMWB".split(''), notch: 'J'}, // IV
        {wires: "VZBRGITYUPSDNHLXAWMJQOFECK".split(''), notch: 'Z'} // V
    ],
    render: function () {
        var svg = document.getElementById('rotors');

        this.el.id = 'rotor-group-' + this.type;

        var lineGroup = document.createElementNS(ns, 'g');
        lineGroup.classList.add('line-group'); // class added so we can transform with css later
        lineGroup.setAttribute('style', 'transform: rotate(' + -this.offset * this.increment + 'deg)');

        var glyphGroup = document.createElementNS(ns, 'g');
        glyphGroup.classList.add('glyph-group');
        glyphGroup.setAttribute('style', 'transform: rotate(' + -this.offset * this.increment + 'deg)');

        this.glyphPositions = TWC.a.map(function (letter, i, list) {
            var angle = TAU / list.length * i;
            var radius = 70;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;

            // create the ring of letters
            var g = document.createElementNS(ns, 'g');
            g.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rad2deg(angle + HALF_PI) + 'deg)';
            var circle = document.createElementNS(ns, 'circle');
            circle.classList.add('rotor-letter-bkd');
            setAttrs(circle, {cx: 0, cy: 0, r: 8});
            g.appendChild(circle);
            g.x = x;
            g.y = y;

            var text = document.createElementNS(ns, 'text');
            setAttrs(text, {x: 0, y: 0, 'text-anchor': 'middle', fill: 'white', 'font-size': 11, dy: 4});
            text.textContent = letter;
            // text.textContent = i;
            g.appendChild(text);

            if (letter === this.notch) { // add a marker of some kind to indicate notch position
                var notch = document.createElementNS(ns, 'polygon');
                var points = '5,-15 0,-5 -5,-15';
                setAttrs(notch, {points: points, fill: 'lightsalmon'});
                g.appendChild(notch);
            }

            glyphGroup.appendChild(g);

            return g;

        }, this);

        this.forwardWire = document.createElementNS(ns, 'line');
        this.reverseWire = document.createElementNS(ns, 'line');
        setAttrs(this.forwardWire, {stroke: 'orangered'});
        setAttrs(this.reverseWire, {stroke: 'forestgreen'});
        lineGroup.appendChild(this.forwardWire);
        lineGroup.appendChild(this.reverseWire);

        // the circle behind the starting position letter to make it stand out more
        var bkdCircle = document.createElementNS(ns, 'circle');
        setAttrs(bkdCircle, {cx: 0, cy: 0, r: 70, fill: 'rgba(209, 157, 89, .6)'});
        this.el.appendChild(bkdCircle);

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);

        // the starting letter
        var startingGlyph = document.createElementNS(ns, 'text');
        startingGlyph.classList.add('starting-glyph');
        setAttrs(startingGlyph, {'text-anchor': 'middle', 'font-size': 60, dy: 20, transform: 'rotate(180)'});
        console.log('startingGlyph', TWC.a[this.offset], this.offset);
        // startingGlyph.textContent = this.offset;
        startingGlyph.textContent = TWC.a[this.offset];
        this.el.appendChild(startingGlyph);

        var rotorLabel = document.createElementNS(ns, 'text');
        rotorLabel.textContent = 'Rotor ' + this.labelMap[this.type];
        setAttrs(rotorLabel, {x: 0, y: 120, fill: 'black', 'text-anchor': 'middle', transform: 'rotate(180)'});
        this.el.appendChild(rotorLabel);

        svg.appendChild(this.el);

        // rotate the groups to their respective starting positions
        setTimeout(function () {

        }, 500 * (this.type + 1));

        this.rendered = true;

        return this;
    },
    clearPositions: function () {
        this.el.querySelectorAll('circle').forEach(function (c) {
            c.classList.remove('input');
            c.classList.remove('output');
        });
    },
    encode: function (input, direction) {
        console.log('input', input, direction, 'rotor', this.labelMap[this.type], 'this.offset', this.offset);
        var encodedPosition;
        if (direction === 'forward') {
            encodedPosition = this.wiringMap[(26 + input + this.offset) % 26];
            encodedPosition = (input + encodedPosition) % 26;
            console.log('encodedPosition', encodedPosition, TWC.a[encodedPosition]);

            this.inForward = input;
            this.outForward = encodedPosition;

            return encodedPosition;
        } else { // after being reflected
            encodedPosition = this.wiringMapReverse[(26 + input + this.offset) % 26];
            encodedPosition = (input + encodedPosition) % 26;
            console.log('encodedPosition', encodedPosition, TWC.a[encodedPosition]);
            this.inReverse = input;
            this.outReverse = encodedPosition;
            return encodedPosition;
        }
    }
};