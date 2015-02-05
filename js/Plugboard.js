function Plugboard(el) {
    this.el = el;
    this.to =   "YRUHQSLDPXNGOKMIEBFZCWVJAT"; // this is just Reflector B settings. ssh
    // this.to = RD.a;

    RD.dispatch.on('encoded', this.handleEncodedMessage.bind(this));
}

Plugboard.prototype = {
    stecker: function (fromIndex) {
        return fromIndex;
        // sigh. plugboard nerfed for the sake of brevity
        // return RD.a.indexOf(this.to[fromIndex]);
    },
    render: function () {
        var width = this.el.getBoundingClientRect().width;
        this.inputRegister = this.el.querySelector('.input-register');
        this.outputRegister = this.el.querySelector('.output-register');
        var plugHolder = document.getElementById('plugs');
        this.plugs = RD.a.forEach(function (letter, i, list) {
            var x = i * width / list.length;
            this.inputRegister.insertAdjacentHTML('beforeend', '<li class="plugboard-letter"><span>' + letter + '</span></li>');
            this.outputRegister.insertAdjacentHTML('beforeend', '<li class="plugboard-letter"><span>' + this.to[RD.a.indexOf(letter)] + '</span></li>');
            plugHolder.insertAdjacentHTML('beforeend', '<div class="plug"></div>');
        }, this);

        return this;
    },
    clearPositions: function () {
        this.el.querySelectorAll('.plugboard-letter').forEach(function (node) {
            node.classList.remove('forward', 'reverse');
        });
    },
    handleEncodedMessage: function (data) {
        var lastStep = data.sequence[data.sequence.length - 1];

        this.clearPositions();

        // show letters
        this.inputRegister.childNodes[lastStep.fPlugboard.in].classList.add('forward');
        this.outputRegister.childNodes[lastStep.fPlugboard.in].classList.add('forward');
        this.inputRegister.childNodes[lastStep.rPlugboard.in].classList.add('reverse');
        this.outputRegister.childNodes[lastStep.rPlugboard.in].classList.add('reverse');
    }
};
