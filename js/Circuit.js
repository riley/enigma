function Circuit(el) {
    // a canvas element that draws the lines between components
    this.el = el;

    TWC.dispatch.on('stecker', this.plugboardLine.bind(this));
}

Circuit.prototype = {
    wireColor: 'red',
    strokeWidth: 2,
    render: function () {
        var enigmaRect = this.el.parentNode.getBoundingClientRect();
        this.el.width = enigmaRect.width;
        this.el.height = enigmaRect.height;
        this.c = this.el.getContext('2d');
        return this;
    },
    plugboardLine: function (e, nodes) {
        this.c.strokeStyle = this.wireColor;
        this.c.lineWidth = this.strokeWidth;

        console.log(nodes);
    },
    empty: function () {
        this.c.clearRect(0, 0, this.el.width, this.el.height);
    }
};