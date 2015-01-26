(function () {

    // computerphile video on enigma
    // https://www.youtube.com/watch?v=d2NWPG2gB_A

    var TAU = Math.PI * 2;
    var HALF_PI = Math.PI / 2;

    function Rotor(type, startPos) {
        this.el = document.createElement('div');
        this.startPos = startPos;
        this.transpose = this.variants[type]; // what the rotor will be encoded to
    }

    Rotor.prototype = {
        increment: Math.PI / 13,
        template: '<p class="starting-position"></p>' +
            '<div class="rotor-letters"></div>',
        range: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        // corresponds to army and airforce Enigmas
        // these are the I, II, and III rotors from a 1930 Enigma
        variants: ["EKMFLGDQVZNTOWYHXUSPAIBRCJ", "AJDKSIRUXBLHWTMCQGZNPYFVOE", "BDFHJLCPRTXVZNYEIWGAKMUSQO"],
        render: function () {
            this.el.classList.add('rotor');
            this.el.insertAdjacentHTML('beforeend', this.template);
            this.el.querySelector('.starting-position').textContent = this.startPos;

            this.glyphPositions = this.range.split('').map(function (letter, i, list) {
                var angle = TAU / list.length * i;
                var innerRadius = 55;
                var outerRadius = 70;
                var innerX = Math.cos(angle) * innerRadius;
                var innerY = Math.sin(angle) * innerRadius;
                var outerX = Math.cos(angle) * outerRadius;
                var outerY = Math.sin(angle) * outerRadius;

                // create the inner (ordered) ring of letters
                var inner = document.createElement('div');
                inner.classList.add('rotor-position', 'inner', 'noselect');
                inner.textContent = letter.toUpperCase();
                var transformString = 'translate(' + innerX + 'px,' + innerY + 'px) rotate(' + (angle + HALF_PI) + 'rad)';
                inner.style.WebkitTransform = inner.style.MozTransform = inner.style.msTransform = transformString;
                this.el.querySelector('.rotor-letters').appendChild(inner);

                // create the outer (jumbled) letters
                var outer = document.createElement('div');
                outer.classList.add('rotor-position', 'outer', 'noselect');
                outer.textContent = this.transpose.charAt(i);
                transformString = 'translate(' + outerX + 'px,' + outerY + 'px) rotate(' + (angle + HALF_PI) + 'rad)';
                outer.style.WebkitTransform = outer.style.MozTransform = outer.style.msTransform = transformString;
                this.el.querySelector('.rotor-letters').appendChild(outer);

                return {
                    inner: {x: innerX, y: innerY},
                    outer: {x: outerX, y: outerY}
                };
            }, this);

            return this;
        },
        encode: function (input, direction) {
            if (direction === 'forward') {
                return this.transpose.charAt(this.range.indexOf(input));
            } else { // after being reflected
                return this.range.charAt(this.transpose.indexOf(input));
            }
        }
    };

    function Reflector(el) {
        this.el = el;
        this.from = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.to =   "EJMZALYXVBWFCRQUONTSPIKHGD";  // Reflector A from wikipedia
    }

    Reflector.prototype = {
        render: function () {
            return this;
        },
        reflect: function (letter) {
            return this.to.charAt(this.from.indexOf(letter));
        }
    };

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
        this.from = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.to =   "YRUHQSLDPXNGOKMIEBFZCWVJAT"; // this is just Reflector B settings. ssh
    }

    Plugboard.prototype = {
        stecker: function (letter) {
            return this.to.charAt(this.from.indexOf(letter));
        },
        render: function () {
            var width = this.el.getBoundingClientRect().width;
            this.from.split('').forEach(function (letter, i, list) {
                var x = i * width / list.length;
                this.el.insertAdjacentHTML('afterbegin', '<span class="plugboard-letter" style="transform: translate(' + x + 'px, 0px)">' + letter + '</span>');
                this.el.insertAdjacentHTML('afterbegin', '<span class="plugboard-letter" style="transform: translate(' + x + 'px, 60px)">' + this.to.charAt(this.from.indexOf(letter)) + '</span>');
            }, this);
        }
    };

    function Lightboard(el) {
        // this.el = document.createElement('div');
        this.el = el;
    }

    Lightboard.prototype = {
        range: "QWERTZUIOASDFGHJKPYXCVBNML",
        render: function () {
            this.glyphPositions = this.range.split('').map(function (letter, i) {
                var x, y;
                var gap = 25;
                var vMargin = 0;
                y = 10;
                if (i < 9) {
                    // first row
                    x = i * gap;
                    y = 10 + vMargin;
                } else if (i < 17) {
                    // second row
                    x = (i % 9) * gap + 10;
                    y = 40 + vMargin;
                } else {
                    // third row
                    x = (i % 17) * gap;
                    y = 70 + vMargin;
                }

                this.el.insertAdjacentHTML('beforeend', '<span class="lightboard-letter" style="transform: translate(' + x + 'px,' + y + 'px)">' + letter + '</span>');

                return {letter: letter, x: x, y: y};
            }, this);
            return this;
        }
    };

    function Enigma(config) {
        this.el = config.el;
        this.startingLetters = "RJD";

        this.template =
            '<canvas id="circuits"></canvas>' +
            '<p>Encryption</p>' +
            '<input id="encrypt" type="text" >' +
            '<div class="input-lightboard lightboard">' +
                '<p>Input Lightboard</p>' +
            '</div>' +
            '<div class="plugboard">' +
                '<p class="plugboard-label">Plugboard</p>' +
            '</div>' +
            '<div class="rotors-container clearfix">' +
                '<div class="reflector"></div>' +
            '</div>' +
            '<div class="output-lightboard lightboard">' +
                '<p>Output lightboard</p>' +
            '</div">';

        this.el.insertAdjacentHTML('beforeend', this.template);

        this.rotors = [];
        var rotorContainer = this.el.querySelector('.rotors-container');
        for (var i = 0; i < 3; i++) {
            var rotor = new Rotor(i, this.startingLetters.charAt(i));
            this.rotors.push(rotor);
            // insert the rotors before the reflector
            rotorContainer.insertBefore(rotor.render().el, rotorContainer.lastChild);
        }

        this.plugboard = new Plugboard(this.el.querySelector('.plugboard')).render();

        this.reflector = new Reflector(this.el.querySelector('.reflector')).render();
        // insert the reflector immediately after the rotors

        this.inputKeys = new Lightboard(this.el.querySelector('.input-lightboard')).render();
        // this.el.querySelector('.input-lightboard').appendChild(this.inputKeys.render().el);
        this.outputKeys = new Lightboard(this.el.querySelector('.output-lightboard')).render();
        // this.el.querySelector('.output-lightboard').appendChild(this.outputKeys.render().el);

        var encrypt = document.getElementById('encrypt');
        console.log(encrypt);
        encrypt.addEventListener('keypress', function (e) {
            console.log(e);
        });
        encrypt.addEventListener('keydown', this.handleKeyDown.bind(this), false);
        encrypt.addEventListener('keyup', this.handleKeyUp.bind(this), false);

        this.circuit = new Circuit(document.getElementById('circuits')).render();
    }

    Enigma.prototype = {
        range: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        handleKeyDown: function (e) {
            console.log('this.isDown', this.isDown, e.key);

            // 18 Backspace
            // 48 Delete
            // 32 " "
            // 18 Alt
            // 17 Control
            // 27 Escape
            // 16 Shift

            // have to figure out what to do when the user hits backspace

            if (this.isDown) return; // don't do anything if they're holding the key down
            if (this.range.indexOf(e.key.toUpperCase()) > -1) { // between A and Z
                console.log(e);
                console.log(e.key.toUpperCase());
                this.isDown = true;

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
            }
            e.preventDefault();
        },
        handleKeyUp: function (e) {
            this.isDown = false;
        }
    };

    var enigma = new Enigma({
        el: document.getElementById('enigma')
    });

})();