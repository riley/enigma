function Reflector(el) {
    this.el = el;
    this.from = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    this.to =   "EJMZALYXVBWFCRQUONTSPIKHGD".split('');  // Reflector A from wikipedia
}

Reflector.prototype = {
    render: function () {
        var svg = document.getElementById('rotors');
        var glyphGroup = document.createElementNS(ns, 'g');
        var lineGroup = document.createElementNS(ns, 'g');

        var gap = 11;

        this.from.map(function (letter, i) {
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
        this.from.forEach(function (letter, i, list) {

            if (placedLetters.indexOf(letter) > -1 || placedLetters.indexOf(this.to.indexOf(letter)) > -1) return true;

            var reflectedPosition = this.to.indexOf(letter);
            var path = document.createElementNS(ns, 'path');
            var x1 = this.from.indexOf(letter) * gap;
            var x2 = reflectedPosition * gap;
            var y = (placedLetters.length / 2 + 1) * 10;
            var d = 'M' + x1 + ',0 L' + x1 + ',' + y + 'L' + x2 + ',' + y + 'L' + x2 + ',0';
            setAttrs(path, {d: d, stroke: TWC.colors[i], fill: 'none'});

            lineGroup.appendChild(path);

            placedLetters.push(letter, this.from[reflectedPosition]);

        }, this);

        svg.appendChild(lineGroup);
        lineGroup.setAttribute('transform', 'translate(500, 70)');
        svg.appendChild(glyphGroup);
        glyphGroup.setAttribute('transform', 'translate(500, 70)');

        return this;
    },
    encode: function (input) {
        return this.to.indexOf(this.to[input]);
    }
};