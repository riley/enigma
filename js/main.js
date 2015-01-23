(function () {

    var TAU = Math.PI * 2;

    function Rotor() {
        this.el = document.createElement('div');

        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').forEach(function (letter, i, list) {
            var angle = TAU / list.length * i;
            var radius = 15;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;

            var position = document.createElement('div');
            position.classList.add('rotor-position');
            position.style.WebkitTransform = 'translate(' + x + 'px,' + y + 'px)';
            this.el.appendChild(position);
        }, this);
    }

    Rotor.prototype = {
        template: '<div class="rotor-inner"></div>',
        range: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
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
        this.from = "QVUBZNPREGYALSMCODJHKWITFX";
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
            var rotor = new Rotor();
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