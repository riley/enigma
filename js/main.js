(function () {

    // computerphile video on enigma
    // https://www.youtube.com/watch?v=d2NWPG2gB_A

    var TAU = Math.PI * 2;
    var HALF_PI = Math.PI / 2;

    function Rotor(type) {
        this.el = document.createElement('div');
        this.el.insertAdjacentHTML('beforeend', this.template);
        this.transpose = this.variants[type]; // what the rotor will be encoded to

        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').forEach(function (letter, i, list) {
            var angle = TAU / list.length * i;
            var innerRadius = 55;
            var outerRadius = 70;
            var innerX = Math.cos(angle) * innerRadius;
            var innerY = Math.sin(angle) * innerRadius;
            var outerX = Math.cos(angle) * outerRadius;
            var outerY = Math.sin(angle) * outerRadius;

            // create the inner (ordered) ring of letters
            var inner = document.createElement('div');
            inner.classList.add('rotor-position-inner');
            inner.textContent = letter.toUpperCase();
            var transformString = 'translate(' + innerX + 'px,' + innerY + 'px) rotate(' + (angle + HALF_PI) + 'rad)';
            inner.style.WebkitTransform = inner.style.MozTransform = inner.style.msTransform = transformString;
            this.el.querySelector('.rotor-letters').appendChild(inner);

            // create the outer (jumbled) letters
            var outer = document.createElement('div');
            outer.classList.add('rotor-position-outer');
            outer.textContent = this.transpose.charAt(i);
            transformString = 'translate(' + outerX + 'px,' + outerY + 'px) rotate(' + (angle + HALF_PI) + 'rad)';
            outer.style.WebkitTransform = outer.style.MozTransform = outer.style.msTransform = transformString;
            this.el.querySelector('.rotor-letters').appendChild(outer);
        }, this);
    }

    Rotor.prototype = {
        template: '<div class="rotor-letters"></div>',
        range: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        // corresponds to army and airforce Enigmas
        // the movie wasn't accurate, so we won't strictly be either.
        variants: ["EMFITSDJVQALOWBGRXHKCPZUNY", "RUHTNVQLIGAPZXEMFJSWCODYKB", "OGSRKCANXUMJWLPQHEBTVYZDFI"],
        render: function () {
            this.el.classList.add('rotor');
            this.el.insertAdjacentHTML('beforeend', this.template);
            this.range.split('').forEach(function (glyph) {

            }, this);
            return this;
        }
    };

    function Reflector() {

    }

    function Circuit() {
        // a canvas element that draws the lines between components
    }

    function Plugboard() {
        this.from = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.to = "MNCDEXSARHGILPTYJWKQUOBFZV";
    }

    Plugboard.prototype.transform = function (letter) {
        return this.to.charAt(this.from.indexOf(letter));
    };

    function Lightboard() {
        this.el = document.createElement('div');
    }

    Lightboard.prototype = {
        range: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        render: function () {
            this.el.classList.add('lightboard');
            return this;
        }
    };

    function Enigma(config) {
        this.el = config.el;

        this.template = '<div class="rotors-container"></div>' +
            '<div class="input-lightboard"></div>' +
            '<p id="encrypt">Encryption</p>' +
            '<input type="text" >' +
            '<p id="decrypt">Decryption</p>' +
            '<input type="text" >' +
            '<div class="output-lightboard"></div">';

        this.el.insertAdjacentHTML('beforeend', this.template);

        this.rotors = [];
        for (var i = 0; i < 3; i++) {
            var rotor = new Rotor(i);
            this.rotors.push(rotor);
            this.el.querySelector('.rotors-container').appendChild(rotor.render().el);
        }

        this.inputKeys = new Lightboard();
        this.el.querySelector('.input-lightboard').appendChild(this.inputKeys.render().el);
        this.outputKeys = new Lightboard();
        this.el.querySelector('.output-lightboard').appendChild(this.outputKeys.render().el);

        var encrypt = document.getElementById('encrypt');
        var decrypt = document.getElementById('decrypt');
    }

    var enigma = new Enigma({
        el: document.getElementById('enigma')
    });

})();