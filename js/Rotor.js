// type is 1, 2, or 3 corresponding to variants
// initialOffset is passed as a glyph, then converted to an integer
function Rotor(type, initialOffset, visualOffset) {
    this.type = type;
    this.transpose = this.variants[type].wires; // what the rotor will be encoded to
    this.notch = this.variants[type].notch;
    this.el = document.createElementNS(ns, 'g'); // rotorGroup
    this.el.setAttribute('transform', 'translate(' + visualOffset.x + ',' + visualOffset.y + ')');

    this.visualOffset = visualOffset;

    console.log('new Rotor initialOffset', initialOffset);

    var offset = initialOffset;
    var inForward, outForward;
    var inReverse, outReverse;

    // this is so when a rotor makes a full turn, it doesn't animate all the way backwards
    // offset

    Object.defineProperty(this, 'offset', {
        get: function () {
            return offset;
        },
        set: function (val) {

            if (this.rendered && (val - 1) % 26 === RD.a.indexOf(this.notch) && this.type !== 0) {
                this.nextRotor.offset++;
            }
            offset = val;

            var glyphGroup = this.el.querySelector('.glyph-group');
            var lineGroup = this.el.querySelector('.line-group');
            if (this.rendered) {
                var rot = 'rotate(' + -offset * this.increment + 'deg)';
                glyphGroup.style.transform = glyphGroup.style.msTransform = glyphGroup.style.webkitTransform = glyphGroup.style.MozTransform = rot;
                lineGroup.style.transform = lineGroup.style.msTransform = lineGroup.style.webkitTransform = lineGroup.style.MozTransform = rot;
                this.el.querySelector('.starting-glyph').textContent = RD.a[this.offset % 26];
            }
        }
    });

    Object.defineProperty(this, 'inForward', {
        get: function () { return inForward; },
        set: function (val) {
            inForward = val;
            this.el.querySelectorAll('.rotor-position')[val].classList.add('inForward');
        }
    });

    Object.defineProperty(this, 'outForward', {
        get: function () {return outForward; },
        set: function (val) {
            outForward = val;
            this.el.querySelectorAll('.rotor-position')[val].classList.add('outForward');
            var d = 'M' + this.glyphPositions[this.inForward].x + ' ' + this.glyphPositions[this.inForward].y + ' Q 0 0, ' + this.glyphPositions[val].x + ' ' + this.glyphPositions[val].y;
            setAttrs(this.forwardWire, {d: d});
        }
    });

    Object.defineProperty(this, 'inReverse', {
        get: function () { return inReverse; },
        set: function (val) {
            inReverse = val;
            this.el.querySelectorAll('.rotor-position')[val].classList.add('inReverse');
        }
    });

    Object.defineProperty(this, 'outReverse', {
        get: function () { return outReverse; },
        set: function (val) {
            outReverse = val;
            this.el.querySelectorAll('.rotor-position')[val].classList.add('outReverse');

            var d = 'M' + this.glyphPositions[this.inReverse].x + ' ' + this.glyphPositions[this.inReverse].y + ' Q 0 0, ' + this.glyphPositions[val].x + ' ' + this.glyphPositions[val].y;

            setAttrs(this.reverseWire, {d: d});
        }
    });

    this.offset = offset;

    this.wiringMap = {};
    this.wiringMapReverse = {};

    RD.a.forEach(function (letter, i, alphabet) {
        var iTo = alphabet.indexOf(this.transpose[i]);
        this.wiringMap[i] = (26 + iTo - i) % 26;
        this.wiringMapReverse[iTo] = (26 + i - iTo) % 26;
    }, this);

    RD.dispatch.on('encoded', this.handleEncodedMessage.bind(this));
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

        var rotateTransform = 'rotate(' + -this.offset * this.increment + 'deg);';

        var lineGroup = document.createElementNS(ns, 'g');
        lineGroup.classList.add('line-group'); // class added so we can transform with css later
        lineGroup.style.transform = lineGroup.style.msTransform = lineGroup.style.MozTransform = lineGroup.style.webkitTransform = rotateTransform;

        var glyphGroup = document.createElementNS(ns, 'g');
        glyphGroup.classList.add('glyph-group');
        glyphGroup.style.transform = glyphGroup.style.msTransform = glyphGroup.style.MozTransform = glyphGroup.style.webkitTransform = rotateTransform;

        this.glyphPositions = RD.a.map(function (letter, i, list) {
            var angle = TAU / list.length * i;
            var radius = i % 2 === 0 ? 36 : 47;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;

            // create the ring of letters
            var g = document.createElementNS(ns, 'g');
            var gTransform = 'translate(' + (x).toFixed(5) + ',' + (y).toFixed(5) + ') rotate(' + rad2deg(angle + HALF_PI) + ')';
            g.classList.add('rotor-position');
            g.setAttribute('transform', gTransform);
            var circle = document.createElementNS(ns, 'circle');
            circle.classList.add('rotor-letter-bkd');
            setAttrs(circle, {cx: 0, cy: 0, r: 8});
            g.appendChild(circle);
            g.x = x;
            g.y = y;

            var text = document.createElementNS(ns, 'text');
            text.classList.add('rotor-contact');
            setAttrs(text, {x: 0, y: 0, dy: 4});
            text.textContent = letter;
            g.appendChild(text);

            // if (letter === this.notch) { // add a marker of some kind to indicate notch position
            //     var notch = document.createElementNS(ns, 'circle');
            //     var points = '5,-15 0,-5 -5,-15';
            //     setAttrs(notch, {cx: 0, cy: -5, r: 2});
            //     g.appendChild(notch);
            // }

            glyphGroup.appendChild(g);

            return g;

        }, this);

        this.forwardWire = document.createElementNS(ns, 'path');
        this.reverseWire = document.createElementNS(ns, 'path');
        this.forwardWire.classList.add('forward-wire');
        this.reverseWire.classList.add('reverse-wire');
        lineGroup.appendChild(this.forwardWire);
        lineGroup.appendChild(this.reverseWire);

        // the circle behind the starting position letter to make it stand out more
        var bkdCircle = document.createElementNS(ns, 'circle');
        setAttrs(bkdCircle, {cx: 0, cy: 0, r: 42, fill: '#fff'});
        this.el.appendChild(bkdCircle);

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);

        // the starting letter
        var startingGlyph = document.createElementNS(ns, 'text');
        startingGlyph.classList.add('starting-glyph');
        setAttrs(startingGlyph, {dy: 16});
        startingGlyph.textContent = RD.a[this.offset];
        this.el.insertBefore(startingGlyph, bkdCircle.nextSibling);

        var rotorLabel = document.createElementNS(ns, 'text');
        rotorLabel.textContent = 'ROTOR ' + this.labelMap[this.type];
        setAttrs(rotorLabel, {x: 0, y: 95, fill: 'black', 'text-anchor': 'middle', 'font-size': 11});
        this.el.appendChild(rotorLabel);

        svg.appendChild(this.el);

        this.rendered = true;

        return this;
    },
    clearPositions: function () {
        this.el.querySelectorAll('.rotor-position').forEach(function (p) {
            p.classList.remove('inForward', 'outForward', 'inReverse', 'outReverse');
        });
    },

    getIndexGlobal: function (index) {
        console.log(this);
        return {
            x: this.visualOffset.x + this.glyphPositions[(26 + index - this.offset) % 26].x,
            y: this.visualOffset.y + this.glyphPositions[(26 + index - this.offset) % 26].y
        };
    },

    handleEncodedMessage: function (data) {
        console.log('handleEncodedMessage', data);

        this.clearPositions();

        var lastStep = data.sequence[data.sequence.length - 1];

        if (this.type === 0) { // slow rotor
            this.inForward = lastStep.fSlowRotor.in;
            this.outForward = lastStep.fSlowRotor.out;
            this.inReverse = lastStep.rSlowRotor.in;
            this.outReverse = lastStep.rSlowRotor.out;
        } else if (this.type === 1) { // middle rotor
            this.inForward = lastStep.fMiddleRotor.in;
            this.outForward = lastStep.fMiddleRotor.out;
            this.inReverse = lastStep.rMiddleRotor.in;
            this.outReverse = lastStep.rMiddleRotor.out;
        } else { // fast rotor
            this.inForward = lastStep.fFastRotor.in;
            this.outForward = lastStep.fFastRotor.out;
            this.inReverse = lastStep.rFastRotor.in;
            this.outReverse = lastStep.rFastRotor.out;
        }
    },

    // input should be an integer corresponding to a letter in a regular alphabet
    encode: function (input, direction) {
        console.log('input', input, direction, 'rotor', this.labelMap[this.type], 'this.offset', this.offset);
        var encodedPosition;
        if (direction === 'forward') {
            encodedPosition = this.wiringMap[(26 + input + this.offset) % 26];
            encodedPosition = (input + encodedPosition) % 26;
            console.log('encodedPosition', encodedPosition, RD.a[encodedPosition]);
            return encodedPosition;
        } else { // after being reflected
            encodedPosition = this.wiringMapReverse[(26 + input + this.offset) % 26];
            encodedPosition = (input + encodedPosition) % 26;
            console.log('encodedPosition', encodedPosition, RD.a[encodedPosition]);
            return encodedPosition;
        }
    }
};