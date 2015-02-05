function Lightboard(el) {
    // this.el = document.createElement('div');
    this.el = el;

    RD.dispatch.on('encoded', this.showKey.bind(this));
}

Lightboard.prototype = {
    letterOrder: "QWERTZUIOASDFGHJKPYXCVBNML".split(''),
    render: function () {
        var w = 100 / 9 + '%';
        this.glyphPositions = this.letterOrder.forEach(function (letter, i) {
            var div = document.createElement('div');
            div.classList.add('lightboard-letter');
            div.classList.add('lightboard-letter-' + letter);
            div.style.width = w;

            if (i === 9) div.style.marginLeft = 50 / 9 + '%'; // middle row has less characters

            div.insertAdjacentHTML('beforeend', '<span>' + letter + '</span>');
            this.el.appendChild(div);

        }, this);
        return this;
    },
    showKey: function (e, message, sequence) {
        this.clearKeys();

        var lastStep = sequence[sequence.length - 1];

        console.log('showKey', e, message);
        console.log('this.el.id', this.el.id);
        var lastLetter = message[message.length - 1];

        console.log('lastLetter', lastLetter);

        if (e.type === 'key_down') {
            // document.getElementById('input-keys').querySelector('.lightboard-letter-' + key).classList.add('active');
        } else if (e.type === 'encoded') {
            // this.el.querySelector('.lightboard-letter')
            document.getElementById('output-keys').querySelector('.lightboard-letter-' + lastLetter).classList.add('active');
        }
    },
    clearKeys: function () {
        this.el.querySelectorAll('.lightboard-letter').forEach(function (node) {
            node.classList.remove('active');
        });
    }
};