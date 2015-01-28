// type is 1, 2, or 3 corresponding to variants
// initialOffset is passed as a glyph, then converted to an integer
function Rotor(type, initialOffset) {
    this.type = type;
    this.transpose = this.variants[type].wires; // what the rotor will be encoded to
    this.notch = this.variants[type].notch;
    this.el = document.createElementNS(ns, 'g'); // rotorGroup

    var offset = initialOffset;

    // this.internalOffset = this.range.indexOf(initialOffset);
    // this is so when a rotor makes a full turn, it doesn't animate all the way backwards
    // offset

    Object.defineProperty(this, 'offset', {
        get: function () {
            return offset;
        },
        set: function (val) {
            offset = val;
            console.log('setter', this.el);
            var glyphGroup = this.el.querySelector('.glyph-group');
            if (glyphGroup) {
                var rot = 'transform: rotate(' + -offset * this.increment + 'deg)';
                glyphGroup.setAttribute('style', rot);
                this.el.querySelector('.line-group').setAttribute('style', rot);
            }
            // internalOffset used for encoding
            this.internalOffset = this.offset % 26;
        }
    });

    this.offset = this.range.indexOf(initialOffset);
}

Rotor.prototype = {
    increment: 360 / 26,
    range: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    // corresponds to army and airforce Enigmas
    // these are the I, II, and III rotors from a 1930 Enigma
    variants: {
        '0': {wires: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: 'Q'}, // I
        '1': {wires: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: 'E'}, // II
        '2': {wires: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: 'V'}, // III
        '3': {wires: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notch: 'J'}, // IV
        '4': {wires: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: 'Z'} // V
    },
    render: function () {
        var svg = document.getElementById('rotors');

        this.el.id = 'rotor-group-' + this.type;
        this.el.setAttribute('transform', 'translate(' + (this.type * 160 + 90) + ',120) rotate(180)');

        var lineGroup = document.createElementNS(ns, 'g');
        lineGroup.classList.add('line-group'); // class added so we can transform with css later
        lineGroup.setAttribute('style', 'transform: rotate(' + -this.offset * this.increment + 'deg)');

        var glyphGroup = document.createElementNS(ns, 'g');
        glyphGroup.classList.add('glyph-group');
        glyphGroup.setAttribute('style', 'transform: rotate(' + -this.offset * this.increment + 'deg)');

        this.glyphPositions = this.range.split('').map(function (letter, i, list) {
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
            text.textContent = letter;
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
            var line = document.createElementNS(ns, 'line');
            var end = positionList[this.transpose.indexOf(pos.letter)];
            setAttrs(line, {x1: pos.x, y1: pos.y, x2: end.x, y2: end.y, stroke: TWC.colors[i], 'stroke-width': 1});
            lineGroup.appendChild(line);
        }, this);

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);

        // the circle behind the starting position letter to make it stand out more
        var bkdCircle = document.createElementNS(ns, 'circle');
        setAttrs(bkdCircle, {cx: 0, cy: 0, r: 50, fill: 'rgba(255, 255, 255, .6)'});
        this.el.appendChild(bkdCircle);

        // the starting letter
        var startingGlyph = document.createElementNS(ns, 'text');
        setAttrs(startingGlyph, {'text-anchor': 'middle', 'font-size': 60, dy: 20, transform: 'rotate(180)'});
        startingGlyph.textContent = this.range.charAt(this.offset);
        this.el.appendChild(startingGlyph);

        var label = document.createElementNS(ns, 'text');
        label.textContent = 'Rotor ' + (this.type + 1);
        setAttrs(label, {x: 0, y: 120, fill: 'black', 'text-anchor': 'middle', transform: 'rotate(180)'});
        this.el.appendChild(label);

        svg.appendChild(this.el);

        // rotate the groups to their respective starting positions
        setTimeout(function () {

        }, 500 * (this.type + 1));

        return this;
    },
    encode: function (input, direction) {
        if (direction === 'forward') {
            return this.transpose.charAt(this.range.indexOf(input + this.offset));
        } else { // after being reflected
            return this.range.charAt(this.transpose.indexOf(input));
        }
    }
};