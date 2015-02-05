function Circuit(el, rotors, reflector) {
    // a canvas element that draws the lines between components
    this.el = el;

    this.rotors = rotors;
    this.reflector = reflector;

    RD.dispatch.on('encoded', this.showSequence.bind(this));
    RD.dispatch.on('blank_message', this.hideSequence.bind(this));
}

Circuit.prototype = {
    markers: {in: {x: 538, y: 65 }, out: {x: 538, y: 180}},
    render: function () {

        var svg = document.getElementById('rotors');

        var circuits = this.circuits = document.createElementNS(ns, 'g');
        circuits.id = 'circuits';
        var inputBkd = document.createElementNS(ns, 'circle');
        var outputBkd = document.createElementNS(ns, 'circle');
        setAttrs(inputBkd, {cx: 0, cy: 0, r: 20});
        setAttrs(outputBkd, {cx: 0, cy: 0, r: 20});
        var inputLetter = document.createElementNS(ns, 'g');
        var outputLetter = document.createElementNS(ns, 'g');
        inputLetter.classList.add('circuits-input-letter');
        outputLetter.classList.add('circuits-output-letter');


        this.inputGlyph = document.createElementNS(ns, 'text');
        this.inputGlyph.classList.add('input-letter');
        this.inputGlyph.setAttribute('dy', 10);
        this.inputGlyph.textContent = ' ';
        setAttrs(inputLetter, {transform: 'translate(' + this.markers.in.x + ',' + this.markers.in.y + ')'});

        this.outputGlyph = document.createElementNS(ns, 'text');
        this.outputGlyph.classList.add('output-letter');
        this.outputGlyph.setAttribute('dy', 10);
        this.outputGlyph.textContent = ' ';
        setAttrs(outputLetter, {transform: 'translate(' + this.markers.out.x + ',' + this.markers.out.y + ')'});

        var inLabel = document.createElementNS(ns, 'text');
        inLabel.classList.add('circuits-input-label');
        inLabel.textContent = 'INPUT';
        setAttrs(inLabel, {dy: 34});

        var outLabel = document.createElementNS(ns, 'text');
        outLabel.classList.add('circuits-output-label');
        outLabel.textContent = 'OUTPUT';
        setAttrs(outLabel, {dy: 34});

        inputLetter.appendChild(inputBkd);
        inputLetter.appendChild(this.inputGlyph);
        inputLetter.appendChild(inLabel);

        outputLetter.appendChild(outputBkd);
        outputLetter.appendChild(this.outputGlyph);
        outputLetter.appendChild(outLabel);

        var wires = document.createElementNS(ns, 'g');


        this.circuits.appendChild(wires);
        this.circuits.appendChild(inputLetter);
        this.circuits.appendChild(outputLetter);


        var glyphs = {
            // 'IIIf': {x: 700, y: 105},
            'IIf': {x: 398, y: 75}, // fast to middle
            'If': {x: 280, y: 75}, // middle to slow
            'Rf': {x: 165, y: 75}, // slow to reflector
            'Rr': {x: 168, y: 165}, // reflector to slow
            'Ir': {x: 283, y: 165}, // slow to middle
            'IIr': {x: 398, y: 165}, // middle to fast
            // 'IIIr': {x: 698, y: 135}
        };

        this.glyphs = Object.keys(glyphs).map(function (key) {
            var glyph = glyphs[key];

            glyph.g = document.createElementNS(ns, 'g');
            glyph.g.classList.add('trip-group');
            glyph.g.id = key;
            glyph.bkd = document.createElementNS(ns, 'polygon');
            glyph.bkd.setAttribute('points', '-10,-15 15,0 -10,15');
            glyph.letter = document.createElementNS(ns, 'text');
            glyph.letter.classList.add('trip-glyph');
            glyph.letter.setAttribute('dy', 4);
            glyph.letter.textContent = ' ';

            glyph.g.appendChild(glyph.bkd);
            glyph.g.appendChild(glyph.letter);

            glyph.g.setAttribute('transform', 'translate(' + glyph.x + ',' + glyph.y + ')');

            if (key === 'IIIf' || key === 'IIf' || key === 'If' || key === 'Rf') {
                glyph.bkd.setAttribute('transform', 'rotate(180)');
            } else {

            }

            circuits.appendChild(glyph.g);

            return glyph;
        });

        svg.appendChild(circuits);

        return this;
    },
    showSequence: function (e, message, sequence) {
        var lastStep = sequence[sequence.length - 1];
        this.inputGlyph.textContent = RD.a[lastStep.fPlugboard.in];
        this.outputGlyph.textContent = RD.a[lastStep.rPlugboard.out];

        // buckle up. this is going to get hairy. imminent deadline code ahead

        document.getElementById('IIf').querySelector('text').textContent = RD.a[lastStep.fFastRotor.out];
        document.getElementById('If').querySelector('text').textContent = RD.a[lastStep.fMiddleRotor.out];
        document.getElementById('Rf').querySelector('text').textContent = RD.a[lastStep.fSlowRotor.out];
        document.getElementById('Rr').querySelector('text').textContent = RD.a[lastStep.reflector.out];
        document.getElementById('Ir').querySelector('text').textContent = RD.a[lastStep.rSlowRotor.out];
        document.getElementById('IIr').querySelector('text').textContent = RD.a[lastStep.rMiddleRotor.out];

    },
    hideSequence: function () {

    },
    empty: function () {

    }
};