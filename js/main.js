(function () {

    function Enigma(config) {
        this.el = config.el;

        this.template =
            '<div class="encrypt-module">' +
                '<p class="cta">The Enigma machine encodes characters by completing a circuit through a series of a plugboard, rotors, and a reflector. <strong>Type any message into the input box to trace how the connection is made.</strong></p>' +
                '<b id="so-scary" class="so-scary">&times;</b>' +
                '<input id="encrypt" type="text" >' +
                // '<p id="under-the-hood" class="under-the-hood">INPUT MESSAGE</p>' +
                '<div class="dave-is-stepping-on-all-the-styles">' +
                    '<span class="enigma-share"></span>' +
                    '<p class="output-message">&nbsp;</p>' +
                '</div>' +
            '</div>' +
            '<div class="plugboard">' +
                '<div id="plugs"></div>' +
                '<ul class="input-register"></ul>' +
                '<p class="plugboard-label"><strong>Plugboard</strong></p>' +
                '<ul class="output-register"></ul>' +
            '</div>' +
            '<div class="rotors-container clearfix">' +
                '<ul class="directional-copy">' +
                    '<li class="entry-path-copy"><p>Entry electricity path</p></li>' +
                    '<li class="return-path-copy"><p>Return electricity path</p></li>' +
                '</ul>' +
                '<svg id="rotors" viewBox="0 40 560 200"></svg>' +
            '</div>' +
            '<div class="output-lightboard lightboard"></div>';

        this.el.insertAdjacentHTML('beforeend', this.template);

        this.rotors = [];
        var rotorContainer = this.el.querySelector('.rotors-container');
        for (var i = 0; i < 3; i++) {
            var rotor = new Rotor(i, RD.start[i], {x: i * 115 + 225, y: 120});
            this.rotors.push(rotor);
            rotor.render();
            // rotor.el.setAttribute('transform', 'translate(' + (i * 180 + 300) + ',120) rotate(180)');
        }

        // rotors keep track of each other so they can trip over like an odometer
        this.rotors[2].nextRotor = this.rotors[1];
        this.rotors[1].nextRotor = this.rotors[0];

        this.plugboard = new Plugboard(this.el.querySelector('.plugboard')).render();

        this.reflector = new Reflector({x: 85, y: 120}).render();
        // this.reflector.el.setAttribute('transform', 'translate(120, 120)');
        // insehttp://ad-assets.nytimes.com/pi/enigma/rt the reflector immediately after the rotors

        this.outputKeys = new Lightboard(this.el.querySelector('.output-lightboard')).render();
        this.outputKeys.el.id = 'output-keys';

        var encrypt = document.getElementById('encrypt');
        encrypt.addEventListener('keyup', this.handleKeyPress.bind(this), false);
        encrypt.addEventListener('paste', this.handleKeyPress.bind(this), false);

        this.circuit = new Circuit(document.getElementById('circuits'), this.rotors, this.reflector).render();

        RD.dispatch.on('encoded', this.showLetterz.bind(this));
        RD.dispatch.on('blank_message', this.eraseCode.bind(this));

        // document.getElementById('under-the-hood').addEventListener('click', this.expand.bind(this));
        // document.getElementById('so-scary').addEventListener('click', this.collapse.bind(this));
    }

    Enigma.prototype = {
        handleKeyPress: function (e) {
            this.encodeMessage(document.getElementById('encrypt').value);
        },
        showLetterz: function (e, encodedMessage, sequence) {
            document.querySelector('.output-message').textContent = encodedMessage.join('');
        },
        eraseCode: function () {
            document.querySelector('.output-message').innerHTML = '&nbsp;';
        },
        collapse: function (e) {
            document.querySelector('.under-the-hood').classList.remove('inactive');
            this.el.classList.add('collapsed');
        },
        expand: function (e) {
            document.querySelector('.under-the-hood').classList.add('inactive');
            this.el.classList.remove('collapsed');
        },
        encodeMessage: function (message) {

            this.sequence = [];

            if (!message) {
                console.log('message blank');
                RD.dispatch.trigger('blank_message');
                return;
            }

            // reset the rotors
            this.rotors.forEach(function (rotor, i) {
                rotor.offset = RD.start[i];
            });

            var encodedMessage = message.split('').map(function (inputLetter, i) {
                console.log('inputLetter', inputLetter);

                if (inputLetter === ' ') return ' ';

                if (RD.a.indexOf(inputLetter.toUpperCase()) === -1) return null;

                this.rotors[2].offset++;

                return this.encode(RD.a.indexOf(inputLetter.toUpperCase()));
            }, this).filter(function (letter) {
                return letter !== null;
            });


            console.log('sequence', this.sequence);

            if (encodedMessage[encodedMessage.length - 1] !== ' ') {
                console.log('encoded message ready', encodedMessage);
                RD.dispatch.trigger('encoded', [encodedMessage.map(function (index) { return RD.a[index] || ' '; }), this.sequence]);
            }

        },

        // input is a letter, like 'F'
        encode: function (input) {

            var step = {
                fPlugboard: { in: input, out: '' },
                fFastRotor: { in: '', out: '' },
                fMiddleRotor: { in: '', out: '' },
                fSlowRotor: { in: '', out: '' },
                reflector: { in: '', out: '' },
                rSlowRotor: { in: '', out: '' },
                rMiddleRotor: { in: '', out: '' },
                rFastRotor: { in: '', out: '' },
                rPlugboard: { in: '', out: '' }
            };

            step.fPlugboard.out = step.fFastRotor.in = this.plugboard.stecker(input);
            step.fFastRotor.out = step.fMiddleRotor.in = this.rotors[2].encode(step.fPlugboard.out, 'forward');
            step.fMiddleRotor.out = step.fSlowRotor.in = this.rotors[1].encode(step.fFastRotor.out, 'forward');
            step.fSlowRotor.out = step.reflector.in = this.rotors[0].encode(step.fMiddleRotor.out, 'forward');
            step.reflector.out = step.rSlowRotor.in = this.reflector.encode(step.fSlowRotor.out);
            step.rSlowRotor.out = step.rMiddleRotor.in = this.rotors[0].encode(step.reflector.out, 'reverse');
            step.rMiddleRotor.out = step.rFastRotor.in = this.rotors[1].encode(step.rSlowRotor.out, 'reverse');
            step.rFastRotor.out = step.rPlugboard.in = this.rotors[2].encode(step.rMiddleRotor.out, 'reverse');
            step.rPlugboard.out = this.plugboard.stecker(step.rFastRotor.out);

            this.sequence.push(step);

            return step.rPlugboard.out;
        }
    };

    RD.enigma = new Enigma({
        el: document.getElementById('enigma')
    });

    console.log('new enigma created');

})();