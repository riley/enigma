// type is 1, 2, or 3 corresponding to variants
// initialOffset is passed as a glyph, then converted to an integer
function Rotor(type, initialOffset) {
    this.type = type;
    this.transpose = this.variants[type].wires; // what the rotor will be encoded to
    this.notch = this.variants[type].notch;
    this.el = document.createElementNS(ns, 'g'); // rotorGroup

    console.log('new Rotor initialOffset', initialOffset);

    var offset = initialOffset;
    var inputOffset;
    var outputOffset;

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

    Object.defineProperty(this, 'inputOffset', {
        get: function () {
            return inputOffset;
        },
        set: function (val) {
            inputOffset = val;
            console.log('inputOffset', val, 'rotor', this.type, 'this.offset', this.offset);

            this.el.querySelectorAll('.rotor-letter-bkd')[(val + this.offset) % 26].classList.add('input');
        }
    });

    Object.defineProperty(this, 'outputOffset', {
        get: function () {
            return outputOffset;
        },
        set: function (val) {
            outputOffset = val;
            console.log('outputOffset', val);
            this.el.querySelectorAll('.rotor-letter-bkd')[(val + this.offset) % 26].classList.add('output');
        }
    });

    this.offset = initialOffset;

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
    variants: {
        '0': {wires: "EKMFLGDQVZNTOWYHXUSPAIBRCJ".split(''), notch: 'Q'}, // I
        '1': {wires: "AJDKSIRUXBLHWTMCQGZNPYFVOE".split(''), notch: 'E'}, // II
        '2': {wires: "BDFHJLCPRTXVZNYEIWGAKMUSQO".split(''), notch: 'V'}, // III
        '3': {wires: "ESOVPZJAYQUIRHXLNFTGKDCMWB".split(''), notch: 'J'}, // IV
        '4': {wires: "VZBRGITYUPSDNHLXAWMJQOFECK".split(''), notch: 'Z'} // V
    },
    render: function () {
        var svg = document.getElementById('rotors');

        this.el.id = 'rotor-group-' + this.type;
        // this.el.setAttribute('transform', 'translate(' + (this.type * 160 + 90) + ',120) rotate(180)');

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
            // g.setAttribute('style', 'transform: "translate(' + x + 'px,' + y + 'px) rotate(' + rad2deg(angle + HALF_PI) + 'deg)"');
            g.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rad2deg(angle + HALF_PI) + 'deg)';
            var circle = document.createElementNS(ns, 'circle');
            circle.classList.add('rotor-letter-bkd');
            setAttrs(circle, {cx: 0, cy: 0, r: 8});
            g.appendChild(circle);

            var text = document.createElementNS(ns, 'text');
            setAttrs(text, {x: 0, y: 0, 'text-anchor': 'middle', fill: 'white', 'font-size': 11, dy: 4});
            // text.textContent = letter;
            text.textContent = i;
            g.appendChild(text);

            if (letter === this.notch) { // add a marker of some kind to indicate notch position
                var notch = document.createElementNS(ns, 'polygon');
                var points = '5,-15 0,-5 -5,-15';
                setAttrs(notch, {points: points, fill: 'lightsalmon'});
                g.appendChild(notch);
            }

            glyphGroup.appendChild(g);

            return {x: x, y: y, letter: letter};

        }, this).forEach(function (pos, i, positionList) {

            // var end = positionList[TWC.a.indexOf(this.transpose[i])];
            // var arc = document.createElementNS(ns, 'path');
            // var d = 'M' + end.x + ' ' + end.y + ' A20 20, 0, 0, 1, ' + pos.x + ' ' + pos.y;
            // setAttrs(arc, {d: d, stroke: TWC.colors[i], 'stroke-width': 1, fill: 'none'});
            // lineGroup.appendChild(arc);
            var line = document.createElementNS(ns, 'line');
            var end = positionList[TWC.a.indexOf(this.transpose[i])];
            setAttrs(line, {x1: pos.x, y1: pos.y, x2: end.x, y2: end.y, stroke: TWC.colors[i], 'stroke-width': 1});
            lineGroup.appendChild(line);
        }, this);

        var zeroInputContact = document.createElementNS(ns, 'circle');
        setAttrs(zeroInputContact, {cx: 80, cy: 0, r: 5, fill: 'green'});
        this.el.appendChild(zeroInputContact);

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);

        // // the circle behind the starting position letter to make it stand out more
        // var bkdCircle = document.createElementNS(ns, 'circle');
        // setAttrs(bkdCircle, {cx: 0, cy: 0, r: 50, fill: 'rgba(255, 255, 255, .6)'});
        // this.el.appendChild(bkdCircle);

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
            return encodedPosition;
            // console.log('input + thi.offset', input + this.offset, '(input + this.offset) % 26', (input + this.offset) % 26);
            // var inPosition = (input + this.offset) % 26;
            // var outLetter = this.transpose[inPosition];
            // var outPosition = TWC.a.indexOf(outLetter);
            // console.log('outPosition before subtract', outPosition);
            // outPosition -= this.offset;

            // if (outPosition < 0) outPosition += 26;

            // console.log('inLetter', TWC.a[inPosition]);
            // console.log('inPosition', inPosition);
            // console.log('outLetter', outLetter);
            // console.log('outPosition', outPosition);



            // this.inputOffset = input;
            // this.outputOffset = outPosition;
            // return this.outputOffset;
        } else { // after being reflected
            encodedPosition = this.wiringMapReverse[(26 + input + this.offset) % 26];
            encodedPosition = (input + encodedPosition) % 26;
            console.log('encodedPosition', encodedPosition, TWC.a[encodedPosition]);
            return encodedPosition;
        }
    }
};