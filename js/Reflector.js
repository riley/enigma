    function Reflector(visualOffset) {
    this.visualOffset = visualOffset;
    this.wires = "YRUHQSLDPXNGOKMIEBFZCWVJAT".split('');  // Reflector B from wikipedia

    this.wiringMap = {};
    this.wiringMapReverse = {};

    RD.a.forEach(function (letter, i, alphabet) {
        var iTo = alphabet.indexOf(this.wires[i]);
        this.wiringMap[i] = (26 + iTo - i) % 26;
        this.wiringMapReverse[iTo] = (26 + i - iTo) % 26;
    }, this);

    RD.dispatch.on('encoded', this.showConnection.bind(this));
}

Reflector.prototype = {
    render: function () {
        var svg = document.getElementById('rotors');

        this.el = document.createElementNS(ns, 'g');
        this.el.setAttribute('transform', 'translate(' + this.visualOffset.x + ',' + this.visualOffset.y + ')');
        this.el.id = 'reflector';

        var glyphGroup = document.createElementNS(ns, 'g');
        var lineGroup = document.createElementNS(ns, 'g');

        var gap = 11;

        this.contacts = RD.a.map(function (letter, i, list) {
            var angle = TAU / list.length * i;
            var radius = 70;
            var circle = document.createElementNS(ns, 'circle');
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;
            setAttrs(circle, {cx: 0, cy: 0, r: 8});

            var g = document.createElementNS(ns, 'g');
            g.classList.add('reflector-contact');


            var glyph = document.createElementNS(ns, 'text');
            glyph.classList.add('reflector-glyph');
            glyph.textContent = letter;
            setAttrs(glyph, {x: 0, y: 0, dy: 4});

            g.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + rad2deg(angle + HALF_PI) + ')');

            g.appendChild(circle);
            g.appendChild(glyph);

            glyphGroup.appendChild(g);

            g.circle = circle;
            g.x = x;
            g.y = y;

            return g;
        });

        var placedLetters = [];

        // draw lines showing how reflector is wired
        RD.a.forEach(function (letter, i, list) {

            if (placedLetters.indexOf(letter) > -1 || placedLetters.indexOf(this.wires.indexOf(letter)) > -1) return true;

            var reflectedPosition = this.wires.indexOf(letter);
            var wire = document.createElementNS(ns, 'path');
            wire.id = 'r-' + i;
            wire.classList.add('reflector-wire');

            var circleA = this.contacts[i];
            var circleB = this.contacts[reflectedPosition];

            var d = 'M' + circleA.x + ' ' + circleA.y  + 'Q 0 0, ' + circleB.x + ' ' + circleB.y;

            setAttrs(wire, { d: d });

            lineGroup.appendChild(wire);

            placedLetters.push(letter, RD.a[reflectedPosition]);

        }, this);

        var rLabel = document.createElementNS(ns, 'text');
        rLabel.textContent = 'REFLECTOR';
        setAttrs(rLabel, {fill: 'black', transform: 'translate(0,95)', 'text-anchor': 'middle', 'font-size': 11});

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);
        this.el.appendChild(rLabel);

        svg.appendChild(this.el);

        return this;
    },
    getIndexGlobal: function (index) {
        return {x: this.visualOffset.x + this.contacts[index].x, y: this.visualOffset.y + this.contacts[index].y };
    },
    showConnection: function (data) {
        var lastStep = data.sequence[data.sequence.length - 1];

        var input = lastStep.reflector.in;
        var output = lastStep.reflector.out;

        console.log('showConnection');
        this.contacts.forEach(function (c) {
            c.classList.remove('input', 'output');
        });

        var oldActiveWire = document.querySelector('.reflector-wire.active');
        if (oldActiveWire) oldActiveWire.classList.remove('active');

        var enter = document.getElementById('r-' + input);
        var exit = document.getElementById('r-' + output);
        var wireLength;

        var wire = enter || exit;
        wire.removeAttribute('style');
        wire.classList.add('active');

        this.contacts[input].classList.add('input');
        this.contacts[output].classList.add('output');
    },
    encode: function (input) {
        var reflectedPosition = (input + this.wiringMap[input]) % 26;
        return reflectedPosition;
    }
};