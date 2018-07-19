// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

window.randomRange = function(min, max) {
    return Math.random() * (max - min) + min;
};

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        var dx = this.node.x - g_scrGameplay.player.x;
        var dy = this.node.y - g_scrGameplay.player.y;

        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(300000000 / (dx * dx + dy * dy), dy * randomRange(2, 3));

        if (this.node.y > g_scrGameplay.player.y) {
            this.getComponent(cc.RigidBody).angularVelocity = randomRange(-500, -300);
        }
        else {
            this.getComponent(cc.RigidBody).angularVelocity = randomRange(300, 500);
        }

        this.life = 0;
    },

    update(dt) {
        this.life += dt;

        // out of screen
        if (this.node.x > SCREEN_WIDTH * 0.5 + this.node.width * this.node.scaleX
        ||  this.node.y > SCREEN_HEIGHT * 0.5 + this.node.width * this.node.scaleX
        ||  this.node.y < -SCREEN_HEIGHT * 0.5 - this.node.width * this.node.scaleX
        ||  this.life > 2) {
            this.node.destroy();
        }
    },
});
