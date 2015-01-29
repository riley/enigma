(function () {

    function Circuit(el) {
        // a canvas element that draws the lines between components
        this.el = el;
    }

    Circuit.prototype = {
        render: function () {
            var enigmaRect = this.el.parentNode.getBoundingClientRect();
            this.el.width = enigmaRect.width;
            this.el.height = enigmaRect.height;
            return this;
        }
    };

    function Plugboard(el) {
        this.el = el;
        // this.to =   "YRUHQSLDPXNGOKMIEBFZCWVJAT"; // this is just Reflector B settings. ssh
        this.to = TWC.a;

        TWC.dispatch.on('key_up', this.clearPositions.bind(this));

    }

    Plugboard.prototype = {
        stecker: function (letter) {
            var fromIndex = TWC.a.indexOf(letter);
            this.inputRegister.childNodes[fromIndex].classList.add('active');
            this.outputRegister.childNodes[fromIndex].classList.add('active');
            return this.to[TWC.a.indexOf(letter)];
        },
        render: function () {
            var width = this.el.getBoundingClientRect().width;
            this.inputRegister = this.el.querySelector('.input-register');
            this.outputRegister = this.el.querySelector('.output-register');
            TWC.a.forEach(function (letter, i, list) {
                var x = i * width / list.length;
                this.inputRegister.insertAdjacentHTML('beforeend', '<li class="plugboard-letter"><span>' + letter + '</span></li>');
                this.outputRegister.insertAdjacentHTML('beforeend', '<li class="plugboard-letter"><span>' + this.to[TWC.a.indexOf(letter)] + '</span></li>');
            }, this);

            return this;
        },
        clearPositions: function () {
            this.el.querySelectorAll('.plugboard-letter').forEach(function (node) {
                node.classList.remove('active');
            });
        }
    };

    function Enigma(config) {
        this.el = config.el;
        this.keyIsDown = false;

        this.template =
            '<canvas id="circuits"></canvas>' +
            '<p>Encryption</p>' +
            '<input id="encrypt" type="text" >' +
            '<div class="input-lightboard lightboard">' +
                '<p class="lightboard-label">Input Lightboard</p>' +
            '</div>' +
            '<div class="plugboard">' +
                '<ul class="input-register"></ul>' +
                '<p class="plugboard-label">Plugboard</p>' +
                '<ul class="output-register"></ul>' +
            '</div>' +
            '<div class="rotors-container clearfix">' +
                '<svg id="rotors" width="100%" height="300"></svg>' +
            '</div>' +
            '<div class="output-lightboard lightboard">' +
                '<p class="lightboard-label">Output lightboard</p>' +
            '</div>' +
            '<div id="encoded-message">' +
                '<p>Output message</p>' +
                '<p class="output-message"></div>' +
            '</div>';

        this.el.insertAdjacentHTML('beforeend', this.template);

        this.rotors = [];
        var rotorContainer = this.el.querySelector('.rotors-container');
        for (var i = 0; i < 3; i++) {
            var rotor = new Rotor(i, TWC.a.indexOf(TWC.start[i]));
            this.rotors.push(rotor);
            rotor.render();
            rotor.el.setAttribute('transform', 'translate(' + (i * 160 + 390) + ',120) rotate(180)');
            // insert the rotors before the reflector
        }

        // rotors keep track of each other so they can trip over like an odometer
        this.rotors[2].nextRotor = this.rotors[1];
        this.rotors[1].nextRotor = this.rotors[0];

        this.plugboard = new Plugboard(this.el.querySelector('.plugboard')).render();

        this.reflector = new Reflector().render();
        this.reflector.el.setAttribute('transform', 'translate(20, 60)');
        // insert the reflector immediately after the rotors

        this.inputKeys = new Lightboard(this.el.querySelector('.input-lightboard')).render();
        this.inputKeys.el.id = 'input-keys';
        this.outputKeys = new Lightboard(this.el.querySelector('.output-lightboard')).render();
        this.outputKeys.el.id = 'output-keys';

        var encrypt = document.getElementById('encrypt');
        encrypt.addEventListener('keydown', this.handleKeyDown.bind(this), false);
        encrypt.addEventListener('keyup', this.handleKeyUp.bind(this), false);

        this.circuit = new Circuit(document.getElementById('circuits')).render();

        TWC.dispatch.on('encoded', this.showLetterz.bind(this));
    }

    Enigma.prototype = {
        handleKeyDown: function (e) {

            if (!e.key) e.key = String.fromCharCode(e.keyCode);

            // console.log(e);
            // console.log('this.keyIsDown', this.keyIsDown, e.key);

            var normalFunctions = ["Backspace", "Delete", " ", "Alt", "Control", "Escape", "Shift", "OS"];

            if (normalFunctions.indexOf(e.key) > -1) return true;
            // 18 Backspace
            // 48 Delete
            // 32 " "
            // 18 Alt
            // 17 Control
            // 27 Escape
            // 16 Shift

            // have to figure out what to do when the user hits backspace

            if (this.keyIsDown && e.key === this.pressedKey) {
                e.preventDefault();
                return; // don't do anything if they're holding the key down
            }
            if (TWC.a.indexOf(e.key.toUpperCase()) > -1) { // between A and Z
                console.log(e);
                console.log(e.key.toUpperCase());
                this.keyIsDown = true;
                this.pressedKey = e.key;
                TWC.dispatch.trigger('key_down', e.key.toUpperCase());

                this.moveRotors(1); // move rotors forward one stop

                // move rotors
                // Plugboard
                // Rotor I (leftmost)
                // Rotor II (rightmost)
                // Rotor III
                // Reflector
                // Rotor III
                // Rotor II
                // Rotor I
                // plugboard
                // end result

                this.encode(e.key.toUpperCase());
            }
        },
        showLetterz: function (e, letter) {
            document.querySelector('.output-message').textContent += letter;
        },
        handleKeyUp: function (e) {
            this.keyIsDown = false;
            TWC.dispatch.trigger('key_up');
        },
        moveRotors: function (amount) {
            console.log("MOVING ROTORS");
            this.rotors[2].offset += amount;
            // rotor III is the fast rotor
        },
        encode: function (input) {
            var plugboardFirstResult = this.plugboard.stecker(input);
            console.log('plugboardFirstResult', plugboardFirstResult);
            var firstRotorForward = this.rotors[0].encode(TWC.a.indexOf(plugboardFirstResult), 'forward');
            console.log('\n');
            var secondRotorForward = this.rotors[1].encode(firstRotorForward, 'forward');
            console.log('\n');
            var thirdRotorForward = this.rotors[2].encode(secondRotorForward, 'forward');
            console.log('\n');
            var reflected = this.reflector.encode(thirdRotorForward);
            console.log('\n');
            console.log('reflected', reflected);
            console.log('\n');
            var thirdRotorReverse = this.rotors[2].encode(reflected, 'reverse');
            console.log('\n');
            var secondRotorReverse = this.rotors[1].encode(thirdRotorReverse, 'reverse');
            console.log('\n');
            var firstRotorReverse = this.rotors[0].encode(secondRotorReverse, 'reverse');
            console.log('\n');
            var plugboardSecondResult = this.plugboard.stecker(TWC.a[firstRotorReverse]);

            console.log('\noutput', plugboardSecondResult);

            TWC.dispatch.trigger('encoded', plugboardSecondResult);
        }
    };

    var enigma = new Enigma({
        el: document.getElementById('enigma')
    });

    document.getElementById('encrypt').focus();

})();