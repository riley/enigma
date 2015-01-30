function Reflector(el) {
    this.el = el;
    this.wires = "YRUHQSLDPXNGOKMIEBFZCWVJAT".split('');  // Reflector B from wikipedia

    this.wiringMap = {};
    this.wiringMapReverse = {};

    TWC.a.forEach(function (letter, i, alphabet) {
        var iTo = alphabet.indexOf(this.wires[i]);
        this.wiringMap[i] = (26 + iTo - i) % 26;
        this.wiringMapReverse[iTo] = (26 + i - iTo) % 26;
    }, this);
}

Reflector.prototype = {
    render: function () {
        var svg = document.getElementById('rotors');

        this.el = document.createElementNS(ns, 'g');

        var glyphGroup = document.createElementNS(ns, 'g');
        var lineGroup = document.createElementNS(ns, 'g');

        var gap = 11;

        this.contacts = TWC.a.map(function (letter, i) {
            var circle = document.createElementNS(ns, 'circle');
            circle.classList.add('reflector-contact');
            var x = i * gap;
            setAttrs(circle, {cx: x, cy: 0, r: 3});

            var glyph = document.createElementNS(ns, 'text');
            glyph.textContent = letter;
            setAttrs(glyph, {
                x: x,
                y: 0,
                fill: 'black',
                'text-anchor': 'middle',
                'font-weight': 'bold',
                'font-size': 10,
                dy: 14
            });

            glyphGroup.appendChild(circle);
            glyphGroup.appendChild(glyph);

            return circle;
        });

        var placedLetters = [];

        // draw lines showing how reflector is wired
        TWC.a.forEach(function (letter, i, list) {

            if (placedLetters.indexOf(letter) > -1 || placedLetters.indexOf(this.wires.indexOf(letter)) > -1) return true;

            var reflectedPosition = this.wires.indexOf(letter);
            var wire = document.createElementNS(ns, 'path');
            wire.id = 'r-' + i;
            wire.classList.add('reflector-wire');
            var x1 = i * gap;
            var x2 = reflectedPosition * gap;
            var y = (placedLetters.length / 2 + 1) * 10;
            // var d = 'M' + x1 + ',0 L' + x1 + ',' + y + 'L' + x2 + ',' + y + 'L' + x2 + ',0';

            var r = (x2 - x1) / 2;

            var d = 'M' + x1 + ' 0 A' + r + ' ' + r + ', 0, 0, 1, ' + x2 + ' 0';

            var randomGrey = (Math.random() * 0x44) | 0;
            setAttrs(wire, {
                d: d,
                stroke: 'rgb(' + randomGrey + ',' + randomGrey + ',' + randomGrey + ')',
                fill: 'none',
                'stroke-width': 2
            });

            var wireLength = wire.getTotalLength();

            setAttrs(wire, {
                'stroke-dasharray': wireLength,
                'stroke-dashoffset': 0
            });

            lineGroup.appendChild(wire);

            placedLetters.push(letter, TWC.a[reflectedPosition]);

        }, this);

        var rLabel = document.createElementNS(ns, 'text');
        rLabel.textContent = 'Reflector';
        setAttrs(rLabel, {fill: 'black', transform: 'translate(130,55)', 'text-anchor': 'middle', 'font-size': 20});

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);
        this.el.appendChild(rLabel);

        svg.appendChild(this.el);

        return this;
    },
    showConnection: function (input, output) {
        console.log('showConnection');
        this.contacts.forEach(function (c) {
            c.classList.remove('input');
            c.classList.remove('output');
        });

        var oldActiveWire = document.querySelector('.reflector-wire.active');
        if (oldActiveWire) oldActiveWire.classList.remove('active');

        var enter = document.getElementById('r-' + input);
        var exit = document.getElementById('r-' + output);
        var wireLength;

        var wire = enter || exit;
        wire.removeAttribute('style');
        wire.classList.add('active');

        wireLength = wire.getTotalLength();

        if (enter) {
            setAttrs(enter, {'stroke-dashoffset': wireLength});
        } else if (exit) {
            setAttrs(exit, {'stroke-dashoffset': -wireLength});
        }

        this.contacts[input].classList.add('input');
        this.contacts[output].classList.add('output');
        setTimeout(function () {
            wire.setAttribute('style', 'transition: stroke-dashoffset .3s linear');
            setAttrs(wire, {'stroke-dashoffset': 0});
        }, 0);

    },
    encode: function (input) {
        var reflectedPosition = (input + this.wiringMap[input]) % 26;
        this.showConnection(input, reflectedPosition);
        return reflectedPosition;
    }
};