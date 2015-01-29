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

        TWC.a.map(function (letter, i) {
            var circle = document.createElementNS(ns, 'circle');
            var x = i * gap;
            setAttrs(circle, {cx: x, cy: 0, r: 3, fill: 'white', stroke: 'cornflowerblue'});

            var glyph = document.createElementNS(ns, 'text');
            glyph.textContent = letter;
            setAttrs(glyph, {x: x, y: 0, fill: 'blue', 'text-anchor': 'middle', 'font-size': 10, dy: -7});

            glyphGroup.appendChild(circle);
            glyphGroup.appendChild(glyph);

            return {x: x, y: 0};
        });

        var placedLetters = [];

        // draw lines showing how reflector is wired
        TWC.a.forEach(function (letter, i, list) {

            if (placedLetters.indexOf(letter) > -1 || placedLetters.indexOf(this.wires.indexOf(letter)) > -1) return true;

            var reflectedPosition = this.wires.indexOf(letter);
            var path = document.createElementNS(ns, 'path');
            var x1 = TWC.a.indexOf(letter) * gap;
            var x2 = reflectedPosition * gap;
            var y = (placedLetters.length / 2 + 1) * 10;
            var d = 'M' + x1 + ',0 L' + x1 + ',' + y + 'L' + x2 + ',' + y + 'L' + x2 + ',0';
            setAttrs(path, {d: d, stroke: TWC.colors[i], fill: 'none'});

            lineGroup.appendChild(path);

            placedLetters.push(letter, TWC.a[reflectedPosition]);

        }, this);

        var rLabel = document.createElementNS(ns, 'text');
        rLabel.textContent = 'Reflector';
        setAttrs(rLabel, {fill: 'black', transform: 'translate(130,180)', 'text-anchor': 'middle'});

        this.el.appendChild(lineGroup);
        this.el.appendChild(glyphGroup);
        this.el.appendChild(rLabel);

        svg.appendChild(this.el);

        return this;
    },
    encode: function (input) {
        console.log('reflector input', input, TWC.a[input]);
        console.log('reflector map', this.wiringMap[input]);
        var reflectedPosition = (input + this.wiringMap[input]) % 26;
        console.log('reflectedPosition', TWC.a[reflectedPosition]);
        return reflectedPosition;
    }
};