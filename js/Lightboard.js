function Lightboard(el) {
    // this.el = document.createElement('div');
    this.el = el;

    TWC.dispatch.on('key_down', this.showKey.bind(this));
    TWC.dispatch.on('key_up', this.clearKeys.bind(this));
}

Lightboard.prototype = {
    range: "QWERTZUIOASDFGHJKPYXCVBNML",
    render: function () {
        var w = 100 / 9 + '%';
        this.glyphPositions = this.range.split('').forEach(function (letter, i) {
            var div = document.createElement('div');
            div.classList.add('lightboard-letter', 'lightboard-letter-' + letter);
            div.style.width = w;

            if (i === 9) div.style.marginLeft = 50 / 9 + '%'; // middle row has less characters

            div.insertAdjacentHTML('beforeend', '<span>' + letter + '</span>');
            this.el.appendChild(div);

        }, this);
        return this;
    },
    showKey: function (e, key) {
        console.log('showKey', key);
        console.log('this.el.id', this.el.id);
        if (this.el.id === 'input-keys') {
            this.el.querySelector('.lightboard-letter-' + key).classList.add('active');
        }
    },
    clearKeys: function () {
        this.el.querySelectorAll('.lightboard-letter').forEach(function (node) {
            node.classList.remove('active');
        });
    }
};